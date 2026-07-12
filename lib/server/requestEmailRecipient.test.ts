import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  loadStoredRequestEmailRecipient,
  requestEmailRecipientTestInternals,
} from '@/lib/server/requestEmailRecipient'

type RowResult = { data: Record<string, unknown> | null; error: Error | null }

function adminClient(results: { requests: RowResult; parishioners: RowResult }) {
  return {
    from(table: 'requests' | 'parishioners') {
      return {
        select() {
          return {
            eq() {
              return {
                maybeSingle: async () => results[table],
              }
            },
          }
        },
      }
    },
  }
}

describe('stored request email recipient', () => {
  it('loads the email only through the request parishioner relationship in the same parish', async () => {
    const admin = adminClient({
      requests: {
        data: { id: 'request-1', parishioner_id: 'parishioner-1' },
        error: null,
      },
      parishioners: {
        data: { parish_id: 'parish-a', email: ' family@example.test ' },
        error: null,
      },
    })

    await expect(
      loadStoredRequestEmailRecipient(admin as never, {
        requestId: 'request-1',
        parishId: 'parish-a',
      }),
    ).resolves.toEqual({ email: 'family@example.test' })
  })

  it('fails closed for a mismatched parish relationship or unusable stored email', async () => {
    const mismatched = adminClient({
      requests: {
        data: { id: 'request-1', parishioner_id: 'parishioner-1' },
        error: null,
      },
      parishioners: {
        data: { parish_id: 'parish-b', email: 'family@example.test' },
        error: null,
      },
    })
    const invalidEmail = adminClient({
      requests: {
        data: { id: 'request-1', parishioner_id: 'parishioner-1' },
        error: null,
      },
      parishioners: {
        data: { parish_id: 'parish-a', email: 'not an email' },
        error: null,
      },
    })

    await expect(
      loadStoredRequestEmailRecipient(mismatched as never, {
        requestId: 'request-1',
        parishId: 'parish-a',
      }),
    ).resolves.toBeNull()
    await expect(
      loadStoredRequestEmailRecipient(invalidEmail as never, {
        requestId: 'request-1',
        parishId: 'parish-a',
      }),
    ).resolves.toBeNull()
  })

  it('rejects missing request relationships and propagates database failures', async () => {
    const missing = adminClient({
      requests: { data: null, error: null },
      parishioners: { data: null, error: null },
    })
    const failed = adminClient({
      requests: { data: null, error: new Error('request lookup failed') },
      parishioners: { data: null, error: null },
    })

    await expect(
      loadStoredRequestEmailRecipient(missing as never, {
        requestId: 'request-1',
        parishId: 'parish-a',
      }),
    ).resolves.toBeNull()
    await expect(
      loadStoredRequestEmailRecipient(failed as never, {
        requestId: 'request-1',
        parishId: 'parish-a',
      }),
    ).rejects.toThrow('request lookup failed')
  })

  it('accepts only trimmed non-whitespace email-like values', () => {
    const { normalizeEmail } = requestEmailRecipientTestInternals

    expect(normalizeEmail(' family@example.test ')).toBe('family@example.test')
    expect(normalizeEmail('family example@test')).toBeNull()
    expect(normalizeEmail('family.example.test')).toBeNull()
    expect(normalizeEmail(null)).toBeNull()
  })
})
