import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: vi.fn(),
}))

import { checkDurableRateLimit } from './durableRateLimit'

function adminWithRpc(result: { data?: unknown; error?: { code?: string; message?: string } | null }) {
  return {
    rpc: vi.fn().mockResolvedValue({
      data: result.data ?? null,
      error: result.error ?? null,
    }),
  }
}

describe('checkDurableRateLimit', () => {
  it('allows requests when the durable RPC returns ok', async () => {
    const admin = adminWithRpc({ data: [{ ok: true, retry_after_seconds: 0 }] })

    await expect(
      checkDurableRateLimit({
        admin: admin as never,
        key: 'public-intake:127.0.0.1',
        limit: 8,
        windowMs: 60_000,
      })
    ).resolves.toEqual({ ok: true })

    expect(admin.rpc).toHaveBeenCalledWith('check_public_intake_rate_limit', {
      p_key: 'public-intake:127.0.0.1',
      p_limit: 8,
      p_window_seconds: 60,
    })
  })

  it('returns retry information when the durable RPC blocks a request', async () => {
    const admin = adminWithRpc({ data: [{ ok: false, retry_after_seconds: 42 }] })

    await expect(
      checkDurableRateLimit({
        admin: admin as never,
        key: 'public-intake:127.0.0.1',
        limit: 8,
        windowMs: 60_000,
      })
    ).resolves.toEqual({ ok: false, retryAfterSeconds: 42 })
  })

  it('falls back to the in-memory limiter when the durable RPC is not deployed yet', async () => {
    const admin = adminWithRpc({
      error: {
        code: 'PGRST202',
        message: 'Could not find the function public.check_public_intake_rate_limit in the schema cache',
      },
    })

    const first = await checkDurableRateLimit({
      admin: admin as never,
      key: 'public-intake:fallback-test',
      limit: 1,
      windowMs: 60_000,
    })
    const second = await checkDurableRateLimit({
      admin: admin as never,
      key: 'public-intake:fallback-test',
      limit: 1,
      windowMs: 60_000,
    })

    expect(first).toEqual({ ok: true })
    expect(second).toMatchObject({ ok: false })
  })

  it('throws unexpected RPC errors instead of hiding database failures', async () => {
    const admin = adminWithRpc({
      error: {
        code: '42501',
        message: 'permission denied',
      },
    })

    await expect(
      checkDurableRateLimit({
        admin: admin as never,
        key: 'public-intake:127.0.0.1',
        limit: 8,
        windowMs: 60_000,
      })
    ).rejects.toMatchObject({ code: '42501' })
  })
})
