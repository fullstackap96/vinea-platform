export const PRODUCTION_MONITORING_RUNTIME_PREFLIGHT_VERSION =
  '2026-07-05-production-monitoring-runtime-preflight-v1'

export type ProductionMonitoringRuntimeGateId =
  | 'disabled_by_default_gate'
  | 'environment_scope_gate'
  | 'redaction_dto_gate'
  | 'forbidden_payload_gate'
  | 'owner_support_labels_gate'
  | 'rollback_noop_gate'
  | 'customer_communication_boundary_gate'

export type ProductionMonitoringRuntimeGateResult = {
  readonly id: ProductionMonitoringRuntimeGateId
  readonly ok: boolean
  readonly matchedMarker: string | null
  readonly markerIndex: number
}

export type ProductionMonitoringRuntimePreflightResult = {
  readonly ok: boolean
  readonly version: typeof PRODUCTION_MONITORING_RUNTIME_PREFLIGHT_VERSION
  readonly firstExternalSendIndex: number
  readonly gates: readonly ProductionMonitoringRuntimeGateResult[]
  readonly forbiddenRuntimeMarkersPresent: readonly string[]
  readonly errors: readonly string[]
}

type ProductionMonitoringRuntimeGate = {
  readonly id: ProductionMonitoringRuntimeGateId
  readonly description: string
  readonly markers: readonly string[]
}

const FUTURE_PRODUCTION_MONITORING_RUNTIME_GATES: readonly ProductionMonitoringRuntimeGate[] =
  [
    {
      id: 'disabled_by_default_gate',
      description:
        'Future production monitoring runtime must default to disabled and require explicit approval.',
      markers: [
        'getProductionMonitoringRuntimeGate(',
        'VINEA_PRODUCTION_MONITORING_RUNTIME',
        'APPROVED_PRODUCTION_MONITORING_RUNTIME',
      ],
    },
    {
      id: 'environment_scope_gate',
      description:
        'Future production monitoring runtime must distinguish non-production, production smoke, and production enabled scopes.',
      markers: [
        'VINEA_PRODUCTION_MONITORING_RUNTIME_ENV',
        'NON_PRODUCTION',
        'PRODUCTION_SMOKE',
        'PRODUCTION_ENABLED',
      ],
    },
    {
      id: 'redaction_dto_gate',
      description:
        'Future production monitoring runtime must build and redact the safe observability DTO before delivery.',
      markers: [
        'buildObservabilityEvent(',
        'redactObservabilityText(',
        'safeObservabilityEvent',
      ],
    },
    {
      id: 'forbidden_payload_gate',
      description:
        'Future production monitoring runtime must block raw prompts, outputs, token material, storage paths, exports, documents, and secrets before delivery.',
      markers: [
        'assertNoForbiddenProductionMonitoringPayload(',
        'rawPromptStored: false',
        'tokenMaterialStored: false',
        'documentPayloadStored: false',
      ],
    },
    {
      id: 'owner_support_labels_gate',
      description:
        'Future production monitoring runtime must derive support routing and owner labels before delivery.',
      markers: [
        'mapObservabilityEventToSupportEscalation(',
        'monitoringOwnerLabel',
        'supportOwnerLabel',
        'customerImpact',
      ],
    },
    {
      id: 'rollback_noop_gate',
      description:
        'Future production monitoring runtime must no-op safely and roll back by disabling configuration.',
      markers: [
        'productionMonitoringRuntimeGate.rollbackByDisablingFlags',
        'returnProductionMonitoringNoop(',
        'VINEA_PRODUCTION_MONITORING_RUNTIME=DISABLED',
      ],
    },
    {
      id: 'customer_communication_boundary_gate',
      description:
        'Future production monitoring runtime must preserve the boundary that monitoring never contacts customers automatically.',
      markers: [
        'customerCommunicationAllowed: false',
        'requiresIncidentCommanderApproval',
        'requiresLegalDataOwnerApproval',
      ],
    },
  ]

const EXTERNAL_SEND_MARKERS = [
  'sendProductionMonitoringEvent(',
  'sendObservabilityEvent(',
  'productionMonitoringProvider.capture(',
  'observabilityProvider.capture(',
  'externalMonitoringClient.capture(',
] as const

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
  'requestBody',
  'responseBody',
  'createSignedUrl(',
  'storagePath',
  'rawExport',
  'documentContent',
  'originalFilename',
  'familyPortalToken',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
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

function firstExternalSendIndex(source: string): number {
  return firstIndexOfAny(source, EXTERNAL_SEND_MARKERS).index
}

export function validateFutureProductionMonitoringRuntimeSource(
  source: string,
): ProductionMonitoringRuntimePreflightResult {
  const externalSendIndex = firstExternalSendIndex(source)
  const errors: string[] = []

  if (externalSendIndex < 0) {
    errors.push(
      `Missing external monitoring anchor. Expected one of: ${EXTERNAL_SEND_MARKERS.join(
        ', ',
      )}.`,
    )
  }

  const gates = FUTURE_PRODUCTION_MONITORING_RUNTIME_GATES.map(
    (gate): ProductionMonitoringRuntimeGateResult => {
      const match = firstIndexOfAny(source, gate.markers)
      const ok = allMarkersBeforeIndex(source, gate.markers, externalSendIndex)

      if (!ok) {
        errors.push(
          `${gate.id} must appear before any external monitoring send. Expected all of: ${gate.markers.join(
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
      `Future production monitoring source contains forbidden runtime markers: ${forbiddenRuntimeMarkersPresent.join(
        ', ',
      )}.`,
    )
  }

  return {
    ok: errors.length === 0,
    version: PRODUCTION_MONITORING_RUNTIME_PREFLIGHT_VERSION,
    firstExternalSendIndex: externalSendIndex,
    gates,
    forbiddenRuntimeMarkersPresent,
    errors,
  }
}
