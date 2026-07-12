export const AI_REPLY_AUDIT_RESPONSE_GATE_PREFLIGHT_VERSION =
  '2026-07-07-ai-reply-audit-response-gate-preflight-v1'

export type AiReplyAuditResponseGateId =
  | 'non_production_environment_gate'
  | 'audit_write_approval_gate'
  | 'safe_response_exposure_gate'
  | 'safety_chain_adapter'
  | 'audit_metadata_preparation'
  | 'safe_audit_event_validator'
  | 'safe_audit_write'
  | 'safe_audit_write_success'
  | 'safe_response_validator'
  | 'safe_response_builder'
  | 'generic_blocked_errors'
  | 'rollback_noop'

type RequiredMarkerGate = {
  readonly id: AiReplyAuditResponseGateId
  readonly markerSets: readonly (readonly string[])[]
}

type OrderedMarkerGate = {
  readonly earlier: AiReplyAuditResponseGateId
  readonly later: AiReplyAuditResponseGateId
  readonly description: string
}

export type AiReplyAuditResponseGatePreflightResult = {
  readonly ok: boolean
  readonly version: typeof AI_REPLY_AUDIT_RESPONSE_GATE_PREFLIGHT_VERSION
  readonly matchedMarkers: Readonly<Record<AiReplyAuditResponseGateId, string | null>>
  readonly markerIndexes: Readonly<Record<AiReplyAuditResponseGateId, number>>
  readonly forbiddenMarkersPresent: readonly string[]
  readonly errors: readonly string[]
}

const REQUIRED_GATES: readonly RequiredMarkerGate[] = [
  {
    id: 'non_production_environment_gate',
    markerSets: [
      [
        'VINEA_AI_REPLY_RUNTIME_ENV',
        'NON_PRODUCTION',
        "process.env.VERCEL_ENV === 'production'",
      ],
    ],
  },
  {
    id: 'audit_write_approval_gate',
    markerSets: [
      [
        'VINEA_AI_REPLY_AUDIT_WRITE',
        'APPROVED_AI_REPLY_AUDIT_WRITE_QA',
        'getAiReplyAuditWriteRuntimeGate(',
      ],
    ],
  },
  {
    id: 'safe_response_exposure_gate',
    markerSets: [
      [
        'VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE',
        'APPROVED_AI_REPLY_SAFE_RESPONSE_QA',
        'getAiReplySafeResponseRuntimeGate(',
      ],
    ],
  },
  {
    id: 'safety_chain_adapter',
    markerSets: [['buildAiReplySafetyChainAdapter(']],
  },
  {
    id: 'audit_metadata_preparation',
    markerSets: [['safetyChain.auditPreparation', 'auditPreparation.futureAuditEvent']],
  },
  {
    id: 'safe_audit_event_validator',
    markerSets: [['validateAiReplyAuditEventForSafeWrite(']],
  },
  {
    id: 'safe_audit_write',
    markerSets: [['writeAiReplyAuditMetadata('], ['writeAuditEvent({ safeMetadata']],
  },
  {
    id: 'safe_audit_write_success',
    markerSets: [['safeAuditMetadataWritten = true']],
  },
  {
    id: 'safe_response_validator',
    markerSets: [['validateAiReplyResponseScaffoldForSafeExposure(']],
  },
  {
    id: 'safe_response_builder',
    markerSets: [['buildSafeAiReplyResponse(']],
  },
  {
    id: 'generic_blocked_errors',
    markerSets: [['ai_reply_unavailable', 'genericBlockedReason']],
  },
  {
    id: 'rollback_noop',
    markerSets: [['return failClosedAiReply(', 'rollback by disabling flags', 'safeResponseGate.enabled']],
  },
] as const

const ORDERED_GATES: readonly OrderedMarkerGate[] = [
  {
    earlier: 'non_production_environment_gate',
    later: 'audit_write_approval_gate',
    description: 'Non-production environment guard must be evaluated before audit-write approval.',
  },
  {
    earlier: 'safety_chain_adapter',
    later: 'audit_write_approval_gate',
    description: 'Safety-chain adapter must run before audit-write approval is evaluated.',
  },
  {
    earlier: 'audit_metadata_preparation',
    later: 'safe_audit_event_validator',
    description: 'Prepared safe audit metadata must exist before audit-event validation.',
  },
  {
    earlier: 'safe_audit_event_validator',
    later: 'safe_audit_write',
    description: 'Safe audit-event validation must pass before any audit write.',
  },
  {
    earlier: 'audit_write_approval_gate',
    later: 'safe_audit_write',
    description: 'Audit-write approval gate must pass before any audit write.',
  },
  {
    earlier: 'safe_audit_write',
    later: 'safe_audit_write_success',
    description: 'Safe audit metadata write success must be recorded only after the safe audit write.',
  },
  {
    earlier: 'safe_audit_write_success',
    later: 'safe_response_exposure_gate',
    description: 'Safe response exposure gate must depend on a completed safe audit metadata write.',
  },
  {
    earlier: 'safe_audit_write_success',
    later: 'safe_response_builder',
    description: 'Safe audit metadata write must happen before safe response exposure.',
  },
  {
    earlier: 'safe_response_exposure_gate',
    later: 'safe_response_validator',
    description: 'Safe-response approval gate must pass before response validation.',
  },
  {
    earlier: 'safe_response_validator',
    later: 'safe_response_builder',
    description: 'Safe-response validation must pass before response exposure.',
  },
] as const

const FORBIDDEN_MARKERS = [
  'rawPrompt',
  'rawOutput',
  'providerPayload',
  'tokenMaterial',
  'promptAssembly.prompt',
  'openai.responses.create',
  'sendEmail(',
  'createSignedUrl',
  '.storage',
] as const

function firstIndexOfAny(source: string, markers: readonly string[]) {
  let best: { marker: string | null; index: number } = { marker: null, index: -1 }

  for (const marker of markers) {
    const index = source.indexOf(marker)
    if (index >= 0 && (best.index === -1 || index < best.index)) {
      best = { marker, index }
    }
  }

  return best
}

function firstCompleteMarkerSet(
  source: string,
  markerSets: readonly (readonly string[])[]
): { marker: string | null; index: number; expected: readonly string[] } {
  let earliest: { marker: string | null; index: number; expected: readonly string[] } = {
    marker: null,
    index: -1,
    expected: markerSets[0] ?? [],
  }

  for (const markerSet of markerSets) {
    const allMarkersPresent = markerSet.every((marker) => source.includes(marker))
    if (!allMarkersPresent) continue

    const firstMatch = firstIndexOfAny(source, markerSet)
    if (firstMatch.index >= 0 && (earliest.index === -1 || firstMatch.index < earliest.index)) {
      earliest = {
        marker: firstMatch.marker,
        index: firstMatch.index,
        expected: markerSet,
      }
    }
  }

  return earliest
}

export function validateFutureAiReplyAuditResponseGateSource(
  source: string
): AiReplyAuditResponseGatePreflightResult {
  const matchedMarkers = {} as Record<AiReplyAuditResponseGateId, string | null>
  const markerIndexes = {} as Record<AiReplyAuditResponseGateId, number>
  const errors: string[] = []

  for (const gate of REQUIRED_GATES) {
    const match = firstCompleteMarkerSet(source, gate.markerSets)
    matchedMarkers[gate.id] = match.marker
    markerIndexes[gate.id] = match.index

    if (match.index < 0) {
      const markerList = gate.markerSets.map((markerSet) => `[${markerSet.join(', ')}]`).join(' or ')
      errors.push(`${gate.id} is missing. Expected all markers from one set: ${markerList}.`)
    }
  }

  for (const orderedGate of ORDERED_GATES) {
    const earlierIndex = markerIndexes[orderedGate.earlier]
    const laterIndex = markerIndexes[orderedGate.later]
    if (earlierIndex < 0 || laterIndex < 0 || earlierIndex >= laterIndex) {
      errors.push(`${orderedGate.description}`)
    }
  }

  const forbiddenMarkersPresent = FORBIDDEN_MARKERS.filter((marker) => source.includes(marker))
  if (forbiddenMarkersPresent.length > 0) {
    errors.push(
      `Future AI reply audit/response gate source contains forbidden markers: ${forbiddenMarkersPresent.join(
        ', '
      )}.`
    )
  }

  return {
    ok: errors.length === 0,
    version: AI_REPLY_AUDIT_RESPONSE_GATE_PREFLIGHT_VERSION,
    matchedMarkers,
    markerIndexes,
    forbiddenMarkersPresent,
    errors,
  }
}
