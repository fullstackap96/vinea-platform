export const AI_ROUTE_RUNTIME_WIRING_PREFLIGHT_VERSION =
  '2026-06-27-ai-route-runtime-wiring-preflight-v1'

export type AiRouteRuntimeWiringRouteId = 'summary' | 'reply'

export type AiRouteRuntimeWiringGateId =
  | 'authentication'
  | 'active_parish_scope'
  | 'object_level_request_scope'
  | 'family_portal_exclusion'
  | 'source_display'
  | 'audit_metadata'
  | 'staff_review_status'
  | 'prompt_assembly'
  | 'generic_blocked_errors'

type AiRouteRuntimeWiringGate = {
  readonly id: AiRouteRuntimeWiringGateId
  readonly description: string
  readonly markerSetsByRoute: Readonly<
    Record<AiRouteRuntimeWiringRouteId, readonly (readonly string[])[]>
  >
}

export type AiRouteRuntimeWiringGateResult = {
  readonly id: AiRouteRuntimeWiringGateId
  readonly ok: boolean
  readonly matchedMarker: string | null
  readonly markerIndex: number
}

export type AiRouteRuntimeWiringPreflightResult = {
  readonly ok: boolean
  readonly version: typeof AI_ROUTE_RUNTIME_WIRING_PREFLIGHT_VERSION
  readonly routeId: AiRouteRuntimeWiringRouteId
  readonly firstOpenAiCallIndex: number
  readonly gates: readonly AiRouteRuntimeWiringGateResult[]
  readonly errors: readonly string[]
}

export type AiRouteLegacyBoundaryResult = {
  readonly ok: boolean
  readonly routeId: AiRouteRuntimeWiringRouteId
  readonly runtimeState: 'legacy_staff_gated_not_ai_safety_wired'
  readonly firstOpenAiCallIndex: number
  readonly authMarkersBeforeOpenAi: readonly string[]
  readonly forbiddenRuntimeWiringMarkersPresent: readonly string[]
  readonly errors: readonly string[]
}

const FUTURE_RUNTIME_WIRING_GATES: readonly AiRouteRuntimeWiringGate[] = [
  {
    id: 'authentication',
    description: 'Authenticated staff authorization remains before any OpenAI call.',
    markerSetsByRoute: {
      summary: [['requireStaffFromRequest(']],
      reply: [['supabase.auth.getUser(', 'authorizeStaffUser(']],
    },
  },
  {
    id: 'active_parish_scope',
    description: 'Validated active parish context is resolved before any OpenAI call.',
    markerSetsByRoute: {
      summary: [['resolveActiveStaffParishContext(', 'activeParishContext', 'activeParishId']],
      reply: [['resolveActiveStaffParishContext(', 'activeParishContext', 'activeParishId']],
    },
  },
  {
    id: 'object_level_request_scope',
    description: 'Object-level request parish scope is resolved before any OpenAI call.',
    markerSetsByRoute: {
      summary: [['buildRequestSummaryRetrievalDto(', 'requestParishId']],
      reply: [['buildAiReplyRetrievalDto(', 'requestParishId']],
    },
  },
  {
    id: 'family_portal_exclusion',
    description: 'Family-facing and cross-parish retrieval exclusions are evaluated before any OpenAI call.',
    markerSetsByRoute: {
      summary: [['buildAiFutureRetrievalSafetyContract(', "surface: 'staff_internal'"]],
      reply: [['buildAiFutureRetrievalSafetyContract(', "surface: 'staff_internal'"]],
    },
  },
  {
    id: 'source_display',
    description: 'Safe source-display DTOs are built before any OpenAI call.',
    markerSetsByRoute: {
      summary: [['buildRequestSummarySourceDisplayDto(']],
      reply: [['buildAiSourceDisplayDto(']],
    },
  },
  {
    id: 'audit_metadata',
    description: 'Safe AI audit metadata DTOs are built before any OpenAI call.',
    markerSetsByRoute: {
      summary: [['buildRequestSummaryAuditMetadataDto(']],
      reply: [['buildAiAuditMetadataDto(']],
    },
  },
  {
    id: 'staff_review_status',
    description: 'Staff review/status labels are built before any OpenAI call.',
    markerSetsByRoute: {
      summary: [['buildAiStaffReviewStatusDto(']],
      reply: [['buildAiStaffReviewStatusDto(']],
    },
  },
  {
    id: 'prompt_assembly',
    description: 'DTO-backed prompt assembly is built from safe references before any OpenAI call.',
    markerSetsByRoute: {
      summary: [['buildAiSummaryPromptAssembly(']],
      reply: [['buildAiReplyPromptAssembly(']],
    },
  },
  {
    id: 'generic_blocked_errors',
    description: 'Blocked safety errors preserve generic public/staff-safe messages before any OpenAI call.',
    markerSetsByRoute: {
      summary: [['genericPublicBlockedReason', 'ai_retrieval_unavailable']],
      reply: [['genericPublicBlockedReason', 'ai_retrieval_unavailable', 'ai_reply_unavailable']],
    },
  },
]

const FORBIDDEN_CURRENT_RUNTIME_WIRING_MARKERS = [
  'buildRequestSummaryRetrievalDto',
  'buildAiReplyRetrievalDto',
  'buildRequestSummarySourceDisplayDto',
  'buildRequestSummaryAuditMetadataDto',
  'buildAiStaffReviewStatusDto',
  'buildAiFutureRetrievalSafetyContract',
  'buildAiReplyPromptAssembly',
  'buildAiReplyAuditMetadataPreparation',
  'buildAiReplyResponseScaffold',
] as const

function firstIndexOfAny(source: string, markers: readonly string[]): { marker: string | null; index: number } {
  let best: { marker: string | null; index: number } = { marker: null, index: -1 }

  for (const marker of markers) {
    const index = source.indexOf(marker)
    if (index >= 0 && (best.index === -1 || index < best.index)) {
      best = { marker, index }
    }
  }

  return best
}

function firstOpenAiCallIndex(source: string): number {
  return firstIndexOfAny(source, ['openai.responses.create']).index
}

function markerSetBeforeIndex(
  source: string,
  markerSet: readonly string[],
  boundaryIndex: number
) {
  return markerSet.every((marker) => {
    const index = source.indexOf(marker)
    return boundaryIndex >= 0 && index >= 0 && index < boundaryIndex
  })
}

function firstCompleteMarkerSetBeforeIndex(
  source: string,
  markerSets: readonly (readonly string[])[],
  boundaryIndex: number
): { marker: string | null; index: number; expected: readonly string[] } {
  let earliest: { marker: string | null; index: number; expected: readonly string[] } = {
    marker: null,
    index: -1,
    expected: markerSets[0] ?? [],
  }

  for (const markerSet of markerSets) {
    const firstMatch = firstIndexOfAny(source, markerSet)
    if (
      markerSetBeforeIndex(source, markerSet, boundaryIndex) &&
      firstMatch.index >= 0 &&
      (earliest.index === -1 || firstMatch.index < earliest.index)
    ) {
      earliest = {
        marker: firstMatch.marker,
        index: firstMatch.index,
        expected: markerSet,
      }
    }
  }

  return earliest
}

export function validateFutureAiRouteRuntimeWiringSource(
  routeId: AiRouteRuntimeWiringRouteId,
  source: string
): AiRouteRuntimeWiringPreflightResult {
  const openAiIndex = firstOpenAiCallIndex(source)
  const errors: string[] = []

  if (openAiIndex < 0) {
    errors.push('Missing OpenAI call anchor: openai.responses.create.')
  }

  const gates = FUTURE_RUNTIME_WIRING_GATES.map((gate): AiRouteRuntimeWiringGateResult => {
    const markerSets = gate.markerSetsByRoute[routeId]
    const match = firstCompleteMarkerSetBeforeIndex(source, markerSets, openAiIndex)
    const ok = openAiIndex >= 0 && match.index >= 0 && match.index < openAiIndex

    if (!ok) {
      const markerList = markerSets
        .map((markerSet) => `[${markerSet.join(', ')}]`)
        .join(' or ')
      errors.push(
        `${gate.id} must appear before openai.responses.create. Expected all markers from one ${routeId} marker set: ${markerList}.`
      )
    }

    return {
      id: gate.id,
      ok,
      matchedMarker: match.marker,
      markerIndex: match.index,
    }
  })

  return {
    ok: errors.length === 0,
    version: AI_ROUTE_RUNTIME_WIRING_PREFLIGHT_VERSION,
    routeId,
    firstOpenAiCallIndex: openAiIndex,
    gates,
    errors,
  }
}

export function validateCurrentLegacyAiRouteBoundarySource(
  routeId: AiRouteRuntimeWiringRouteId,
  source: string
): AiRouteLegacyBoundaryResult {
  const openAiIndex = firstOpenAiCallIndex(source)
  const errors: string[] = []

  if (openAiIndex < 0) {
    errors.push('Missing OpenAI call anchor: openai.responses.create.')
  }

  const requiredAuthMarkers =
    routeId === 'summary' ? ['requireStaffFromRequest'] : ['supabase.auth.getUser', 'authorizeStaffUser']

  const authMarkersBeforeOpenAi = requiredAuthMarkers.filter((marker) => {
    const index = source.indexOf(marker)
    return openAiIndex >= 0 && index >= 0 && index < openAiIndex
  })

  for (const marker of requiredAuthMarkers) {
    if (!authMarkersBeforeOpenAi.includes(marker)) {
      errors.push(`${routeId} route must keep ${marker} before openai.responses.create.`)
    }
  }

  const forbiddenRuntimeWiringMarkersPresent = FORBIDDEN_CURRENT_RUNTIME_WIRING_MARKERS.filter((marker) =>
    source.includes(marker)
  )

  if (forbiddenRuntimeWiringMarkersPresent.length > 0) {
    errors.push(
      `Current ${routeId} route unexpectedly contains non-runtime AI safety wiring markers: ${forbiddenRuntimeWiringMarkersPresent.join(
        ', '
      )}.`
    )
  }

  return {
    ok: errors.length === 0,
    routeId,
    runtimeState: 'legacy_staff_gated_not_ai_safety_wired',
    firstOpenAiCallIndex: openAiIndex,
    authMarkersBeforeOpenAi,
    forbiddenRuntimeWiringMarkersPresent,
    errors,
  }
}
