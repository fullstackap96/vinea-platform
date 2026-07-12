import 'server-only'

export const EXPORT_AUDIT_REVIEWER_READ_MODEL_VERSION =
  '2026-07-01-export-audit-reviewer-read-model-v1'

export type ExportAuditDecision = 'downloaded' | 'denied' | 'unavailable' | 'malformed'

export type ExportAuditReviewerSavedFilterId =
  | 'exports_downloaded_recent'
  | 'exports_denied_recent'
  | 'exports_blocked_field_attempts'
  | 'exports_cross_parish_or_forged_scope'
  | 'exports_family_or_unauthenticated'
  | 'exports_after_rollback'
  | 'exports_metadata_incomplete'
  | 'document_manifest_safety_review'
  | 'request_list_basic_safety_review'
  | 'repeated_denials_by_actor'

export type ExportAuditReviewerSuspiciousRuleId =
  | 'downloaded_outside_approval_window'
  | 'downloaded_after_rollback'
  | 'downloaded_while_flags_off'
  | 'cross_parish_delivery'
  | 'family_or_unauthenticated_delivery'
  | 'document_manifest_sensitive_material'
  | 'repeated_denied_attempts'
  | 'blocked_field_attempt'
  | 'active_parish_scope_denied'
  | 'metadata_incomplete'
  | 'row_count_unusually_high'
  | 'route_preset_mismatch'

export type ExportAuditReviewerMetadataStatus = 'complete' | 'incomplete'
export type ExportAuditReviewerScanStatus = 'clear' | 'blocked_marker_detected'
export type ExportAuditReviewerReviewStatus =
  | 'ready_for_review'
  | 'needs_review'
  | 'needs_escalation'

export type ExportAuditReviewerSeverity = 'none' | 'severity_3' | 'severity_2' | 'severity_1'

export type ExportAuditReviewerSourceEvent = {
  readonly id?: unknown
  readonly created_at?: unknown
  readonly action?: unknown
  readonly actor_email?: unknown
  readonly parish_id?: unknown
  readonly target_type?: unknown
  readonly target_id?: unknown
  readonly metadata?: unknown
}

export type ExportAuditReviewerBuildOptions = {
  readonly approvedWindow?: {
    readonly startsAt: string
    readonly endsAt: string
  }
  readonly rollbackDeadline?: string
  readonly flagsExpectedOff?: boolean
  readonly highRowCountThreshold?: number
  readonly repeatedDeniedThreshold?: number
  readonly reviewerLabel?: string | null
  readonly reviewedAt?: string | null
  readonly evidenceReference?: string | null
}

export type ExportAuditReviewerReadModelRow = {
  readonly version: typeof EXPORT_AUDIT_REVIEWER_READ_MODEL_VERSION
  readonly audit_event_id: string
  readonly created_at: string
  readonly event_action: string
  readonly export_route_id: string
  readonly export_preset_id: string
  readonly target_object_type: string
  readonly target_object_id_label: string
  readonly decision: ExportAuditDecision
  readonly http_status: number | null
  readonly denied_reason_code: string | null
  readonly runtime_gate_state: string
  readonly runtime_environment_label: string
  readonly staff_user_id_label: string
  readonly staff_email_label: string
  readonly active_parish_id_label: string
  readonly active_parish_name_label: string
  readonly parish_ids_included_count: number | null
  readonly membership_scope_status: string
  readonly request_ownership_status: string
  readonly requested_active_parish_cookie_present: boolean
  readonly requested_fields_count: number | null
  readonly blocked_fields_requested_count: number | null
  readonly disallowed_fields_count: number | null
  readonly row_count_bucket: string
  readonly delivery_format: string
  readonly csv_header_approved: boolean | null
  readonly manifest_only: boolean
  readonly safe_metadata_only: true
  readonly secret_marker_scan_status: ExportAuditReviewerScanStatus
  readonly file_material_marker_scan_status: ExportAuditReviewerScanStatus
  readonly family_or_unauthenticated_boundary: boolean
  readonly cross_parish_boundary: boolean
  readonly blocked_field_boundary: boolean
  readonly post_rollback_boundary: boolean
  readonly metadata_completeness_status: ExportAuditReviewerMetadataStatus
  readonly review_status: ExportAuditReviewerReviewStatus
  readonly severity: ExportAuditReviewerSeverity
  readonly reviewer_label: string
  readonly reviewed_at: string | null
  readonly evidence_reference: string
  readonly follow_up_reference: string | null
  readonly rollback_required: boolean
  readonly incident_response_required: boolean
  readonly saved_filters: readonly ExportAuditReviewerSavedFilterId[]
  readonly suspicious_rules: readonly ExportAuditReviewerSuspiciousRuleId[]
}

type Metadata = Record<string, unknown>

const knownRoutePresetPairs = {
  'app/api/exports/requests/basic': 'request_list_basic',
  'app/api/exports/requests/documents/manifest': 'request_document_manifest',
} as const

const secretMarkerPatterns = [
  /postgresql:\/\//i,
  /service[_ -]?role/i,
  /api[_ -]?key/i,
  /access[_ -]?token/i,
  /refresh[_ -]?token/i,
  /token[_ -]?hash/i,
  /portal[_ -]?token/i,
  /client[_ -]?secret/i,
  /sb_secret_/i,
  /\beyJ[a-zA-Z0-9_-]{8,}/,
] as const

const fileMaterialMarkerPatterns = [
  /signed[_ -]?url/i,
  /storage[_ -]?path/i,
  /original[_ -]?filename/i,
  /file[_ -]?content/i,
  /document[_ -]?content/i,
  /raw[_ -]?csv/i,
  /raw[_ -]?prompt/i,
  /ai[_ -]?output/i,
  /sacramental/i,
  /canonical/i,
] as const

function isRecord(value: unknown): value is Metadata {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asMetadata(value: unknown): Metadata {
  return isRecord(value) ? value : {}
}

function firstValue(metadata: Metadata, keys: readonly string[]): unknown {
  for (const key of keys) {
    if (key in metadata) return metadata[key]
  }
  return null
}

function cleanLabel(value: unknown, fallback = 'not_recorded'): string {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  if (!text) return fallback
  if (containsMarker(text, [...secretMarkerPatterns, ...fileMaterialMarkerPatterns])) {
    return 'redacted_sensitive_marker'
  }
  return text.slice(0, 160)
}

function optionalString(value: unknown): string | null {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  return text ? text.slice(0, 160) : null
}

function numberValue(value: unknown): number | null {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function booleanValue(value: unknown): boolean {
  return value === true
}

function arrayCount(value: unknown): number | null {
  if (Array.isArray(value)) return value.length
  return numberValue(value)
}

function containsMarker(value: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(value))
}

function metadataContainsMarker(metadata: Metadata, patterns: readonly RegExp[]): boolean {
  const serialized = JSON.stringify(metadata)
  if (!serialized) return false
  return containsMarker(serialized, patterns)
}

function parseTime(value: string | null): number | null {
  if (!value) return null
  const time = Date.parse(value)
  return Number.isFinite(time) ? time : null
}

function deriveDecision(action: string, metadata: Metadata, httpStatus: number | null): ExportAuditDecision {
  if (action.endsWith('.downloaded')) return 'downloaded'
  if (action.endsWith('.denied')) return 'denied'
  if (httpStatus === 404) return 'unavailable'
  const metadataDecision = cleanLabel(firstValue(metadata, ['decision']), '')
  if (metadataDecision === 'downloaded' || metadataDecision === 'denied') return metadataDecision
  return 'malformed'
}

function rowCountBucket(value: number | null): string {
  if (value === null) return 'unknown'
  if (value <= 0) return 'none'
  if (value <= 100) return '1-100'
  if (value <= 1000) return '101-1000'
  if (value <= 5000) return '1001-5000'
  return 'over_5000'
}

function isOutsideApprovedWindow(createdAt: string, options: ExportAuditReviewerBuildOptions): boolean {
  if (!options.approvedWindow) return false
  const created = parseTime(createdAt)
  const starts = parseTime(options.approvedWindow.startsAt)
  const ends = parseTime(options.approvedWindow.endsAt)
  if (created === null || starts === null || ends === null) return true
  return created < starts || created > ends
}

function isAfterRollback(createdAt: string, rollbackDeadline?: string): boolean {
  const created = parseTime(createdAt)
  const rollback = parseTime(rollbackDeadline ?? null)
  return created !== null && rollback !== null && created > rollback
}

function routePresetMismatch(routeId: string, presetId: string): boolean {
  const expectedPreset = knownRoutePresetPairs[routeId as keyof typeof knownRoutePresetPairs]
  return Boolean(expectedPreset && expectedPreset !== presetId)
}

function severityFromRules(
  rules: readonly ExportAuditReviewerSuspiciousRuleId[]
): ExportAuditReviewerSeverity {
  const severityOneRules: readonly ExportAuditReviewerSuspiciousRuleId[] = [
    'downloaded_outside_approval_window',
    'downloaded_after_rollback',
    'downloaded_while_flags_off',
    'cross_parish_delivery',
    'family_or_unauthenticated_delivery',
    'document_manifest_sensitive_material',
  ]
  const severityTwoRules: readonly ExportAuditReviewerSuspiciousRuleId[] = [
    'repeated_denied_attempts',
    'blocked_field_attempt',
    'active_parish_scope_denied',
    'row_count_unusually_high',
    'route_preset_mismatch',
  ]

  if (rules.some((rule) => severityOneRules.includes(rule))) return 'severity_1'
  if (rules.some((rule) => severityTwoRules.includes(rule))) return 'severity_2'
  if (rules.includes('metadata_incomplete')) return 'severity_3'
  return 'none'
}

function reviewStatusFromSeverity(severity: ExportAuditReviewerSeverity): ExportAuditReviewerReviewStatus {
  if (severity === 'severity_1') return 'needs_escalation'
  if (severity === 'severity_2' || severity === 'severity_3') return 'needs_review'
  return 'ready_for_review'
}

function unique<T extends string>(values: readonly T[]): readonly T[] {
  return Array.from(new Set(values))
}

function buildBaseRow(
  event: ExportAuditReviewerSourceEvent,
  options: ExportAuditReviewerBuildOptions
): ExportAuditReviewerReadModelRow {
  const metadata = asMetadata(event.metadata)
  const action = cleanLabel(event.action, 'missing_action')
  const httpStatus = numberValue(firstValue(metadata, ['httpStatus', 'http_status']))
  const decision = deriveDecision(action, metadata, httpStatus)
  const routeId = cleanLabel(firstValue(metadata, ['routeId', 'route_id']), 'missing_route')
  const presetId = cleanLabel(
    firstValue(metadata, ['export_preset_id', 'exportPresetId', 'presetId']) ?? event.target_id,
    'missing_preset'
  )
  const targetObjectType = cleanLabel(
    firstValue(metadata, ['target_object_type', 'targetObjectType']) ?? event.target_type,
    'missing_target_object_type'
  )
  const rowCount = numberValue(firstValue(metadata, ['row_count_or_estimate', 'rowCount', 'row_count']))
  const requestedFieldsCount = numberValue(
    firstValue(metadata, ['requestedFieldsCount', 'requested_fields_count'])
  )
  const blockedFieldsRequestedCount = numberValue(
    firstValue(metadata, ['blockedFieldsRequestedCount', 'blocked_fields_requested_count'])
  )
  const disallowedFieldsCount = numberValue(
    firstValue(metadata, ['disallowedFieldsCount', 'disallowed_fields_count'])
  )
  const deniedReasonCode = optionalString(firstValue(metadata, ['deniedReasonCode', 'denied_reason_code']))
  const afterRollback = isAfterRollback(cleanLabel(event.created_at, ''), options.rollbackDeadline)
  const secretMarkersPresent = metadataContainsMarker(metadata, secretMarkerPatterns)
  const fileMarkersPresent = metadataContainsMarker(metadata, fileMaterialMarkerPatterns)
  const familyBoundary =
    deniedReasonCode === 'unauthenticated_or_non_staff' ||
    booleanValue(firstValue(metadata, ['familyPortalSurface', 'family_or_unauthenticated_boundary']))
  const crossParishBoundary =
    deniedReasonCode === 'active_parish_scope_denied' ||
    deniedReasonCode === 'selected_parish_role_denied' ||
    booleanValue(firstValue(metadata, ['crossParishBoundary', 'cross_parish_boundary']))
  const blockedFieldBoundary =
    deniedReasonCode === 'blocked_or_disallowed_fields' ||
    deniedReasonCode === 'export_permission_denied' ||
    (blockedFieldsRequestedCount ?? 0) > 0 ||
    (disallowedFieldsCount ?? 0) > 0
  const safeMetadataOnly = firstValue(metadata, ['safeMetadataOnly', 'safe_metadata_only']) === true
  const metadataIncomplete =
    !safeMetadataOnly ||
    action === 'missing_action' ||
    !cleanLabel(event.created_at, '') ||
    routeId === 'missing_route' ||
    presetId === 'missing_preset' ||
    targetObjectType === 'missing_target_object_type' ||
    decision === 'malformed' ||
    (decision === 'denied' && !deniedReasonCode)

  const suspiciousRules: ExportAuditReviewerSuspiciousRuleId[] = []
  if (decision === 'downloaded' && isOutsideApprovedWindow(cleanLabel(event.created_at, ''), options)) {
    suspiciousRules.push('downloaded_outside_approval_window')
  }
  if (decision === 'downloaded' && afterRollback) suspiciousRules.push('downloaded_after_rollback')
  if (decision === 'downloaded' && options.flagsExpectedOff === true) {
    suspiciousRules.push('downloaded_while_flags_off')
  }
  if (decision === 'downloaded' && crossParishBoundary) suspiciousRules.push('cross_parish_delivery')
  if (decision === 'downloaded' && familyBoundary) suspiciousRules.push('family_or_unauthenticated_delivery')
  if (presetId === 'request_document_manifest' && (secretMarkersPresent || fileMarkersPresent)) {
    suspiciousRules.push('document_manifest_sensitive_material')
  }
  if (blockedFieldBoundary) suspiciousRules.push('blocked_field_attempt')
  if (
    deniedReasonCode === 'active_parish_scope_denied' ||
    deniedReasonCode === 'selected_parish_role_denied'
  ) {
    suspiciousRules.push('active_parish_scope_denied')
  }
  if (metadataIncomplete) suspiciousRules.push('metadata_incomplete')
  if (rowCount !== null && rowCount > (options.highRowCountThreshold ?? 5000)) {
    suspiciousRules.push('row_count_unusually_high')
  }
  if (routePresetMismatch(routeId, presetId)) suspiciousRules.push('route_preset_mismatch')

  const savedFilters: ExportAuditReviewerSavedFilterId[] = []
  if (decision === 'downloaded') savedFilters.push('exports_downloaded_recent')
  if (decision === 'denied') savedFilters.push('exports_denied_recent')
  if (blockedFieldBoundary) savedFilters.push('exports_blocked_field_attempts')
  if (crossParishBoundary) savedFilters.push('exports_cross_parish_or_forged_scope')
  if (familyBoundary) savedFilters.push('exports_family_or_unauthenticated')
  if (afterRollback) savedFilters.push('exports_after_rollback')
  if (metadataIncomplete) savedFilters.push('exports_metadata_incomplete')
  if (presetId === 'request_document_manifest') savedFilters.push('document_manifest_safety_review')
  if (presetId === 'request_list_basic') savedFilters.push('request_list_basic_safety_review')

  const severity = severityFromRules(suspiciousRules)

  return {
    version: EXPORT_AUDIT_REVIEWER_READ_MODEL_VERSION,
    audit_event_id: cleanLabel(event.id),
    created_at: cleanLabel(event.created_at),
    event_action: action,
    export_route_id: routeId,
    export_preset_id: presetId,
    target_object_type: targetObjectType,
    target_object_id_label: cleanLabel(event.target_id),
    decision,
    http_status: httpStatus,
    denied_reason_code: deniedReasonCode,
    runtime_gate_state: cleanLabel(firstValue(metadata, ['runtimeGateState', 'runtime_gate_state'])),
    runtime_environment_label: cleanLabel(
      firstValue(metadata, ['runtimeEnvironmentLabel', 'runtime_environment_label']),
      'not_recorded_non_production_review'
    ),
    staff_user_id_label: cleanLabel(firstValue(metadata, ['staff_user_id_or_email', 'staffUserId'])),
    staff_email_label: cleanLabel(event.actor_email),
    active_parish_id_label: cleanLabel(
      firstValue(metadata, ['active_parish_id', 'activeParishId']) ?? event.parish_id
    ),
    active_parish_name_label: cleanLabel(
      firstValue(metadata, ['active_parish_name', 'selectedParishName'])
    ),
    parish_ids_included_count: arrayCount(firstValue(metadata, ['parish_ids_included'])),
    membership_scope_status: cleanLabel(
      firstValue(metadata, ['membershipScopeStatus', 'membership_scope_status']),
      crossParishBoundary ? 'denied' : 'not_recorded'
    ),
    request_ownership_status: cleanLabel(
      firstValue(metadata, ['requestOwnershipStatus', 'request_ownership_status']),
      'not_recorded'
    ),
    requested_active_parish_cookie_present: booleanValue(
      firstValue(metadata, [
        'requestedActiveParishCookiePresent',
        'requested_active_parish_cookie_present',
      ])
    ),
    requested_fields_count: requestedFieldsCount,
    blocked_fields_requested_count: blockedFieldsRequestedCount,
    disallowed_fields_count: disallowedFieldsCount,
    row_count_bucket: rowCountBucket(rowCount),
    delivery_format: cleanLabel(firstValue(metadata, ['delivery_format', 'destination']), 'not_delivered'),
    csv_header_approved: firstValue(metadata, ['csvHeaderApproved', 'csv_header_approved']) === true,
    manifest_only: presetId === 'request_document_manifest',
    safe_metadata_only: true,
    secret_marker_scan_status: secretMarkersPresent ? 'blocked_marker_detected' : 'clear',
    file_material_marker_scan_status: fileMarkersPresent ? 'blocked_marker_detected' : 'clear',
    family_or_unauthenticated_boundary: familyBoundary,
    cross_parish_boundary: crossParishBoundary,
    blocked_field_boundary: blockedFieldBoundary,
    post_rollback_boundary: afterRollback,
    metadata_completeness_status: metadataIncomplete ? 'incomplete' : 'complete',
    review_status: reviewStatusFromSeverity(severity),
    severity,
    reviewer_label: cleanLabel(options.reviewerLabel, 'unassigned_reviewer'),
    reviewed_at: optionalString(options.reviewedAt),
    evidence_reference: cleanLabel(options.evidenceReference, 'not_recorded'),
    follow_up_reference: null,
    rollback_required: severity === 'severity_1',
    incident_response_required: severity === 'severity_1',
    saved_filters: unique(savedFilters),
    suspicious_rules: unique(suspiciousRules),
  }
}

function repeatedDeniedKey(row: ExportAuditReviewerReadModelRow): string {
  return `${row.staff_email_label}::${row.export_preset_id}`
}

function addRepeatedDeniedClassifications(
  rows: readonly ExportAuditReviewerReadModelRow[],
  threshold: number
): readonly ExportAuditReviewerReadModelRow[] {
  const counts = new Map<string, number>()
  for (const row of rows) {
    if (row.decision === 'denied') {
      const key = repeatedDeniedKey(row)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }

  return rows.map((row) => {
    if (row.decision !== 'denied' || (counts.get(repeatedDeniedKey(row)) ?? 0) < threshold) {
      return row
    }

    const suspiciousRules = unique([...row.suspicious_rules, 'repeated_denied_attempts'])
    const savedFilters = unique([...row.saved_filters, 'repeated_denials_by_actor'])
    const severity = severityFromRules(suspiciousRules)

    return {
      ...row,
      suspicious_rules: suspiciousRules,
      saved_filters: savedFilters,
      severity,
      review_status: reviewStatusFromSeverity(severity),
      rollback_required: severity === 'severity_1',
      incident_response_required: severity === 'severity_1',
    }
  })
}

export function buildExportAuditReviewerReadModel(
  events: readonly ExportAuditReviewerSourceEvent[],
  options: ExportAuditReviewerBuildOptions = {}
): readonly ExportAuditReviewerReadModelRow[] {
  const rows = events.map((event) => buildBaseRow(event, options))
  return addRepeatedDeniedClassifications(rows, options.repeatedDeniedThreshold ?? 2)
}
