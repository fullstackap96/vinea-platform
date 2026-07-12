import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const requireStaffMock = vi.hoisted(() => vi.fn())
const resolveWriteParishMock = vi.hoisted(() => vi.fn())
const createAdminMock = vi.hoisted(() => vi.fn())
const writeAuditEventMock = vi.hoisted(() => vi.fn())
const logServerErrorMock = vi.hoisted(() => vi.fn())

vi.mock('server-only', () => ({}))
vi.mock('@/lib/server/requireStaff', () => ({ requireStaffFromRequest: requireStaffMock }))
vi.mock('@/lib/server/staffWriteParishContext', () => ({
  resolveStaffWriteParishContext: resolveWriteParishMock,
}))
vi.mock('@/lib/server/activeStaffParishContext', () => ({
  ACTIVE_STAFF_PARISH_COOKIE: 'vinea_active_parish_id',
  resolveActiveStaffParishContext: vi.fn(),
}))
vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: createAdminMock,
}))
vi.mock('@/lib/server/auditLog', () => ({ writeAuditEvent: writeAuditEventMock }))
vi.mock('@/lib/server/safeErrorLogging', () => ({ logServerError: logServerErrorMock }))
vi.mock('@/lib/server/sameOriginMutation', () => ({
  rejectCrossOriginMutation: vi.fn(() => null),
}))

import { POST } from '@/app/api/imports/route'

function importRequest() {
  return new NextRequest('http://localhost/api/imports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      kind: 'people',
      fileName: 'safe-fixture.csv',
      commit: true,
      rows: [
        {
          rowNumber: 2,
          values: {
            firstName: 'Synthetic',
            lastName: 'Parishioner',
            email: 'synthetic@example.test',
            phone: '',
            notes: '',
          },
        },
      ],
    }),
  })
}

function adminFor(options: {
  insertedIds: string[]
  completedBatchId?: string | null
  failedBatchId?: string | null
}) {
  const importBatchPayloads: Array<Record<string, unknown>> = []
  const peopleInsert = vi.fn(() => ({
    select: vi.fn(async () => ({
      data: options.insertedIds.map((id) => ({ id })),
      error: null,
    })),
  }))
  const batchInsert = vi.fn((payload: Record<string, unknown>) => {
    importBatchPayloads.push(payload)
    const id = payload.status === 'failed'
      ? options.failedBatchId === undefined
        ? 'failed-batch-a'
        : options.failedBatchId
      : options.completedBatchId === undefined
        ? 'completed-batch-a'
        : options.completedBatchId
    const result = async () => ({ data: id ? { id } : null, error: null })
    return {
      select: vi.fn(() => ({
        single: vi.fn(result),
        maybeSingle: vi.fn(result),
      })),
    }
  })
  const from = vi.fn((table: string) => {
    if (table === 'people') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn(async () => ({ data: [], error: null })),
          })),
        })),
        insert: peopleInsert,
      }
    }
    if (table === 'import_batches') return { insert: batchInsert }
    throw new Error(`Unexpected table: ${table}`)
  })
  return { admin: { from }, peopleInsert, batchInsert, importBatchPayloads }
}

describe('imports persistence confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireStaffMock.mockResolvedValue({
      ok: true,
      staff: { email: 'safe-staff@example.test' },
      supabase: {},
    })
    resolveWriteParishMock.mockResolvedValue({
      ok: true,
      parishId: 'parish-a',
      source: 'membership',
      requestedParishId: null,
    })
    writeAuditEventMock.mockResolvedValue(true)
  })

  it('reports a created row only after row and completed-batch persistence are confirmed', async () => {
    const fixture = adminFor({ insertedIds: ['person-a'] })
    createAdminMock.mockReturnValue(fixture.admin)

    const response = await POST(importRequest())
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({
      ok: true,
      result: { batchId: 'completed-batch-a', createdCount: 1, skippedCount: 0 },
    })
    expect(writeAuditEventMock).toHaveBeenCalledTimes(1)
    expect(fixture.importBatchPayloads).toEqual([
      expect.objectContaining({ status: 'completed', created_count: 1, skipped_count: 0 }),
    ])
  })

  it('rejects an accepted zero-row import and records the confirmed count only', async () => {
    const fixture = adminFor({ insertedIds: [] })
    createAdminMock.mockReturnValue(fixture.admin)

    const response = await POST(importRequest())

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'Could not import rows.',
    })
    expect(writeAuditEventMock).not.toHaveBeenCalled()
    expect(fixture.importBatchPayloads).toEqual([
      expect.objectContaining({ status: 'failed', created_count: 0, skipped_count: 1 }),
    ])
  })

  it('rejects a missing completed-batch row without false audit history', async () => {
    const fixture = adminFor({ insertedIds: ['person-a'], completedBatchId: null })
    createAdminMock.mockReturnValue(fixture.admin)

    const response = await POST(importRequest())

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      partial: true,
      completed: {
        rowsCreated: 1,
        batchRecorded: false,
      },
      error: 'Could not record import batch.',
    })
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('documents confirmed counts, partial recovery, privacy, and non-transaction boundaries', () => {
    const doc = readFileSync(
      join(process.cwd(), 'docs/IMPORT_COMMIT_PERSISTENCE_BOUNDARY_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'returned rows as the source of truth',
      'confirmed returned-row count',
      'must return an id',
      'This is not a transaction',
      'Import filenames remain excluded from audit metadata',
      'No production or shared-QA access',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
