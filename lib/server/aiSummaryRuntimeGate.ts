import 'server-only'

export const AI_SUMMARY_SAFETY_RUNTIME_FLAG = 'VINEA_AI_SUMMARY_SAFETY_RUNTIME'
export const AI_SUMMARY_SAFETY_RUNTIME_ACK = 'VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK'

export const AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE = 'ENABLED'
export const AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE = 'APPROVED_AI_SUMMARY_SAFETY_RUNTIME'

export type AiSummarySafetyRuntimeGateResult =
  | {
      readonly enabled: true
      readonly mode: 'safety_chain'
      readonly legacyFallback: true
      readonly route: '/api/ai/summary'
    }
  | {
      readonly enabled: false
      readonly reason: string
      readonly mode: 'legacy_summary_prompt'
      readonly legacyFallback: true
      readonly route: '/api/ai/summary'
    }

function envValue(name: string, env: NodeJS.ProcessEnv): string {
  return String(env[name] ?? '').trim()
}

/**
 * AI summary safety-chain routing is intentionally disabled by default.
 *
 * Future `/api/ai/summary` wiring must call this server-only gate before using
 * permission-scoped retrieval DTOs, source display, AI audit metadata, staff
 * review/status labels, or family/cross-parish safety contracts. When disabled,
 * the current staff-gated legacy summary route behavior must remain selected.
 */
export function getAiSummarySafetyRuntimeGate(
  env: NodeJS.ProcessEnv = process.env
): AiSummarySafetyRuntimeGateResult {
  if (envValue(AI_SUMMARY_SAFETY_RUNTIME_FLAG, env) !== AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE) {
    return {
      enabled: false,
      reason: `${AI_SUMMARY_SAFETY_RUNTIME_FLAG} is not enabled.`,
      mode: 'legacy_summary_prompt',
      legacyFallback: true,
      route: '/api/ai/summary',
    }
  }

  if (envValue(AI_SUMMARY_SAFETY_RUNTIME_ACK, env) !== AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE) {
    return {
      enabled: false,
      reason: `${AI_SUMMARY_SAFETY_RUNTIME_ACK} approval is missing.`,
      mode: 'legacy_summary_prompt',
      legacyFallback: true,
      route: '/api/ai/summary',
    }
  }

  return {
    enabled: true,
    mode: 'safety_chain',
    legacyFallback: true,
    route: '/api/ai/summary',
  }
}

export const aiSummaryRuntimeGateTestInternals = {
  envValue,
}
