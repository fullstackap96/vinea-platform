import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  createStaffEmailProviderRequestOptions,
  isValidStaffEmailDeliveryAttemptId,
  STAFF_EMAIL_PROVIDER_TIMEOUT_MS,
} from './staffEmailDelivery'

describe('staff email delivery provider boundary', () => {
  it('accepts only UUID delivery attempt identifiers', () => {
    expect(isValidStaffEmailDeliveryAttemptId('9d629d9c-a32e-4fbf-a403-93aaeba7a0ba')).toBe(true)
    expect(isValidStaffEmailDeliveryAttemptId('request-1')).toBe(false)
    expect(isValidStaffEmailDeliveryAttemptId('')).toBe(false)
  })

  it('builds a deterministic, opaque idempotency key for one request attempt', () => {
    const input = {
      requestId: 'private-request-id',
      deliveryAttemptId: '9d629d9c-a32e-4fbf-a403-93aaeba7a0ba',
      timeoutMs: 20,
    }
    const first = createStaffEmailProviderRequestOptions(input)
    const second = createStaffEmailProviderRequestOptions(input)

    expect(first.idempotencyKey).toBe(second.idempotencyKey)
    expect(first.idempotencyKey).toMatch(/^vinea-request-email-[a-f0-9]{64}$/)
    expect(first.idempotencyKey).not.toContain(input.requestId)
    expect(first.idempotencyKey).not.toContain(input.deliveryAttemptId)
  })

  it('owns a bounded provider signal without changing the production default', async () => {
    const options = createStaffEmailProviderRequestOptions({
      requestId: 'request-1',
      deliveryAttemptId: '9d629d9c-a32e-4fbf-a403-93aaeba7a0ba',
      timeoutMs: 5,
    })

    expect(STAFF_EMAIL_PROVIDER_TIMEOUT_MS).toBe(12_000)
    expect(options.signal.aborted).toBe(false)
    await new Promise((resolve) => options.signal.addEventListener('abort', resolve, { once: true }))
    expect(options.signal.aborted).toBe(true)
  })
})
