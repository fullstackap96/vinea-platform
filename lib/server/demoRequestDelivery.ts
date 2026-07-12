import 'server-only'

import { createHash } from 'node:crypto'

export const DEMO_REQUEST_PROVIDER_TIMEOUT_MS = 12_000

const deliveryAttemptIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidDemoRequestDeliveryAttemptId(value: string): boolean {
  return deliveryAttemptIdPattern.test(value)
}

export function createDemoRequestProviderOptions(input: {
  deliveryAttemptId: string
  timeoutMs?: number
}) {
  const digest = createHash('sha256')
    .update(input.deliveryAttemptId)
    .digest('hex')

  return {
    idempotencyKey: `vinea-demo-request-${digest}`,
    signal: AbortSignal.timeout(input.timeoutMs ?? DEMO_REQUEST_PROVIDER_TIMEOUT_MS),
  }
}
