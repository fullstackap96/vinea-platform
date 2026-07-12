import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  createDailyBriefProviderOptions,
  DAILY_BRIEF_PROVIDER_TIMEOUT_MS,
  isValidDailyBriefDeliveryAttemptId,
} from './dailyBriefDelivery'

describe('Daily Brief provider delivery boundary', () => {
  it('validates manual delivery attempt identifiers', () => {
    expect(
      isValidDailyBriefDeliveryAttemptId('11111111-1111-4111-8111-111111111111'),
    ).toBe(true)
    expect(isValidDailyBriefDeliveryAttemptId('retry-forever')).toBe(false)
  })

  it('keeps same-attempt manual retries idempotent and new sends distinct', () => {
    const base = {
      parishId: 'private-parish-id',
      deliveryDateYmd: '2026-07-12',
      deliveryKind: 'manual' as const,
      deliveryAttemptId: '11111111-1111-4111-8111-111111111111',
    }
    const first = createDailyBriefProviderOptions(base)
    const retry = createDailyBriefProviderOptions(base)
    const afterMidnightRetry = createDailyBriefProviderOptions({
      ...base,
      deliveryDateYmd: '2026-07-13',
    })
    const next = createDailyBriefProviderOptions({
      ...base,
      deliveryAttemptId: '22222222-2222-4222-8222-222222222222',
    })

    expect(first.idempotencyKey).toBe(retry.idempotencyKey)
    expect(afterMidnightRetry.idempotencyKey).toBe(first.idempotencyKey)
    expect(first.idempotencyKey).toMatch(/^vinea-daily-brief-[a-f0-9]{64}$/)
    expect(first.idempotencyKey).not.toContain(base.parishId)
    expect(first.idempotencyKey).not.toContain(base.deliveryAttemptId)
    expect(next.idempotencyKey).not.toBe(first.idempotencyKey)
  })

  it('deduplicates scheduled retries by parish and delivery date', () => {
    const first = createDailyBriefProviderOptions({
      parishId: 'parish-a',
      deliveryDateYmd: '2026-07-12',
      deliveryKind: 'scheduled',
    })
    const retry = createDailyBriefProviderOptions({
      parishId: 'parish-a',
      deliveryDateYmd: '2026-07-12',
      deliveryKind: 'scheduled',
    })
    const tomorrow = createDailyBriefProviderOptions({
      parishId: 'parish-a',
      deliveryDateYmd: '2026-07-13',
      deliveryKind: 'scheduled',
    })

    expect(retry.idempotencyKey).toBe(first.idempotencyKey)
    expect(tomorrow.idempotencyKey).not.toBe(first.idempotencyKey)
  })

  it('rejects incomplete scope and bounds provider confirmation', async () => {
    expect(() =>
      createDailyBriefProviderOptions({
        parishId: '',
        deliveryDateYmd: 'not-a-date',
        deliveryKind: 'scheduled',
      }),
    ).toThrow('Daily brief delivery scope is invalid.')
    expect(() =>
      createDailyBriefProviderOptions({
        parishId: 'parish-a',
        deliveryDateYmd: '2026-07-12',
        deliveryKind: 'manual',
      }),
    ).toThrow('Daily brief manual delivery attempt is invalid.')

    const options = createDailyBriefProviderOptions({
      parishId: 'parish-a',
      deliveryDateYmd: '2026-07-12',
      deliveryKind: 'scheduled',
      timeoutMs: 5,
    })
    expect(DAILY_BRIEF_PROVIDER_TIMEOUT_MS).toBe(12_000)
    await new Promise((resolve) =>
      options.signal.addEventListener('abort', resolve, { once: true }),
    )
    expect(options.signal.aborted).toBe(true)
  })
})
