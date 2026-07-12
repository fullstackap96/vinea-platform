import 'server-only'

import type { AiRouteRuntimeWiringGateId } from './aiRouteRuntimeWiringPreflight'
import type { AiSummarySafetyRuntimeGateResult } from './aiSummaryRuntimeGate'

export const AI_SUMMARY_RUNTIME_SCAFFOLD_VERSION =
  '2026-06-27-ai-summary-runtime-scaffold-v1'

export const AI_SUMMARY_REQUIRED_PRE_OPENAI_GATES = [
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

export type AiSummaryRuntimeScaffold =
  | {
      readonly version: typeof AI_SUMMARY_RUNTIME_SCAFFOLD_VERSION
      readonly route: '/api/ai/summary'
      readonly selectedPath: 'legacy_staff_gated_summary_route'
      readonly legacyBehaviorPreserved: true
      readonly safetyChainWouldRun: false
      readonly shouldCallOpenAiFromSafetyChain: false
      readonly requiredPreOpenAiGates: readonly []
      readonly genericBlockedReason: 'ai_retrieval_unavailable'
      readonly reason: string
    }
  | {
      readonly version: typeof AI_SUMMARY_RUNTIME_SCAFFOLD_VERSION
      readonly route: '/api/ai/summary'
      readonly selectedPath: 'permission_scoped_summary_safety_chain'
      readonly legacyBehaviorPreserved: true
      readonly safetyChainWouldRun: true
      readonly shouldCallOpenAiFromSafetyChain: true
      readonly requiredPreOpenAiGates: typeof AI_SUMMARY_REQUIRED_PRE_OPENAI_GATES
      readonly genericBlockedReason: 'ai_retrieval_unavailable'
      readonly reason: null
    }

export function buildAiSummaryRuntimeScaffold(
  gate: AiSummarySafetyRuntimeGateResult
): AiSummaryRuntimeScaffold {
  if (!gate.enabled) {
    return {
      version: AI_SUMMARY_RUNTIME_SCAFFOLD_VERSION,
      route: '/api/ai/summary',
      selectedPath: 'legacy_staff_gated_summary_route',
      legacyBehaviorPreserved: true,
      safetyChainWouldRun: false,
      shouldCallOpenAiFromSafetyChain: false,
      requiredPreOpenAiGates: [],
      genericBlockedReason: 'ai_retrieval_unavailable',
      reason: gate.reason,
    }
  }

  return {
    version: AI_SUMMARY_RUNTIME_SCAFFOLD_VERSION,
    route: '/api/ai/summary',
    selectedPath: 'permission_scoped_summary_safety_chain',
    legacyBehaviorPreserved: true,
    safetyChainWouldRun: true,
    shouldCallOpenAiFromSafetyChain: true,
    requiredPreOpenAiGates: AI_SUMMARY_REQUIRED_PRE_OPENAI_GATES,
    genericBlockedReason: 'ai_retrieval_unavailable',
    reason: null,
  }
}
