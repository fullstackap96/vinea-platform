import 'server-only'

export const AI_REPLY_SAFETY_RUNTIME_FLAG = 'VINEA_AI_REPLY_SAFETY_RUNTIME'
export const AI_REPLY_SAFETY_RUNTIME_ACK = 'VINEA_AI_REPLY_SAFETY_RUNTIME_ACK'

export const AI_REPLY_SAFETY_RUNTIME_ENABLED_VALUE = 'ENABLED'
export const AI_REPLY_SAFETY_RUNTIME_ACK_VALUE = 'APPROVED_AI_REPLY_SAFETY_RUNTIME'

export type AiReplySafetyRuntimeGateResult =
  | {
      readonly enabled: true
      readonly mode: 'reply_safety_chain_scaffold'
      readonly legacyFallback: true
      readonly route: '/api/ai/reply'
    }
  | {
      readonly enabled: false
      readonly reason: string
      readonly mode: 'legacy_reply_prompt'
      readonly legacyFallback: true
      readonly route: '/api/ai/reply'
    }

function envValue(name: string, env: NodeJS.ProcessEnv): string {
  return String(env[name] ?? '').trim()
}

/**
 * AI reply safety-chain routing is intentionally disabled by default.
 *
 * Future `/api/ai/reply` wiring must call this server-only gate before using
 * permission-scoped retrieval DTOs, source display, AI audit metadata, staff
 * review/status labels, or family/cross-parish safety contracts. When disabled,
 * the current staff-gated legacy reply route behavior must remain selected.
 */
export function getAiReplySafetyRuntimeGate(
  env: NodeJS.ProcessEnv = process.env
): AiReplySafetyRuntimeGateResult {
  if (envValue(AI_REPLY_SAFETY_RUNTIME_FLAG, env) !== AI_REPLY_SAFETY_RUNTIME_ENABLED_VALUE) {
    return {
      enabled: false,
      reason: `${AI_REPLY_SAFETY_RUNTIME_FLAG} is not enabled.`,
      mode: 'legacy_reply_prompt',
      legacyFallback: true,
      route: '/api/ai/reply',
    }
  }

  if (envValue(AI_REPLY_SAFETY_RUNTIME_ACK, env) !== AI_REPLY_SAFETY_RUNTIME_ACK_VALUE) {
    return {
      enabled: false,
      reason: `${AI_REPLY_SAFETY_RUNTIME_ACK} approval is missing.`,
      mode: 'legacy_reply_prompt',
      legacyFallback: true,
      route: '/api/ai/reply',
    }
  }

  return {
    enabled: true,
    mode: 'reply_safety_chain_scaffold',
    legacyFallback: true,
    route: '/api/ai/reply',
  }
}

export const aiReplyRuntimeGateTestInternals = {
  envValue,
}
