import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  createDemoRequestProviderOptions,
  DEMO_REQUEST_PROVIDER_TIMEOUT_MS,
  isValidDemoRequestDeliveryAttemptId,
} from './demoRequestDelivery'

describe('demo request provider delivery boundary', () => {
  it('accepts UUID delivery attempts and rejects arbitrary public input', () => {
    expect(
      isValidDemoRequestDeliveryAttemptId('11111111-1111-4111-8111-111111111111'),
    ).toBe(true)
    expect(isValidDemoRequestDeliveryAttemptId('same-request-forever')).toBe(false)
    expect(isValidDemoRequestDeliveryAttemptId('')).toBe(false)
  })

  it('creates a deterministic opaque provider key per browser attempt', () => {
    const deliveryAttemptId = '11111111-1111-4111-8111-111111111111'
    const first = createDemoRequestProviderOptions({ deliveryAttemptId })
    const retry = createDemoRequestProviderOptions({ deliveryAttemptId })
    const next = createDemoRequestProviderOptions({
      deliveryAttemptId: '22222222-2222-4222-8222-222222222222',
    })

    expect(first.idempotencyKey).toBe(retry.idempotencyKey)
    expect(first.idempotencyKey).toMatch(/^vinea-demo-request-[a-f0-9]{64}$/)
    expect(first.idempotencyKey).not.toContain(deliveryAttemptId)
    expect(next.idempotencyKey).not.toBe(first.idempotencyKey)
  })

  it('owns a bounded provider signal without changing the production default', async () => {
    const options = createDemoRequestProviderOptions({
      deliveryAttemptId: '11111111-1111-4111-8111-111111111111',
      timeoutMs: 5,
    })

    expect(DEMO_REQUEST_PROVIDER_TIMEOUT_MS).toBe(12_000)
    expect(options.signal.aborted).toBe(false)
    await new Promise((resolve) =>
      options.signal.addEventListener('abort', resolve, { once: true }),
    )
    expect(options.signal.aborted).toBe(true)
  })
})
