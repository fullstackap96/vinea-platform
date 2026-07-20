import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ClientOperationTimeoutError,
  withClientOperationDeadline,
} from './clientOperationDeadline'

afterEach(() => {
  vi.useRealTimers()
})

describe('withClientOperationDeadline', () => {
  it('returns a confirmed operation result', async () => {
    await expect(withClientOperationDeadline(Promise.resolve('confirmed'), 1_000)).resolves.toBe(
      'confirmed',
    )
  })

  it('rejects a stalled operation with a recognizable safe timeout type', async () => {
    vi.useFakeTimers()
    const result = withClientOperationDeadline(new Promise<never>(() => {}), 50)
    const rejection = expect(result).rejects.toBeInstanceOf(ClientOperationTimeoutError)

    await vi.advanceTimersByTimeAsync(50)

    await rejection
  })

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid timeout %s before starting a timer',
    async (timeoutMs) => {
      await expect(
        withClientOperationDeadline(Promise.resolve('unused'), timeoutMs),
      ).rejects.toBeInstanceOf(RangeError)
    },
  )
})
