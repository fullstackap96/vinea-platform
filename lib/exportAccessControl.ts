export const EXPORT_ACCESS_CONTROL_DTO_VERSION = '2026-06-30-export-access-non-runtime-v1'

export type ExportDataClassId =
  | 'basic_operational'
  | 'people_households'
  | 'request_workflow'
  | 'mass_intentions'
  | 'sensitive_parish'
  | 'sacramental_canonical'
  | 'document_manifest'
  | 'document_files'
  | 'audit_security'
  | 'public_intake_routing'
  | 'ai_staff_outputs'
  | 'diocesan_rollup'
  | 'support_break_glass'

export type ExportPermissionId =
  | 'view_same_parish_records'
  | 'export_same_parish_basic'
  | 'export_same_parish_sensitive'
  | 'export_sacramental_canonical'
  | 'export_audit_security'
  | 'export_documents_manifest'
  | 'export_document_files'
  | 'export_multi_parish_rollup'
  | 'support_break_glass_export'

export type ExportRoleId =
  | 'parish_admin'
  | 'pastor'
  | 'parish_secretary'
  | 'dre_ocia_coordinator'
  | 'deacon'
  | 'diocese_admin_future'
  | 'vinea_support_operator'

export type ExportDecision =
  | 'allowed_non_runtime'
  | 'denied_non_runtime'
  | 'approval_required_non_runtime'
  | 'disabled_non_runtime'

export type ExportPresetId =
  | 'people_households_basic'
  | 'request_list_basic'
  | 'mass_intentions_basic'
  | 'workflow_task_status'
  | 'sensitive_request_notes'
  | 'communication_history_sensitive'
  | 'sacramental_records_certificate_evidence'
  | 'request_document_manifest'
  | 'request_document_files_bulk'
  | 'audit_security_window'
  | 'public_intake_routing_history'
  | 'diocesan_multi_parish_rollup'
  | 'support_break_glass_package'

export type ExportDestination = 'download' | 'async_job' | 'support_package'

export type ExportDataClassPolicy = {
  readonly id: ExportDataClassId
  readonly label: string
  readonly familyFacingExportAllowed: boolean
  readonly sacramentalCanonicalRestricted: boolean
  readonly reasonRequired: boolean
  readonly elevatedRoleRequired: boolean
  readonly runtimeExportEnabled: boolean
  readonly auditRequired: true
  readonly retentionExpectation: string
}

export type ExportPresetPolicy = {
  readonly id: ExportPresetId
  readonly label: string
  readonly requiredPermission: ExportPermissionId
  readonly dataClasses: readonly ExportDataClassId[]
  readonly reasonRequired: boolean
  readonly elevatedRoleRequired: boolean
  readonly runtimeExportEnabled: boolean
  readonly maxSynchronousRows: number
  readonly destination: ExportDestination
}

export const EXPORT_DATA_CLASS_POLICIES = {
  basic_operational: {
    id: 'basic_operational',
    label: 'Basic operational fields',
    familyFacingExportAllowed: false,
    sacramentalCanonicalRestricted: false,
    reasonRequired: false,
    elevatedRoleRequired: false,
    runtimeExportEnabled: false,
    auditRequired: true,
    retentionExpectation: 'Follow the parent operational record retention policy.',
  },
  people_households: {
    id: 'people_households',
    label: 'People and household basics',
    familyFacingExportAllowed: false,
    sacramentalCanonicalRestricted: false,
    reasonRequired: false,
    elevatedRoleRequired: false,
    runtimeExportEnabled: false,
    auditRequired: true,
    retentionExpectation: 'Follow people and household retention rules.',
  },
  request_workflow: {
    id: 'request_workflow',
    label: 'Request and workflow status',
    familyFacingExportAllowed: false,
    sacramentalCanonicalRestricted: false,
    reasonRequired: false,
    elevatedRoleRequired: false,
    runtimeExportEnabled: false,
    auditRequired: true,
    retentionExpectation: 'Follow request and workflow-step retention rules.',
  },
  mass_intentions: {
    id: 'mass_intentions',
    label: 'Mass intention basics',
    familyFacingExportAllowed: false,
    sacramentalCanonicalRestricted: false,
    reasonRequired: false,
    elevatedRoleRequired: false,
    runtimeExportEnabled: false,
    auditRequired: true,
    retentionExpectation: 'Follow mass intention retention rules.',
  },
  sensitive_parish: {
    id: 'sensitive_parish',
    label: 'Sensitive parish operational data',
    familyFacingExportAllowed: false,
    sacramentalCanonicalRestricted: false,
    reasonRequired: true,
    elevatedRoleRequired: true,
    runtimeExportEnabled: false,
    auditRequired: true,
    retentionExpectation: 'Follow internal note and communication-history retention rules.',
  },
  sacramental_canonical: {
    id: 'sacramental_canonical',
    label: 'Sacramental and canonical records',
    familyFacingExportAllowed: false,
    sacramentalCanonicalRestricted: true,
    reasonRequired: true,
    elevatedRoleRequired: true,
    runtimeExportEnabled: false,
    auditRequired: true,
    retentionExpectation: 'Follow sacramental/canonical record retention; do not hard-delete automatically.',
  },
  document_manifest: {
    id: 'document_manifest',
    label: 'Document metadata manifest',
    familyFacingExportAllowed: false,
    sacramentalCanonicalRestricted: false,
    reasonRequired: false,
    elevatedRoleRequired: false,
    runtimeExportEnabled: false,
    auditRequired: true,
    retentionExpectation: 'Follow request document metadata retention rules.',
  },
  document_files: {
    id: 'document_files',
    label: 'Document files',
    familyFacingExportAllowed: false,
    sacramentalCanonicalRestricted: false,
    reasonRequired: true,
    elevatedRoleRequired: true,
    runtimeExportEnabled: false,
    auditRequired: true,
    retentionExpectation: 'Bulk file export is disabled until document export approval is complete.',
  },
  audit_security: {
    id: 'audit_security',
    label: 'Audit and security events',
    familyFacingExportAllowed: false,
    sacramentalCanonicalRestricted: false,
    reasonRequired: true,
    elevatedRoleRequired: true,
    runtimeExportEnabled: false,
    auditRequired: true,
    retentionExpectation: 'Follow audit-log retention and incident evidence rules.',
  },
  public_intake_routing: {
    id: 'public_intake_routing',
    label: 'Public intake routing history',
    familyFacingExportAllowed: false,
    sacramentalCanonicalRestricted: false,
    reasonRequired: true,
    elevatedRoleRequired: true,
    runtimeExportEnabled: false,
    auditRequired: true,
    retentionExpectation: 'Follow audit-log and routing-metadata retention rules.',
  },
  ai_staff_outputs: {
    id: 'ai_staff_outputs',
    label: 'AI staff outputs',
    familyFacingExportAllowed: false,
    sacramentalCanonicalRestricted: false,
    reasonRequired: true,
    elevatedRoleRequired: true,
    runtimeExportEnabled: false,
    auditRequired: true,
    retentionExpectation: 'Export safe AI references only; never export raw prompts or provider payloads.',
  },
  diocesan_rollup: {
    id: 'diocesan_rollup',
    label: 'Future diocesan or cluster rollup',
    familyFacingExportAllowed: false,
    sacramentalCanonicalRestricted: false,
    reasonRequired: true,
    elevatedRoleRequired: true,
    runtimeExportEnabled: false,
    auditRequired: true,
    retentionExpectation: 'Disabled until diocesan governance and production RLS approval are complete.',
  },
  support_break_glass: {
    id: 'support_break_glass',
    label: 'Support break-glass package',
    familyFacingExportAllowed: false,
    sacramentalCanonicalRestricted: false,
    reasonRequired: true,
    elevatedRoleRequired: true,
    runtimeExportEnabled: false,
    auditRequired: true,
    retentionExpectation: 'Disabled until support owner approval and evidence handling are complete.',
  },
} as const satisfies Record<ExportDataClassId, ExportDataClassPolicy>

export const EXPORT_PRESET_POLICIES = {
  people_households_basic: {
    id: 'people_households_basic',
    label: "Download this parish's people and household basics",
    requiredPermission: 'export_same_parish_basic',
    dataClasses: ['basic_operational', 'people_households'],
    reasonRequired: false,
    elevatedRoleRequired: false,
    runtimeExportEnabled: false,
    maxSynchronousRows: 5000,
    destination: 'download',
  },
  request_list_basic: {
    id: 'request_list_basic',
    label: "Download this parish's request list",
    requiredPermission: 'export_same_parish_basic',
    dataClasses: ['basic_operational', 'request_workflow'],
    reasonRequired: false,
    elevatedRoleRequired: false,
    runtimeExportEnabled: false,
    maxSynchronousRows: 5000,
    destination: 'download',
  },
  mass_intentions_basic: {
    id: 'mass_intentions_basic',
    label: "Download this parish's mass intention list",
    requiredPermission: 'export_same_parish_basic',
    dataClasses: ['basic_operational', 'mass_intentions'],
    reasonRequired: false,
    elevatedRoleRequired: false,
    runtimeExportEnabled: false,
    maxSynchronousRows: 5000,
    destination: 'download',
  },
  workflow_task_status: {
    id: 'workflow_task_status',
    label: "Download this parish's workflow task status",
    requiredPermission: 'export_same_parish_basic',
    dataClasses: ['basic_operational', 'request_workflow'],
    reasonRequired: false,
    elevatedRoleRequired: false,
    runtimeExportEnabled: false,
    maxSynchronousRows: 5000,
    destination: 'download',
  },
  sensitive_request_notes: {
    id: 'sensitive_request_notes',
    label: 'Download sensitive request notes',
    requiredPermission: 'export_same_parish_sensitive',
    dataClasses: ['sensitive_parish'],
    reasonRequired: true,
    elevatedRoleRequired: true,
    runtimeExportEnabled: false,
    maxSynchronousRows: 1000,
    destination: 'async_job',
  },
  communication_history_sensitive: {
    id: 'communication_history_sensitive',
    label: 'Download sensitive communication history',
    requiredPermission: 'export_same_parish_sensitive',
    dataClasses: ['sensitive_parish'],
    reasonRequired: true,
    elevatedRoleRequired: true,
    runtimeExportEnabled: false,
    maxSynchronousRows: 1000,
    destination: 'async_job',
  },
  sacramental_records_certificate_evidence: {
    id: 'sacramental_records_certificate_evidence',
    label: 'Download sacramental record and certificate evidence',
    requiredPermission: 'export_sacramental_canonical',
    dataClasses: ['sacramental_canonical'],
    reasonRequired: true,
    elevatedRoleRequired: true,
    runtimeExportEnabled: false,
    maxSynchronousRows: 500,
    destination: 'async_job',
  },
  request_document_manifest: {
    id: 'request_document_manifest',
    label: 'Download request document manifest',
    requiredPermission: 'export_documents_manifest',
    dataClasses: ['document_manifest'],
    reasonRequired: false,
    elevatedRoleRequired: false,
    runtimeExportEnabled: false,
    maxSynchronousRows: 5000,
    destination: 'download',
  },
  request_document_files_bulk: {
    id: 'request_document_files_bulk',
    label: 'Bulk download request document files',
    requiredPermission: 'export_document_files',
    dataClasses: ['document_files'],
    reasonRequired: true,
    elevatedRoleRequired: true,
    runtimeExportEnabled: false,
    maxSynchronousRows: 0,
    destination: 'async_job',
  },
  audit_security_window: {
    id: 'audit_security_window',
    label: 'Download audit and security event window',
    requiredPermission: 'export_audit_security',
    dataClasses: ['audit_security'],
    reasonRequired: true,
    elevatedRoleRequired: true,
    runtimeExportEnabled: false,
    maxSynchronousRows: 1000,
    destination: 'async_job',
  },
  public_intake_routing_history: {
    id: 'public_intake_routing_history',
    label: 'Download public intake routing history',
    requiredPermission: 'export_audit_security',
    dataClasses: ['public_intake_routing'],
    reasonRequired: true,
    elevatedRoleRequired: true,
    runtimeExportEnabled: false,
    maxSynchronousRows: 1000,
    destination: 'async_job',
  },
  diocesan_multi_parish_rollup: {
    id: 'diocesan_multi_parish_rollup',
    label: 'Download future diocesan multi-parish rollup',
    requiredPermission: 'export_multi_parish_rollup',
    dataClasses: ['diocesan_rollup'],
    reasonRequired: true,
    elevatedRoleRequired: true,
    runtimeExportEnabled: false,
    maxSynchronousRows: 0,
    destination: 'async_job',
  },
  support_break_glass_package: {
    id: 'support_break_glass_package',
    label: 'Prepare support break-glass export package',
    requiredPermission: 'support_break_glass_export',
    dataClasses: ['support_break_glass'],
    reasonRequired: true,
    elevatedRoleRequired: true,
    runtimeExportEnabled: false,
    maxSynchronousRows: 0,
    destination: 'support_package',
  },
} as const satisfies Record<ExportPresetId, ExportPresetPolicy>

export const EXPORT_ROLE_DEFAULT_PERMISSIONS = {
  parish_admin: [
    'view_same_parish_records',
    'export_same_parish_basic',
    'export_same_parish_sensitive',
    'export_sacramental_canonical',
    'export_documents_manifest',
  ],
  pastor: [
    'view_same_parish_records',
    'export_same_parish_basic',
    'export_same_parish_sensitive',
    'export_sacramental_canonical',
    'export_documents_manifest',
  ],
  parish_secretary: [
    'view_same_parish_records',
    'export_same_parish_basic',
    'export_documents_manifest',
  ],
  dre_ocia_coordinator: ['view_same_parish_records', 'export_same_parish_basic'],
  deacon: ['view_same_parish_records', 'export_same_parish_basic'],
  diocese_admin_future: ['view_same_parish_records'],
  vinea_support_operator: [],
} as const satisfies Record<ExportRoleId, readonly ExportPermissionId[]>

export const BLOCKED_EXPORT_FIELD_PATTERNS = [
  'password',
  'service_role',
  'secret',
  'access_token',
  'refresh_token',
  'token_hash',
  'portal_token_hash',
  'public_intake_token_hash',
  'signed_url',
  'signed-url',
  'raw_prompt',
  'raw_openai_prompt',
  'provider_payload',
  'raw_provider_payload',
  'raw_ai_token',
  'direct_storage_path',
  'debug_payload',
] as const

export const EXPORT_AUDIT_METADATA_REQUIREMENTS = [
  'staff_user_id_or_email',
  'active_parish_id',
  'parish_ids_included',
  'export_preset_id',
  'target_object_type',
  'filters_summary',
  'row_count_or_estimate',
  'destination',
  'export_reason',
  'decision',
  'timestamp',
] as const

const APPROVAL_REQUIRED_EXPORT_PERMISSIONS: readonly ExportPermissionId[] = [
  'export_audit_security',
  'export_document_files',
  'export_multi_parish_rollup',
  'support_break_glass_export',
]

export type ExportPermissionEvaluationInput = {
  readonly staff: {
    readonly userId?: string | null
    readonly email: string
    readonly roles: readonly ExportRoleId[]
  }
  readonly scope: {
    readonly activeParishId: string
    readonly membershipParishIds: readonly string[]
    readonly targetParishIds: readonly string[]
    readonly selectedParishName?: string | null
  }
  readonly request: {
    readonly presetId: ExportPresetId
    readonly targetObjectType: string
    readonly requestedFields: readonly string[]
    readonly filtersSummary?: string | null
    readonly estimatedRowCount?: number | null
    readonly reason?: string | null
    readonly familyPortalSurface?: boolean
  }
  readonly timestamp?: string | null
}

export type ExportPermissionEvaluationDto = {
  readonly dtoVersion: typeof EXPORT_ACCESS_CONTROL_DTO_VERSION
  readonly runtimeState: 'non_runtime_export_permission_only'
  readonly decision: ExportDecision
  readonly blockedReason: string | null
  readonly staffIdentity: {
    readonly userId: string | null
    readonly email: string
    readonly roles: readonly ExportRoleId[]
  }
  readonly activeParishId: string
  readonly selectedParishName: string | null
  readonly parishIdsIncluded: readonly string[]
  readonly membershipParishIds: readonly string[]
  readonly preset: {
    readonly id: ExportPresetId
    readonly label: string
    readonly requiredPermission: ExportPermissionId
    readonly dataClasses: readonly ExportDataClassId[]
    readonly destination: ExportDestination
    readonly runtimeExportEnabled: false
    readonly reasonRequired: boolean
    readonly elevatedRoleRequired: boolean
    readonly maxSynchronousRows: number
  }
  readonly requestedFields: readonly string[]
  readonly blockedFieldsRequested: readonly string[]
  readonly reason: string | null
  readonly targetObjectType: string
  readonly filtersSummary: string | null
  readonly estimatedRowCount: number | null
  readonly familyPortalSurface: boolean
  readonly requiresAuditEvent: true
  readonly humanApprovalRequired: boolean
  readonly familyFacingExportAllowed: false
  readonly sacramentalCanonicalRestricted: boolean
  readonly auditMetadataTemplate: {
    readonly requirements: typeof EXPORT_AUDIT_METADATA_REQUIREMENTS
    readonly staff_user_id_or_email: string
    readonly active_parish_id: string
    readonly parish_ids_included: readonly string[]
    readonly export_preset_id: ExportPresetId
    readonly target_object_type: string
    readonly filters_summary: string | null
    readonly row_count_or_estimate: number | null
    readonly destination: ExportDestination
    readonly export_reason: string | null
    readonly decision: ExportDecision
    readonly timestamp: string | null
    readonly safeMetadataOnly: true
  }
}

export type ExportPermissionEvaluationResult =
  | { readonly ok: true; readonly dto: ExportPermissionEvaluationDto }
  | { readonly ok: false; readonly blockedReason: string }

const unsafeTextPattern =
  /\b(password|secret|service[_ -]?role|access[_ -]?token|refresh[_ -]?token|signed[_ -]?url|raw[_ -]?prompt|provider[_ -]?payload|token[_ -]?hash)\b/i

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizeField(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')
}

function uniqueClean(values: readonly string[]): readonly string[] {
  return Array.from(new Set(values.map(cleanText).filter(Boolean)))
}

function fieldIsBlocked(field: string): boolean {
  const normalized = normalizeField(field)
  return BLOCKED_EXPORT_FIELD_PATTERNS.some((pattern) => normalized.includes(pattern))
}

function permissionsForRoles(roles: readonly ExportRoleId[]): Set<ExportPermissionId> {
  const permissions = new Set<ExportPermissionId>()
  for (const role of roles) {
    for (const permission of EXPORT_ROLE_DEFAULT_PERMISSIONS[role]) {
      permissions.add(permission)
    }
  }
  return permissions
}

function result(blockedReason: string): ExportPermissionEvaluationResult {
  return { ok: false, blockedReason }
}

export function buildExportPermissionEvaluationDto(
  input: ExportPermissionEvaluationInput
): ExportPermissionEvaluationResult {
  const staffEmail = input.staff.email.trim().toLowerCase()
  const staffUserId = input.staff.userId?.trim() || null
  const activeParishId = input.scope.activeParishId.trim()
  const membershipParishIds = uniqueClean(input.scope.membershipParishIds)
  const parishIdsIncluded = uniqueClean(input.scope.targetParishIds)
  const requestedFields = uniqueClean(input.request.requestedFields)
  const targetObjectType = cleanText(input.request.targetObjectType)
  const reason = input.request.reason ? cleanText(input.request.reason) : null
  const filtersSummary = input.request.filtersSummary ? cleanText(input.request.filtersSummary) : null
  const preset = EXPORT_PRESET_POLICIES[input.request.presetId]

  if (!staffEmail || !activeParishId || parishIdsIncluded.length === 0 || !targetObjectType || requestedFields.length === 0) {
    return result('missing_required_export_scope_or_target')
  }
  if (!membershipParishIds.includes(activeParishId)) {
    return result('active_parish_not_in_staff_memberships')
  }
  if (input.request.familyPortalSurface) {
    return result('family_portal_surface_cannot_export_staff_data')
  }
  if (reason && unsafeTextPattern.test(reason)) {
    return result('unsafe_export_reason')
  }
  if (filtersSummary && unsafeTextPattern.test(filtersSummary)) {
    return result('unsafe_export_filters_summary')
  }

  const blockedFieldsRequested = requestedFields.filter(fieldIsBlocked)
  if (blockedFieldsRequested.length > 0) {
    return result('blocked_export_fields_requested')
  }

  let decision: ExportDecision = 'allowed_non_runtime'
  let blockedReason: string | null = null
  const permissions = permissionsForRoles(input.staff.roles)
  const dataPolicies = preset.dataClasses.map((dataClass) => EXPORT_DATA_CLASS_POLICIES[dataClass])
  const sacramentalCanonicalRestricted = dataPolicies.some((policy) => policy.sacramentalCanonicalRestricted)
  const requiredPermission: ExportPermissionId = preset.requiredPermission
  const humanApprovalRequired =
    preset.reasonRequired ||
    preset.elevatedRoleRequired ||
    APPROVAL_REQUIRED_EXPORT_PERMISSIONS.includes(requiredPermission)

  if (parishIdsIncluded.some((parishId) => !membershipParishIds.includes(parishId))) {
    decision = 'denied_non_runtime'
    blockedReason = 'target_parish_not_in_staff_memberships'
  } else if (parishIdsIncluded.some((parishId) => parishId !== activeParishId)) {
    decision = 'denied_non_runtime'
    blockedReason = 'target_parish_does_not_match_active_parish'
  } else if (!permissions.has(preset.requiredPermission)) {
    decision = 'denied_non_runtime'
    blockedReason = `missing_export_permission:${preset.requiredPermission}`
  } else if (preset.reasonRequired && !reason) {
    decision = 'denied_non_runtime'
    blockedReason = 'export_reason_required'
  } else if (preset.maxSynchronousRows > 0 && (input.request.estimatedRowCount ?? 0) > preset.maxSynchronousRows) {
    decision = 'approval_required_non_runtime'
    blockedReason = 'estimated_row_count_exceeds_synchronous_limit'
  } else if (!preset.runtimeExportEnabled) {
    decision = 'disabled_non_runtime'
    blockedReason = 'runtime_export_not_enabled'
  }

  return {
    ok: true,
    dto: {
      dtoVersion: EXPORT_ACCESS_CONTROL_DTO_VERSION,
      runtimeState: 'non_runtime_export_permission_only',
      decision,
      blockedReason,
      staffIdentity: {
        userId: staffUserId,
        email: staffEmail,
        roles: input.staff.roles,
      },
      activeParishId,
      selectedParishName: input.scope.selectedParishName ? cleanText(input.scope.selectedParishName) : null,
      parishIdsIncluded,
      membershipParishIds,
      preset: {
        id: preset.id,
        label: preset.label,
        requiredPermission: preset.requiredPermission,
        dataClasses: preset.dataClasses,
        destination: preset.destination,
        runtimeExportEnabled: false,
        reasonRequired: preset.reasonRequired,
        elevatedRoleRequired: preset.elevatedRoleRequired,
        maxSynchronousRows: preset.maxSynchronousRows,
      },
      requestedFields,
      blockedFieldsRequested,
      reason,
      targetObjectType,
      filtersSummary,
      estimatedRowCount: input.request.estimatedRowCount ?? null,
      familyPortalSurface: input.request.familyPortalSurface ?? false,
      requiresAuditEvent: true,
      humanApprovalRequired,
      familyFacingExportAllowed: false,
      sacramentalCanonicalRestricted,
      auditMetadataTemplate: {
        requirements: EXPORT_AUDIT_METADATA_REQUIREMENTS,
        staff_user_id_or_email: staffUserId ?? staffEmail,
        active_parish_id: activeParishId,
        parish_ids_included: parishIdsIncluded,
        export_preset_id: preset.id,
        target_object_type: targetObjectType,
        filters_summary: filtersSummary,
        row_count_or_estimate: input.request.estimatedRowCount ?? null,
        destination: preset.destination,
        export_reason: reason,
        decision,
        timestamp: input.timestamp ? cleanText(input.timestamp) : null,
        safeMetadataOnly: true,
      },
    },
  }
}
