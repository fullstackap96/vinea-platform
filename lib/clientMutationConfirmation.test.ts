import { afterEach, describe, expect, it, vi } from 'vitest'

import { awaitClientMutationConfirmation } from './clientMutationConfirmation'

afterEach(() => {
  vi.useRealTimers()
})

describe('awaitClientMutationConfirmation', () => {
  it('returns a confirmed value before the deadline', async () => {
    await expect(
      awaitClientMutationConfirmation(Promise.resolve({ ok: true }), 100),
    ).resolves.toEqual({ confirmed: true, value: { ok: true } })
  })

  it('returns an unconfirmed result after the deadline', async () => {
    vi.useFakeTimers()
    const pending = new Promise<string>(() => undefined)
    const confirmation = awaitClientMutationConfirmation(pending, 100)

    await vi.advanceTimersByTimeAsync(100)

    await expect(confirmation).resolves.toEqual({ confirmed: false })
  })

  it('preserves a rejection that arrives before the deadline', async () => {
    await expect(
      awaitClientMutationConfirmation(Promise.reject(new Error('transport')), 100),
    ).rejects.toThrow('transport')
  })

  it('rejects invalid deadlines before waiting', async () => {
    await expect(
      awaitClientMutationConfirmation(Promise.resolve('unused'), 0),
    ).rejects.toThrow('positive finite number')
  })
})
