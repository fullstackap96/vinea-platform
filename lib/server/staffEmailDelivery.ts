import 'server-only'

import { createHash } from 'node:crypto'

export const STAFF_EMAIL_PROVIDER_TIMEOUT_MS = 12_000

const deliveryAttemptIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidStaffEmailDeliveryAttemptId(value: string): boolean {
  return deliveryAttemptIdPattern.test(value)
}

export function createStaffEmailProviderRequestOptions(input: {
  requestId: string
  deliveryAttemptId: string
  timeoutMs?: number
}) {
  const digest = createHash('sha256')
    .update(`${input.requestId}\0${input.deliveryAttemptId}`)
    .digest('hex')

  return {
    idempotencyKey: `vinea-request-email-${digest}`,
    signal: AbortSignal.timeout(input.timeoutMs ?? STAFF_EMAIL_PROVIDER_TIMEOUT_MS),
  }
}
