import 'server-only'

export const AI_PROVIDER_TIMEOUT_MS = 30_000

export function createAiProviderRequestOptions(timeoutMs = AI_PROVIDER_TIMEOUT_MS) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new RangeError('AI provider timeout must be a positive finite number.')
  }

  return {
    signal: AbortSignal.timeout(timeoutMs),
  }
}
