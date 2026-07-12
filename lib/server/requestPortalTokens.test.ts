import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  createRequestPortalToken,
  isRequestPortalTokensTableMissing,
  requestPortalTokenTestInternals,
} from './requestPortalTokens'

describe('requestPortalTokens', () => {
  it('detects missing family portal token migrations', () => {
    expect(
      isRequestPortalTokensTableMissing({
        code: 'PGRST205',
        message: "Could not find the table 'public.request_portal_tokens' in the schema cache",
      })
    ).toBe(true)

    expect(
      isRequestPortalTokensTableMissing({
        code: 'PGRST205',
        message: "Could not find the table 'public.request_documents' in the schema cache",
      })
    ).toBe(false)
  })

  it('returns a one-time raw token only after id and expiry persistence are confirmed', async () => {
    let persistedExpiresAt = ''
    const builder = {
      insert: vi.fn(),
      select: vi.fn(),
      single: vi.fn(async () => ({
        data: { id: 'token-row-a', expires_at: persistedExpiresAt },
        error: null,
      })),
    }
    builder.insert.mockImplementation((value: { expires_at: string }) => {
      persistedExpiresAt = value.expires_at.replace('Z', '+00:00')
      return builder
    })
    builder.select.mockReturnValue(builder)
    const admin = { from: vi.fn(() => builder) }

    const result = await createRequestPortalToken({
      admin: admin as never,
      parishId: 'parish-a',
      requestId: 'request-a',
      expiresInDays: 30,
    })

    expect(result.tokenId).toBe('token-row-a')
    expect(result.expiresAt).toBe(persistedExpiresAt)
    expect(result.rawToken).toMatch(/^[A-Za-z0-9_-]{40,}$/)
    expect(builder.select).toHaveBeenCalledWith('id, expires_at')
  })

  it.each([
    ['zero-row result', null],
    ['missing token id', { id: null, expires_at: 'unused' }],
    ['mismatched expiry', { id: 'token-row-a', expires_at: '2000-01-01T00:00:00.000Z' }],
  ])('does not expose a raw token after %s', async (_label, data) => {
    const builder = {
      insert: vi.fn(),
      select: vi.fn(),
      single: vi.fn().mockResolvedValue({ data, error: null }),
    }
    builder.insert.mockReturnValue(builder)
    builder.select.mockReturnValue(builder)
    const admin = { from: vi.fn(() => builder) }

    await expect(
      createRequestPortalToken({
        admin: admin as never,
        parishId: 'parish-a',
        requestId: 'request-a',
        expiresInDays: 30,
      }),
    ).rejects.toThrow('Family portal token persistence could not be confirmed.')
  })

  it('confirms family portal usage telemetry with a matched token row', async () => {
    const builder = {
      update: vi.fn(),
      eq: vi.fn(),
      select: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'token-row-a' }, error: null }),
    }
    builder.update.mockReturnValue(builder)
    builder.eq.mockReturnValue(builder)
    builder.select.mockReturnValue(builder)
    const admin = { from: vi.fn(() => builder) }

    await expect(
      requestPortalTokenTestInternals.recordFamilyPortalTokenUse({
        admin: admin as never,
        tokenId: 'token-row-a',
        usedAt: '2026-07-11T12:00:00.000Z',
      }),
    ).resolves.toBe(true)

    expect(builder.select).toHaveBeenCalledWith('id')
  })

  it.each([
    ['returned error', { data: null, error: new Error('write failed') }],
    ['zero-row result', { data: null, error: null }],
  ])('keeps family access available after a %s usage telemetry failure', async (_label, result) => {
    const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const builder = {
      update: vi.fn(),
      eq: vi.fn(),
      select: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue(result),
    }
    builder.update.mockReturnValue(builder)
    builder.eq.mockReturnValue(builder)
    builder.select.mockReturnValue(builder)
    const admin = { from: vi.fn(() => builder) }

    await expect(
      requestPortalTokenTestInternals.recordFamilyPortalTokenUse({
        admin: admin as never,
        tokenId: 'token-row-a',
        usedAt: '2026-07-11T12:00:00.000Z',
      }),
    ).resolves.toBe(false)

    const warning = JSON.stringify(warningSpy.mock.calls)
    expect(warning).toContain('usage state not recorded')
    expect(warning).not.toContain('token-row-a')
  })

  it('keeps family access available after thrown usage telemetry failure', async () => {
    const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const builder = {
      update: vi.fn().mockImplementation(() => {
        throw new Error('write threw')
      }),
    }
    const admin = { from: vi.fn(() => builder) }

    await expect(
      requestPortalTokenTestInternals.recordFamilyPortalTokenUse({
        admin: admin as never,
        tokenId: 'token-row-a',
        usedAt: '2026-07-11T12:00:00.000Z',
      }),
    ).resolves.toBe(false)

    expect(JSON.stringify(warningSpy.mock.calls)).not.toContain('token-row-a')
  })
})
