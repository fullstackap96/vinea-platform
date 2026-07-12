import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  AI_PROVIDER_TIMEOUT_MS,
  createAiProviderRequestOptions,
} from './aiProviderDeadline'

describe('AI provider deadline', () => {
  it('uses a staff-friendly bounded default', () => {
    const options = createAiProviderRequestOptions()

    expect(AI_PROVIDER_TIMEOUT_MS).toBe(30_000)
    expect(options.signal).toBeInstanceOf(AbortSignal)
    expect(options.signal.aborted).toBe(false)
  })

  it('aborts a custom short request and rejects invalid timeouts', async () => {
    const options = createAiProviderRequestOptions(5)
    await new Promise((resolve) =>
      options.signal.addEventListener('abort', resolve, { once: true }),
    )
    expect(options.signal.aborted).toBe(true)

    expect(() => createAiProviderRequestOptions(0)).toThrow(RangeError)
    expect(() => createAiProviderRequestOptions(Number.NaN)).toThrow(RangeError)
  })
})
