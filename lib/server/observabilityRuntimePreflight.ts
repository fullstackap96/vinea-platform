export const OBSERVABILITY_RUNTIME_PREFLIGHT_VERSION =
  '2026-07-02-observability-runtime-preflight-v1'

export type ObservabilityRuntimeGateId =
  | 'disabled_by_default_gate'
  | 'environment_scope'
  | 'redaction_dto'
  | 'forbidden_payload_blocking'
  | 'owner_labels'
  | 'rollback_control'

export type ObservabilityRuntimeGateResult = {
  readonly id: ObservabilityRuntimeGateId
  readonly ok: boolean
  readonly matchedMarker: string | null
  readonly markerIndex: number
}

export type ObservabilityRuntimePreflightResult = {
  readonly ok: boolean
  readonly version: typeof OBSERVABILITY_RUNTIME_PREFLIGHT_VERSION
  readonly firstExternalReportIndex: number
  readonly gates: readonly ObservabilityRuntimeGateResult[]
  readonly forbiddenRuntimeMarkersPresent: readonly string[]
  readonly errors: readonly string[]
}

type ObservabilityRuntimeGate = {
  readonly id: ObservabilityRuntimeGateId
  readonly description: string
  readonly markers: readonly string[]
}

const FUTURE_OBSERVABILITY_RUNTIME_GATES: readonly ObservabilityRuntimeGate[] = [
  {
    id: 'disabled_by_default_gate',
    description:
      'Future external reporting is disabled by default and requires explicit approval.',
    markers: [
      'getObservabilityRuntimeGate(',
      'VINEA_OBSERVABILITY_RUNTIME',
      'APPROVED_PRODUCTION_OBSERVABILITY',
    ],
  },
  {
    id: 'environment_scope',
    description:
      'Future external reporting distinguishes non-production and production approval scopes.',
    markers: [
      'VINEA_OBSERVABILITY_RUNTIME_ENV',
      'NON_PRODUCTION',
      'PRODUCTION',
    ],
  },
  {
    id: 'redaction_dto',
    description:
      'Future external reporting sends only buildObservabilityEvent output.',
    markers: [
      'buildObservabilityEvent(',
      'redactObservabilityText(',
      'safeObservabilityEvent',
    ],
  },
  {
    id: 'forbidden_payload_blocking',
    description:
      'Future external reporting asserts that raw prompts, outputs, tokens, storage paths, exports, and document payloads are blocked.',
    markers: [
      'assertNoForbiddenObservabilityPayload(',
      'rawPromptStored: false',
      'tokenMaterialStored: false',
    ],
  },
  {
    id: 'owner_labels',
    description:
      'Future external reporting preserves owner and impact labels before sending events.',
    markers: [
      'recommendedOwner',
      'customerImpact',
      'monitoringOwnerLabel',
    ],
  },
  {
    id: 'rollback_control',
    description:
      'Future external reporting can be disabled by configuration without code rollback.',
    markers: [
      'observabilityRuntimeGate.rollbackByDisablingFlags',
      'VINEA_OBSERVABILITY_RUNTIME=DISABLED',
      'returnObservabilityDisabled(',
    ],
  },
]

const FORBIDDEN_RUNTIME_MARKERS = [
  'Sentry.captureException(error)',
  'Sentry.captureMessage(message)',
  'captureException(error)',
  'captureMessage(message)',
  'sendRawErrorTo',
  'rawPrompt:',
  'rawPrompt =',
  'rawOutput:',
  'rawOutput =',
  'providerPayload',
  'createSignedUrl(',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'GOOGLE_CLIENT_SECRET',
  'RESEND_API_KEY',
] as const

function firstIndexOfAny(source: string, markers: readonly string[]): {
  marker: string | null
  index: number
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

function firstExternalReportIndex(source: string): number {
  return firstIndexOfAny(source, [
    'sendObservabilityEvent(',
    'externalObservabilityClient.capture(',
    'observabilityProvider.capture(',
    'return NextResponse.json({ ok: true',
  ]).index
}

export function validateFutureObservabilityRuntimeSource(
  source: string,
): ObservabilityRuntimePreflightResult {
  const externalReportIndex = firstExternalReportIndex(source)
  const errors: string[] = []

  if (externalReportIndex < 0) {
    errors.push(
      'Missing external reporting anchor: sendObservabilityEvent, provider capture, or safe observability response.',
    )
  }

  const gates = FUTURE_OBSERVABILITY_RUNTIME_GATES.map(
    (gate): ObservabilityRuntimeGateResult => {
      const match = firstIndexOfAny(source, gate.markers)
      const ok = allMarkersBeforeIndex(source, gate.markers, externalReportIndex)

      if (!ok) {
        errors.push(
          `${gate.id} must appear before any external observability send. Expected all of: ${gate.markers.join(
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
      `Future observability source contains forbidden runtime markers: ${forbiddenRuntimeMarkersPresent.join(
        ', ',
      )}.`,
    )
  }

  return {
    ok: errors.length === 0,
    version: OBSERVABILITY_RUNTIME_PREFLIGHT_VERSION,
    firstExternalReportIndex: externalReportIndex,
    gates,
    forbiddenRuntimeMarkersPresent,
    errors,
  }
}
