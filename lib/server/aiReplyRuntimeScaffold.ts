import 'server-only'

import type { AiRouteRuntimeWiringGateId } from './aiRouteRuntimeWiringPreflight'
import type { AiReplySafetyRuntimeGateResult } from './aiReplyRuntimeGate'

export const AI_REPLY_RUNTIME_SCAFFOLD_VERSION =
  '2026-07-07-ai-reply-runtime-scaffold-v1'

export const AI_REPLY_REQUIRED_PRE_OPENAI_GATES = [
  'authentication',
  'active_parish_scope',
  'object_level_request_scope',
  'family_portal_exclusion',
  'source_display',
  'audit_metadata',
  'staff_review_status',
  'prompt_assembly',
  'generic_blocked_errors',
] as const satisfies readonly AiRouteRuntimeWiringGateId[]

export type AiReplyRuntimeScaffold =
  | {
      readonly version: typeof AI_REPLY_RUNTIME_SCAFFOLD_VERSION
      readonly route: '/api/ai/reply'
      readonly selectedPath: 'legacy_staff_gated_reply_route'
      readonly legacyBehaviorPreserved: true
      readonly safetyChainWouldRun: false
      readonly shouldCallOpenAiFromSafetyChain: false
      readonly requiredPreOpenAiGates: readonly []
      readonly genericBlockedReason: 'ai_reply_unavailable'
      readonly reason: string
    }
  | {
      readonly version: typeof AI_REPLY_RUNTIME_SCAFFOLD_VERSION
      readonly route: '/api/ai/reply'
      readonly selectedPath: 'permission_scoped_reply_safety_chain_scaffold'
      readonly legacyBehaviorPreserved: true
      readonly safetyChainWouldRun: true
      readonly shouldCallOpenAiFromSafetyChain: false
      readonly requiredPreOpenAiGates: typeof AI_REPLY_REQUIRED_PRE_OPENAI_GATES
      readonly genericBlockedReason: 'ai_reply_unavailable'
      readonly reason: null
    }

export function buildAiReplyRuntimeScaffold(
  gate: AiReplySafetyRuntimeGateResult
): AiReplyRuntimeScaffold {
  if (!gate.enabled) {
    return {
      version: AI_REPLY_RUNTIME_SCAFFOLD_VERSION,
      route: '/api/ai/reply',
      selectedPath: 'legacy_staff_gated_reply_route',
      legacyBehaviorPreserved: true,
      safetyChainWouldRun: false,
      shouldCallOpenAiFromSafetyChain: false,
      requiredPreOpenAiGates: [],
      genericBlockedReason: 'ai_reply_unavailable',
      reason: gate.reason,
    }
  }

  return {
    version: AI_REPLY_RUNTIME_SCAFFOLD_VERSION,
    route: '/api/ai/reply',
    selectedPath: 'permission_scoped_reply_safety_chain_scaffold',
    legacyBehaviorPreserved: true,
    safetyChainWouldRun: true,
    shouldCallOpenAiFromSafetyChain: false,
    requiredPreOpenAiGates: AI_REPLY_REQUIRED_PRE_OPENAI_GATES,
    genericBlockedReason: 'ai_reply_unavailable',
    reason: null,
  }
}
