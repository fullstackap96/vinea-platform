import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  createRequestNotificationProviderOptions,
  REQUEST_NOTIFICATION_PROVIDER_TIMEOUT_MS,
} from './requestNotificationDelivery'

describe('request notification provider delivery boundary', () => {
  it('creates a deterministic opaque key from verified parish/request scope', () => {
    const input = {
      parishId: 'private-parish-id',
      requestId: 'private-request-id',
      timeoutMs: 20,
    }
    const first = createRequestNotificationProviderOptions(input)
    const second = createRequestNotificationProviderOptions(input)

    expect(first.idempotencyKey).toBe(second.idempotencyKey)
    expect(first.idempotencyKey).toMatch(/^vinea-request-notification-[a-f0-9]{64}$/)
    expect(first.idempotencyKey).not.toContain(input.parishId)
    expect(first.idempotencyKey).not.toContain(input.requestId)
  })

  it('changes the key when verified tenant or request ownership changes', () => {
    const first = createRequestNotificationProviderOptions({
      parishId: 'parish-a',
      requestId: 'request-1',
    })
    const otherParish = createRequestNotificationProviderOptions({
      parishId: 'parish-b',
      requestId: 'request-1',
    })
    const otherRequest = createRequestNotificationProviderOptions({
      parishId: 'parish-a',
      requestId: 'request-2',
    })

    expect(otherParish.idempotencyKey).not.toBe(first.idempotencyKey)
    expect(otherRequest.idempotencyKey).not.toBe(first.idempotencyKey)
  })

  it('owns a bounded provider signal without changing the production default', async () => {
    const options = createRequestNotificationProviderOptions({
      parishId: 'parish-a',
      requestId: 'request-1',
      timeoutMs: 5,
    })

    expect(REQUEST_NOTIFICATION_PROVIDER_TIMEOUT_MS).toBe(12_000)
    expect(options.signal.aborted).toBe(false)
    await new Promise((resolve) => options.signal.addEventListener('abort', resolve, { once: true }))
    expect(options.signal.aborted).toBe(true)
  })
})
