export const SACRAMENTAL_RECORD_REVISION_RUNTIME_PREFLIGHT_VERSION =
  '2026-07-02-sacramental-record-revision-runtime-preflight-v1'

export type SacramentalRecordRevisionRuntimeGateId =
  | 'non_production_gate'
  | 'authentication'
  | 'active_parish_scope'
  | 'membership_scope'
  | 'record_ownership'
  | 'request_to_record_ownership'
  | 'safe_audit_metadata'
  | 'forbidden_mutation_blocking'
  | 'generic_denial'
  | 'rollback_noop'

export type SacramentalRecordRevisionRuntimeGateResult = {
  readonly id: SacramentalRecordRevisionRuntimeGateId
  readonly ok: boolean
  readonly matchedMarker: string | null
  readonly markerIndex: number
}

export type SacramentalRecordRevisionRuntimePreflightResult = {
  readonly ok: boolean
  readonly version: typeof SACRAMENTAL_RECORD_REVISION_RUNTIME_PREFLIGHT_VERSION
  readonly firstSensitiveActionIndex: number
  readonly gates: readonly SacramentalRecordRevisionRuntimeGateResult[]
  readonly forbiddenRuntimeMarkersPresent: readonly string[]
  readonly errors: readonly string[]
}

type SacramentalRecordRevisionRuntimeGate = {
  readonly id: SacramentalRecordRevisionRuntimeGateId
  readonly description: string
  readonly markerSets: readonly (readonly string[])[]
}

const FUTURE_SACRAMENTAL_RECORD_REVISION_RUNTIME_GATES: readonly SacramentalRecordRevisionRuntimeGate[] = [
  {
    id: 'non_production_gate',
    description: 'Disabled-by-default non-production runtime gate is checked before scaffold response or event write.',
    markerSets: [
      [
        'getSacramentalRecordRevisionRuntimeGate(',
        'VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME_ACK',
        'APPROVED_SACRAMENTAL_RECORD_REVISION_QA',
      ],
    ],
  },
  {
    id: 'authentication',
    description: 'Authenticated staff authorization remains before scaffold response or event write.',
    markerSets: [['requireStaffFromRequest('], ['supabase.auth.getUser(', 'authorizeStaffUser(']],
  },
  {
    id: 'active_parish_scope',
    description: 'Validated active parish context is resolved before scaffold response or event write.',
    markerSets: [['resolveActiveStaffParishContext(', 'activeParishContext', 'activeParishId']],
  },
  {
    id: 'membership_scope',
    description: 'Staff membership in the selected active parish is checked before scaffold response or event write.',
    markerSets: [
      ['authorizedParishIds', 'activeParishContext.authorizedParishIds'],
      ['membershipParishIds'],
      ['staffMembershipParishIds'],
    ],
  },
  {
    id: 'record_ownership',
    description: 'Sacramental record ownership by the selected active parish is checked before scaffold response or event write.',
    markerSets: [['loadSacramentalRecordRevisionTarget(', 'recordParishId', 'recordBelongsToActiveParish']],
  },
  {
    id: 'request_to_record_ownership',
    description: 'Linked request ownership is checked before scaffold response or event write.',
    markerSets: [
      ['validateRevisionLinkedRequestOwnership(', 'linkedRequestParishMatchesRecord', 'requestToRecordContinuity'],
    ],
  },
  {
    id: 'safe_audit_metadata',
    description: 'Safe revision audit metadata is prepared before scaffold response or event write.',
    markerSets: [
      ['buildSacramentalRecordRevisionAuditMetadata(', 'safeRevisionAuditMetadata', 'sacramental_record_revision_v1'],
    ],
  },
  {
    id: 'forbidden_mutation_blocking',
    description: 'Forbidden mutation controls are evaluated before scaffold response or event write.',
    markerSets: [
      ['assertNoSacramentalRecordMutation(', 'mutatesSacramentalRecord: false', 'automaticRegisterMutationBlocked'],
    ],
  },
  {
    id: 'generic_denial',
    description: 'Denied paths preserve generic safe errors before scaffold response or event write.',
    markerSets: [['genericRevisionBlockedReason', 'sacramental_record_revision_unavailable', 'Revision review unavailable.']],
  },
  {
    id: 'rollback_noop',
    description: 'Flag-off and rollback behavior remains no-op before scaffold response or event write.',
    markerSets: [['revisionRuntimeGate.rollbackNoop', 'returnRevisionRuntimeUnavailable(', 'runtimePersistenceApproved: false']],
  },
]

const FORBIDDEN_RUNTIME_MARKERS = [
  ".from('sacramental_records').update",
  '.from("sacramental_records").update',
  'updateSacramentalRecord(',
  'generateCertificate(',
  'createSignedUrl(',
  'sendEmail(',
  'sendSms(',
  'openai.responses.create',
  'createGoogleCalendarEvent(',
  'canonicalDecisionMade: true',
  'pastoralDecisionMade: true',
  'sacramentalEligibilityDecided: true',
  'mutatesSacramentalRecord: true',
  'generatesCertificateAutomatically: true',
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

function markerSetBeforeIndex(source: string, markerSet: readonly string[], boundaryIndex: number): boolean {
  return markerSet.every((marker) => {
    const index = source.indexOf(marker)
    return index >= 0 && boundaryIndex >= 0 && index < boundaryIndex
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
      firstMatch.index >= 0 &&
      markerSetBeforeIndex(source, markerSet, boundaryIndex) &&
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

function firstSensitiveActionIndex(source: string): number {
  return firstIndexOfAny(source, [
    'writeSacramentalRecordRevisionAuditEvent(',
    'insertSacramentalRecordRevisionEvent(',
    ".from('sacramental_record_events').insert",
    '.from("sacramental_record_events").insert',
    'returnRevisionScaffoldResponse(',
    'return NextResponse.json({ ok: true',
  ]).index
}

export function validateFutureSacramentalRecordRevisionRuntimeSource(
  source: string
): SacramentalRecordRevisionRuntimePreflightResult {
  const sensitiveActionIndex = firstSensitiveActionIndex(source)
  const errors: string[] = []

  if (sensitiveActionIndex < 0) {
    errors.push(
      'Missing sensitive action anchor: write/insert revision event or return safe revision scaffold response.'
    )
  }

  const gates = FUTURE_SACRAMENTAL_RECORD_REVISION_RUNTIME_GATES.map(
    (gate): SacramentalRecordRevisionRuntimeGateResult => {
      const match = firstCompleteMarkerSetBeforeIndex(source, gate.markerSets, sensitiveActionIndex)
      const ok = sensitiveActionIndex >= 0 && match.index >= 0 && match.index < sensitiveActionIndex

      if (!ok) {
        const markerList = gate.markerSets.map((markerSet) => `[${markerSet.join(', ')}]`).join(' or ')
        errors.push(
          `${gate.id} must appear before any revision scaffold response or event write. Expected all markers from one set: ${markerList}.`
        )
      }

      return {
        id: gate.id,
        ok,
        matchedMarker: match.marker,
        markerIndex: match.index,
      }
    }
  )

  const forbiddenRuntimeMarkersPresent = FORBIDDEN_RUNTIME_MARKERS.filter((marker) => source.includes(marker))

  if (forbiddenRuntimeMarkersPresent.length > 0) {
    errors.push(
      `Future revision scaffold source contains forbidden runtime markers: ${forbiddenRuntimeMarkersPresent.join(', ')}.`
    )
  }

  return {
    ok: errors.length === 0,
    version: SACRAMENTAL_RECORD_REVISION_RUNTIME_PREFLIGHT_VERSION,
    firstSensitiveActionIndex: sensitiveActionIndex,
    gates,
    forbiddenRuntimeMarkersPresent,
    errors,
  }
}
