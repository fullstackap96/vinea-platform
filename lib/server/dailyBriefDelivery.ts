import 'server-only'

import { createHash } from 'node:crypto'

export const DAILY_BRIEF_PROVIDER_TIMEOUT_MS = 12_000

const deliveryAttemptIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const deliveryDatePattern = /^\d{4}-\d{2}-\d{2}$/

export function isValidDailyBriefDeliveryAttemptId(value: string): boolean {
  return deliveryAttemptIdPattern.test(value)
}

export function createDailyBriefProviderOptions(input: {
  parishId: string
  deliveryDateYmd: string
  deliveryKind: 'manual' | 'scheduled'
  deliveryAttemptId?: string
  timeoutMs?: number
}) {
  if (!input.parishId.trim() || !deliveryDatePattern.test(input.deliveryDateYmd)) {
    throw new Error('Daily brief delivery scope is invalid.')
  }
  if (
    input.deliveryKind === 'manual' &&
    !isValidDailyBriefDeliveryAttemptId(input.deliveryAttemptId ?? '')
  ) {
    throw new Error('Daily brief manual delivery attempt is invalid.')
  }

  const deliveryScope =
    input.deliveryKind === 'manual'
      ? input.deliveryAttemptId ?? ''
      : input.deliveryDateYmd
  const digest = createHash('sha256')
    .update(`${input.parishId}\0${input.deliveryKind}\0${deliveryScope}`)
    .digest('hex')

  return {
    idempotencyKey: `vinea-daily-brief-${digest}`,
    signal: AbortSignal.timeout(input.timeoutMs ?? DAILY_BRIEF_PROVIDER_TIMEOUT_MS),
  }
}
