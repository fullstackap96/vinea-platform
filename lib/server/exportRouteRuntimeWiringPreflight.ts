export const EXPORT_ROUTE_RUNTIME_WIRING_PREFLIGHT_VERSION =
  '2026-07-11-export-route-runtime-wiring-preflight-v2'

export type ExportRouteRuntimeWiringGateId =
  | 'runtime_gate'
  | 'authentication'
  | 'active_parish_scope'
  | 'membership_scope'
  | 'permission_dto'
  | 'blocked_field_controls'
  | 'family_portal_exclusion'
  | 'audit_metadata'
  | 'audit_persistence'
  | 'generic_blocked_errors'

export type ExportRouteRuntimeWiringGateResult = {
  readonly id: ExportRouteRuntimeWiringGateId
  readonly ok: boolean
  readonly matchedMarker: string | null
  readonly markerIndex: number
}

export type ExportRouteRuntimeWiringPreflightResult = {
  readonly ok: boolean
  readonly version: typeof EXPORT_ROUTE_RUNTIME_WIRING_PREFLIGHT_VERSION
  readonly routeId: string
  readonly firstExportQueryIndex: number
  readonly firstExportDeliveryIndex: number
  readonly gates: readonly ExportRouteRuntimeWiringGateResult[]
  readonly errors: readonly string[]
}

type ExportRouteRuntimeWiringGate = {
  readonly id: ExportRouteRuntimeWiringGateId
  readonly description: string
  readonly markerSets: readonly (readonly string[])[]
}

const FUTURE_EXPORT_ROUTE_WIRING_GATES: readonly ExportRouteRuntimeWiringGate[] = [
  {
    id: 'runtime_gate',
    description: 'Disabled-by-default export runtime gate is checked before export query or delivery.',
    markerSets: [
      ['getExportRuntimeGate(', 'EXPORT_RUNTIME_ACK_VALUE', 'VINEA_EXPORT_RUNTIME_ACK'],
      ['getExportRuntimeGate(', 'gate.enabled', 'export_unavailable'],
    ],
  },
  {
    id: 'authentication',
    description: 'Authenticated staff authorization remains before export query or delivery.',
    markerSets: [['requireStaffFromRequest('], ['supabase.auth.getUser(', 'authorizeStaffUser(']],
  },
  {
    id: 'active_parish_scope',
    description: 'Validated active parish context is resolved before export query or delivery.',
    markerSets: [['resolveActiveStaffParishContext(', 'activeParishContext', 'activeParishId']],
  },
  {
    id: 'membership_scope',
    description: 'Membership parish ids are passed into export permission evaluation.',
    markerSets: [['membershipParishIds'], ['current_staff_parish_ids'], ['parish_memberships']],
  },
  {
    id: 'permission_dto',
    description: 'Export permission DTO is built before export query or delivery.',
    markerSets: [['buildExportPermissionEvaluationDto(']],
  },
  {
    id: 'blocked_field_controls',
    description: 'Blocked-field controls from export DTOs remain before export query or delivery.',
    markerSets: [
      ['blockedFieldsRequested', 'BLOCKED_EXPORT_FIELD_PATTERNS'],
      ['blockedFieldsRequested', 'blocked_export_fields_requested'],
      ['parseRequestedExportFields', 'blockedFieldsRequested', 'disallowedFieldsCount'],
    ],
  },
  {
    id: 'family_portal_exclusion',
    description: 'Family-facing surfaces are excluded before export query or delivery.',
    markerSets: [
      ['familyPortalSurface', 'family_portal_surface_cannot_export_staff_data'],
      ['familyPortalSurface', 'exportDtoAllowsRuntimeGate('],
    ],
  },
  {
    id: 'audit_metadata',
    description: 'Safe export audit metadata is prepared before export delivery.',
    markerSets: [
      ['auditMetadataTemplate', 'writeAuditEvent(', 'EXPORT_AUDIT_METADATA_REQUIREMENTS'],
      ['safeAuditMetadata(', 'auditMetadataTemplate', 'writeAuditEvent('],
    ],
  },
  {
    id: 'audit_persistence',
    description: 'Required export audit persistence fails closed before query or delivery.',
    markerSets: [
      ['const auditWritten = await writeAuditEvent(', 'if (!auditWritten)', 'status: 503'],
    ],
  },
  {
    id: 'generic_blocked_errors',
    description: 'Denied export attempts preserve generic safe errors.',
    markerSets: [['genericExportBlockedReason', 'export_unavailable', 'Export request cannot be completed.']],
  },
]

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

function firstExportQueryIndex(source: string): number {
  return firstIndexOfAny(source, ['queryExportRows(', 'selectExportRows(', 'createExportJob(']).index
}

function firstExportDeliveryIndex(source: string): number {
  return firstIndexOfAny(source, [
    'returnExportFile(',
    'return new Response(csv',
    'return Response.json({ downloadUrl',
    'createSignedUrl(',
    'sendExportFile(',
  ]).index
}

function markerSetBeforeIndex(source: string, markerSet: readonly string[], boundaryIndex: number) {
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

export function validateFutureExportRouteRuntimeWiringSource(
  routeId: string,
  source: string
): ExportRouteRuntimeWiringPreflightResult {
  const exportQueryIndex = firstExportQueryIndex(source)
  const exportDeliveryIndex = firstExportDeliveryIndex(source)
  const firstSensitiveActionIndex =
    exportQueryIndex >= 0 && exportDeliveryIndex >= 0
      ? Math.min(exportQueryIndex, exportDeliveryIndex)
      : Math.max(exportQueryIndex, exportDeliveryIndex)
  const errors: string[] = []

  if (exportQueryIndex < 0) {
    errors.push('Missing export query anchor: queryExportRows, selectExportRows, or createExportJob.')
  }
  if (exportDeliveryIndex < 0) {
    errors.push('Missing export delivery anchor: returnExportFile, response download, signed URL, or sendExportFile.')
  }

  const gates = FUTURE_EXPORT_ROUTE_WIRING_GATES.map((gate): ExportRouteRuntimeWiringGateResult => {
    const match = firstCompleteMarkerSetBeforeIndex(source, gate.markerSets, firstSensitiveActionIndex)
    const ok = firstSensitiveActionIndex >= 0 && match.index >= 0 && match.index < firstSensitiveActionIndex

    if (!ok) {
      const markerList = gate.markerSets.map((markerSet) => `[${markerSet.join(', ')}]`).join(' or ')
      errors.push(
        `${gate.id} must appear before any export query or delivery. Expected all markers from one set: ${markerList}.`
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
    version: EXPORT_ROUTE_RUNTIME_WIRING_PREFLIGHT_VERSION,
    routeId,
    firstExportQueryIndex: exportQueryIndex,
    firstExportDeliveryIndex: exportDeliveryIndex,
    gates,
    errors,
  }
}
