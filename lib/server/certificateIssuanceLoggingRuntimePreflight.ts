export const CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_PREFLIGHT_VERSION =
  '2026-07-02-certificate-issuance-logging-runtime-preflight-v1'

export type CertificateIssuanceLoggingRuntimeGateId =
  | 'non_production_gate'
  | 'authentication'
  | 'active_parish_scope'
  | 'membership_scope'
  | 'record_ownership'
  | 'request_to_record_ownership'
  | 'safe_audit_metadata'
  | 'forbidden_automation_blocking'
  | 'generic_denial'
  | 'rollback_noop'

export type CertificateIssuanceLoggingRuntimeGateResult = {
  readonly id: CertificateIssuanceLoggingRuntimeGateId
  readonly ok: boolean
  readonly matchedMarker: string | null
  readonly markerIndex: number
}

export type CertificateIssuanceLoggingRuntimePreflightResult = {
  readonly ok: boolean
  readonly version: typeof CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_PREFLIGHT_VERSION
  readonly firstSensitiveActionIndex: number
  readonly gates: readonly CertificateIssuanceLoggingRuntimeGateResult[]
  readonly forbiddenRuntimeMarkersPresent: readonly string[]
  readonly errors: readonly string[]
}

type CertificateIssuanceLoggingRuntimeGate = {
  readonly id: CertificateIssuanceLoggingRuntimeGateId
  readonly description: string
  readonly markerSets: readonly (readonly string[])[]
}

const FUTURE_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_GATES: readonly CertificateIssuanceLoggingRuntimeGate[] = [
  {
    id: 'non_production_gate',
    description: 'Disabled-by-default non-production runtime gate is checked before scaffold response or event write.',
    markerSets: [
      [
        'getCertificateIssuanceLoggingRuntimeGate(',
        'VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ACK',
        'APPROVED_CERTIFICATE_ISSUANCE_LOGGING_QA',
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
    markerSets: [['loadCertificateIssuanceLoggingTarget(', 'recordParishId', 'recordBelongsToActiveParish']],
  },
  {
    id: 'request_to_record_ownership',
    description: 'Linked request ownership is checked before scaffold response or event write.',
    markerSets: [
      [
        'validateCertificateIssuanceLinkedRequestOwnership(',
        'linkedRequestParishMatchesRecord',
        'requestToRecordContinuity',
      ],
    ],
  },
  {
    id: 'safe_audit_metadata',
    description: 'Safe certificate issuance audit metadata is prepared before scaffold response or event write.',
    markerSets: [
      [
        'buildCertificateIssuanceLoggingAuditMetadata(',
        'safeCertificateIssuanceAuditMetadata',
        'certificate_issuance_logging_v1',
      ],
    ],
  },
  {
    id: 'forbidden_automation_blocking',
    description: 'Forbidden automation controls are evaluated before scaffold response or event write.',
    markerSets: [
      [
        'assertNoCertificateAutomation(',
        'certificateGeneratedAutomatically: false',
        'automaticCertificateGenerationBlocked',
      ],
    ],
  },
  {
    id: 'generic_denial',
    description: 'Denied paths preserve generic safe errors before scaffold response or event write.',
    markerSets: [
      [
        'genericCertificateIssuanceBlockedReason',
        'certificate_issuance_logging_unavailable',
        'Certificate issuance logging unavailable.',
      ],
    ],
  },
  {
    id: 'rollback_noop',
    description: 'Flag-off and rollback behavior remains no-op before scaffold response or event write.',
    markerSets: [
      [
        'certificateIssuanceRuntimeGate.rollbackNoop',
        'returnCertificateIssuanceRuntimeUnavailable(',
        'runtimePersistenceApproved: false',
      ],
    ],
  },
]

const FORBIDDEN_RUNTIME_MARKERS = [
  ".from('sacramental_records').update",
  '.from("sacramental_records").update',
  'updateSacramentalRecord(',
  'generateCertificate(',
  'createCertificatePdf(',
  'renderCertificatePdf(',
  'createSignedUrl(',
  'sendEmail(',
  'sendSms(',
  'openai.responses.create',
  'createGoogleCalendarEvent(',
  'canonicalDecisionMade: true',
  'pastoralDecisionMade: true',
  'sacramentalEligibilityDecided: true',
  'mutatesSacramentalRecord: true',
  'certificateGeneratedAutomatically: true',
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
    'writeCertificateIssuanceLoggingAuditEvent(',
    'insertCertificateIssuanceLoggingEvent(',
    ".from('sacramental_record_events').insert",
    '.from("sacramental_record_events").insert',
    'returnCertificateIssuanceScaffoldResponse(',
    'return NextResponse.json({ ok: true',
  ]).index
}

export function validateFutureCertificateIssuanceLoggingRuntimeSource(
  source: string
): CertificateIssuanceLoggingRuntimePreflightResult {
  const sensitiveActionIndex = firstSensitiveActionIndex(source)
  const errors: string[] = []

  if (sensitiveActionIndex < 0) {
    errors.push(
      'Missing sensitive action anchor: write/insert certificate issuance event or return safe issuance scaffold response.'
    )
  }

  const gates = FUTURE_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_GATES.map(
    (gate): CertificateIssuanceLoggingRuntimeGateResult => {
      const match = firstCompleteMarkerSetBeforeIndex(source, gate.markerSets, sensitiveActionIndex)
      const ok = sensitiveActionIndex >= 0 && match.index >= 0 && match.index < sensitiveActionIndex

      if (!ok) {
        const markerList = gate.markerSets.map((markerSet) => `[${markerSet.join(', ')}]`).join(' or ')
        errors.push(
          `${gate.id} must appear before any certificate issuance scaffold response or event write. Expected all markers from one set: ${markerList}.`
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
      `Future certificate issuance scaffold source contains forbidden runtime markers: ${forbiddenRuntimeMarkersPresent.join(
        ', '
      )}.`
    )
  }

  return {
    ok: errors.length === 0,
    version: CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_PREFLIGHT_VERSION,
    firstSensitiveActionIndex: sensitiveActionIndex,
    gates,
    forbiddenRuntimeMarkersPresent,
    errors,
  }
}
