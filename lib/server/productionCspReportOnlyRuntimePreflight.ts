export const PRODUCTION_CSP_REPORT_ONLY_RUNTIME_PREFLIGHT_VERSION =
  '2026-07-07-production-csp-report-only-runtime-preflight-v1'

export type ProductionCspReportOnlyRuntimeGateId =
  | 'disabled_by_default_gate'
  | 'non_production_scope_gate'
  | 'report_only_header_gate'
  | 'provider_allowlist_gate'
  | 'report_redaction_gate'
  | 'smoke_evidence_gate'
  | 'rollback_noop_gate'
  | 'customer_trust_boundary_gate'

export type ProductionCspReportOnlyRuntimeGateResult = {
  readonly id: ProductionCspReportOnlyRuntimeGateId
  readonly ok: boolean
  readonly matchedMarker: string | null
  readonly markerIndex: number
}

export type ProductionCspReportOnlyRuntimePreflightResult = {
  readonly ok: boolean
  readonly version: typeof PRODUCTION_CSP_REPORT_ONLY_RUNTIME_PREFLIGHT_VERSION
  readonly firstReportSendIndex: number
  readonly gates: readonly ProductionCspReportOnlyRuntimeGateResult[]
  readonly forbiddenRuntimeMarkersPresent: readonly string[]
  readonly errors: readonly string[]
}

type ProductionCspReportOnlyRuntimeGate = {
  readonly id: ProductionCspReportOnlyRuntimeGateId
  readonly markers: readonly string[]
}

const FUTURE_CSP_REPORT_ONLY_RUNTIME_GATES: readonly ProductionCspReportOnlyRuntimeGate[] =
  [
    {
      id: 'disabled_by_default_gate',
      markers: [
        'getProductionCspReportOnlyRuntimeGate(',
        'VINEA_CSP_REPORT_ONLY_RUNTIME',
        'APPROVED_CSP_REPORT_ONLY_RUNTIME',
      ],
    },
    {
      id: 'non_production_scope_gate',
      markers: [
        'VINEA_CSP_REPORT_ONLY_RUNTIME_ENV',
        'NON_PRODUCTION',
        'blocked_production_environment',
      ],
    },
    {
      id: 'report_only_header_gate',
      markers: [
        'Content-Security-Policy-Report-Only',
        'buildCspReportOnlyHeader(',
        'enforcingCspAllowed: false',
      ],
    },
    {
      id: 'provider_allowlist_gate',
      markers: [
        'approvedCspProviderAllowlist',
        'supabase',
        'google',
        'self',
      ],
    },
    {
      id: 'report_redaction_gate',
      markers: [
        'sanitizeCspViolationReport(',
        'assertNoForbiddenCspReportPayload(',
        'safeCspViolationReport',
      ],
    },
    {
      id: 'smoke_evidence_gate',
      markers: [
        'cspReportOnlySmokeGateLabels',
        'healthSchemaTrue',
        'staffSignInVerified',
        'selectedParishSwitchingVerified',
        'publicIntakeSmokeVerified',
        'familyPortalSmokeVerified',
        'googleOauthCallbackSmokeVerified',
        'documentUiSmokeVerified',
        'certificateViewSmokeVerified',
      ],
    },
    {
      id: 'rollback_noop_gate',
      markers: [
        'rollbackByRemovingReportOnlyHeader',
        'returnCspReportOnlyNoop(',
        'VINEA_CSP_REPORT_ONLY_RUNTIME=DISABLED',
      ],
    },
    {
      id: 'customer_trust_boundary_gate',
      markers: [
        'customerCommunicationAllowed: false',
        'publicTrustClaimAllowed: false',
        'enforcingCspApproved: false',
      ],
    },
  ]

const CSP_REPORT_SEND_MARKERS = [
  'sendCspReportOnlyViolation(',
  'collectCspReportOnlyViolation(',
  'cspReportCollector.capture(',
  'cspReportOnlyProvider.capture(',
] as const

const FORBIDDEN_RUNTIME_MARKERS = [
  "key: 'Content-Security-Policy'",
  'key: "Content-Security-Policy"',
  "headers.set('Content-Security-Policy'",
  'headers.set("Content-Security-Policy"',
  'enforcingCspApproved: true',
  'publicTrustClaimAllowed: true',
  'customerCommunicationAllowed: true',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'OPENAI_API_KEY',
  'GOOGLE_CLIENT_SECRET',
  'RESEND_API_KEY',
  'familyPortalToken',
  'signedUrl',
  'createSignedUrl(',
  'storagePath',
  'storage_path',
  'documentContent',
  'originalFilename',
  'rawExport',
  'rawMetadata',
  'rawPrompt',
  'rawOutput',
  'requestBody',
  'fullViolationReport',
] as const

function firstIndexOfAny(source: string, markers: readonly string[]): {
  readonly marker: string | null
  readonly index: number
} {
  let best: { marker: string | null; index: number } = { marker: null, index: -1 }

  for (const marker of markers) {
    const index = source.indexOf(marker)
    if (index >= 0 && (best.index === -1 || index < best.index)) {
      best = { marker, index }
    }
  }

  return best
}

function allMarkersBeforeIndex(
  source: string,
  markers: readonly string[],
  boundaryIndex: number,
) {
  return markers.every((marker) => {
    const index = source.indexOf(marker)
    return boundaryIndex >= 0 && index >= 0 && index < boundaryIndex
  })
}

function firstReportSendIndex(source: string): number {
  return firstIndexOfAny(source, CSP_REPORT_SEND_MARKERS).index
}

export function validateFutureProductionCspReportOnlyRuntimeSource(
  source: string,
): ProductionCspReportOnlyRuntimePreflightResult {
  const reportSendIndex = firstReportSendIndex(source)
  const errors: string[] = []

  if (reportSendIndex < 0) {
    errors.push(
      `Missing CSP report-only send/collection anchor. Expected one of: ${CSP_REPORT_SEND_MARKERS.join(
        ', ',
      )}.`,
    )
  }

  const gates = FUTURE_CSP_REPORT_ONLY_RUNTIME_GATES.map(
    (gate): ProductionCspReportOnlyRuntimeGateResult => {
      const match = firstIndexOfAny(source, gate.markers)
      const ok = allMarkersBeforeIndex(source, gate.markers, reportSendIndex)

      if (!ok) {
        errors.push(
          `${gate.id} must appear before any CSP report-only send/collection. Expected all of: ${gate.markers.join(
            ', ',
          )}.`,
        )
      }

      return {
        id: gate.id,
        ok,
        matchedMarker: match.marker,
        markerIndex: match.index,
      }
    },
  )

  const forbiddenRuntimeMarkersPresent = FORBIDDEN_RUNTIME_MARKERS.filter((marker) =>
    source.includes(marker),
  )

  if (forbiddenRuntimeMarkersPresent.length > 0) {
    errors.push(
      `Future CSP report-only runtime source contains forbidden runtime markers: ${forbiddenRuntimeMarkersPresent.join(
        ', ',
      )}.`,
    )
  }

  return {
    ok: errors.length === 0,
    version: PRODUCTION_CSP_REPORT_ONLY_RUNTIME_PREFLIGHT_VERSION,
    firstReportSendIndex: reportSendIndex,
    gates,
    forbiddenRuntimeMarkersPresent,
    errors,
  }
}
