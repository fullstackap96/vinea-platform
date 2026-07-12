import 'server-only'

import { createHash } from 'node:crypto'

export const REQUEST_NOTIFICATION_PROVIDER_TIMEOUT_MS = 12_000

export function createRequestNotificationProviderOptions(input: {
  parishId: string
  requestId: string
  timeoutMs?: number
}) {
  const digest = createHash('sha256')
    .update(`${input.parishId}\0${input.requestId}`)
    .digest('hex')

  return {
    idempotencyKey: `vinea-request-notification-${digest}`,
    signal: AbortSignal.timeout(
      input.timeoutMs ?? REQUEST_NOTIFICATION_PROVIDER_TIMEOUT_MS,
    ),
  }
}
