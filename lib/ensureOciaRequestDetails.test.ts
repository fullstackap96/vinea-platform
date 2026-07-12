import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import {
  ensureOciaRequestDetailsIfMissing,
  OCIA_DETAILS_ACCESS_ERROR,
  OCIA_DETAILS_CREATE_ERROR,
  OCIA_DETAILS_PRESENCE_SELECT,
  OCIA_PLACEHOLDER_PARISH_STATUS,
} from './ensureOciaRequestDetails'

type QueryResult = {
  data: Record<string, unknown> | null
  error: { message: string } | null
}

function queryBuilder(result: QueryResult) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
}

function supabaseWithResults(...results: QueryResult[]) {
  const builders = results.map(queryBuilder)
  return {
    from: vi.fn(() => {
      const builder = builders.shift()
      if (!builder) throw new Error('Unexpected Supabase query')
      return builder
    }),
  }
}

describe('ensureOciaRequestDetailsIfMissing', () => {
  it('returns an existing OCIA detail row without inserting', async () => {
    const existing = { id: 'ocia-detail-1', request_id: 'request-1' }
    const supabase = supabaseWithResults({ data: existing, error: null })

    await expect(
      ensureOciaRequestDetailsIfMissing(supabase as never, 'request-1')
    ).resolves.toEqual({
      data: { request_id: 'request-1' },
      error: null,
    })

    expect(supabase.from).toHaveBeenCalledTimes(1)
    expect(vi.mocked(supabase.from).mock.results[0]?.value.select).toHaveBeenCalledWith(
      OCIA_DETAILS_PRESENCE_SELECT,
    )
  })

  it('inserts a placeholder row when none exists', async () => {
    const inserted = { id: 'ocia-detail-2', request_id: 'request-2' }
    const supabase = supabaseWithResults(
      { data: null, error: null },
      { data: inserted, error: null }
    )

    await expect(
      ensureOciaRequestDetailsIfMissing(supabase as never, 'request-2')
    ).resolves.toEqual({
      data: { request_id: 'request-2' },
      error: null,
    })

    const insertBuilder = vi.mocked(supabase.from).mock.results[1]?.value
    expect(insertBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        request_id: 'request-2',
        parishioner_status: OCIA_PLACEHOLDER_PARISH_STATUS,
      })
    )
    expect(insertBuilder.select).toHaveBeenCalledWith(OCIA_DETAILS_PRESENCE_SELECT)
  })

  it('returns a concurrent row after an insert race using the same minimal projection', async () => {
    const raced = { id: 'ocia-detail-3', request_id: 'request-3' }
    const supabase = supabaseWithResults(
      { data: null, error: null },
      { data: null, error: { message: 'duplicate key' } },
      { data: raced, error: null },
    )

    await expect(
      ensureOciaRequestDetailsIfMissing(supabase as never, 'request-3'),
    ).resolves.toEqual({
      data: { request_id: 'request-3' },
      error: null,
    })

    for (const result of vi.mocked(supabase.from).mock.results) {
      expect(result.value.select).toHaveBeenCalledWith(OCIA_DETAILS_PRESENCE_SELECT)
    }
  })

  it('returns a safe access message instead of raw select errors', async () => {
    const supabase = supabaseWithResults({
      data: null,
      error: {
        message:
          'permission denied for table ocia_request_details using postgres://postgres:secret@example',
      },
    })

    await expect(
      ensureOciaRequestDetailsIfMissing(supabase as never, 'request-3')
    ).resolves.toEqual({
      data: null,
      error: OCIA_DETAILS_ACCESS_ERROR,
    })
  })

  it('returns a safe create message instead of raw insert or race errors', async () => {
    const supabase = supabaseWithResults(
      { data: null, error: null },
      {
        data: null,
        error: {
          message:
            'duplicate key value violates unique constraint for ocia_request_details request-4',
        },
      },
      {
        data: null,
        error: {
          message: 'schema cache failure for ocia_request_details',
        },
      }
    )

    await expect(
      ensureOciaRequestDetailsIfMissing(supabase as never, 'request-4')
    ).resolves.toEqual({
      data: null,
      error: OCIA_DETAILS_CREATE_ERROR,
    })
  })

  it('keeps wildcard reads out of the OCIA detail presence helper', () => {
    const source = readFileSync(
      join(process.cwd(), 'lib', 'ensureOciaRequestDetails.ts'),
      'utf8',
    )

    expect(source).toContain("export const OCIA_DETAILS_PRESENCE_SELECT = 'request_id'")
    expect(source).toContain('.select(OCIA_DETAILS_PRESENCE_SELECT)')
    expect(source).not.toContain(".select('*')")
  })

  it('documents the minimal presence contract and preserved production gates', () => {
    const evidence = readFileSync(
      join(
        process.cwd(),
        'docs',
        'OCIA_DETAIL_PRESENCE_PROJECTION_BOUNDARY_20260710.md',
      ),
      'utf8',
    )

    for (const phrase of [
      'OCIA_DETAIL_PRESENCE_PROJECTION_BOUNDARY_IMPLEMENTED_20260710',
      '`OCIA_DETAILS_PRESENCE_SELECT`',
      'only `request_id`',
      'Concurrent insert or unique-conflict races',
      'No production access',
      'No migration or operational RLS change',
      'Existing production-sensitive approval gates remain locked',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
