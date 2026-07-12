export const EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_GATE_PREFLIGHT_VERSION =
  '2026-07-01-export-audit-reviewer-dashboard-production-gate-preflight-v1'

export type ExportAuditReviewerDashboardProductionGateCheckId =
  | 'qa_ack_still_present'
  | 'qa_ack_production_block'
  | 'production_runtime_flag'
  | 'production_ack'
  | 'production_env_marker'
  | 'surface_allowlist'
  | 'dashboard_surface_scope'
  | 'api_read_model_surface_scope'
  | 'approval_id'
  | 'expires_at'
  | 'rollback_owner'
  | 'monitoring_channel'
  | 'support_owner'
  | 'evidence_storage_owner'

export type ExportAuditReviewerApiSafetyCheckId =
  | 'gate_before_staff_auth'
  | 'staff_auth_before_parish_scope'
  | 'parish_scope_before_admin_client'
  | 'admin_client_before_audit_query'
  | 'approved_audit_actions'
  | 'membership_backed_scope'
  | 'read_model_builder'
  | 'no_store_response'
  | 'no_storage_or_file_delivery'
  | 'no_raw_export_or_mutation_delivery'

export type ExportAuditReviewerDashboardSafetyCheckId =
  | 'non_production_gate_present'
  | 'production_environment_block'
  | 'unavailable_before_dashboard_render'
  | 'production_exports_no_go_label'
  | 'api_read_model_fetch'
  | 'staff_cookie_fetch'
  | 'no_store_fetch'
  | 'saved_filter_controls'
  | 'no_export_or_file_controls'

export type SourcePreflightCheck<Id extends string> = {
  readonly id: Id
  readonly ok: boolean
  readonly matchedMarkers: readonly string[]
  readonly missingMarkers: readonly string[]
}

export type ExportAuditReviewerDashboardProductionGatePreflightResult = {
  readonly ok: boolean
  readonly version: typeof EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_GATE_PREFLIGHT_VERSION
  readonly checks: readonly SourcePreflightCheck<ExportAuditReviewerDashboardProductionGateCheckId>[]
  readonly errors: readonly string[]
}

export type ExportAuditReviewerApiSafetyPreflightResult = {
  readonly ok: boolean
  readonly version: typeof EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_GATE_PREFLIGHT_VERSION
  readonly routeId: 'export_audit_reviewer_api_read_model'
  readonly checks: readonly SourcePreflightCheck<ExportAuditReviewerApiSafetyCheckId>[]
  readonly errors: readonly string[]
}

export type ExportAuditReviewerDashboardSafetyPreflightResult = {
  readonly ok: boolean
  readonly version: typeof EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_GATE_PREFLIGHT_VERSION
  readonly routeId: 'export_audit_reviewer_dashboard'
  readonly checks: readonly SourcePreflightCheck<ExportAuditReviewerDashboardSafetyCheckId>[]
  readonly errors: readonly string[]
}

type RequiredSourceCheck<Id extends string> = {
  readonly id: Id
  readonly requiredMarkers: readonly string[]
  readonly error: string
}

const FUTURE_DASHBOARD_PRODUCTION_GATE_CHECKS: readonly RequiredSourceCheck<ExportAuditReviewerDashboardProductionGateCheckId>[] =
  [
    {
      id: 'qa_ack_still_present',
      requiredMarkers: ['APPROVED_EXPORT_AUDIT_REVIEWER_QA'],
      error: 'The existing non-production QA acknowledgement must remain explicit.',
    },
    {
      id: 'qa_ack_production_block',
      requiredMarkers: ['blocked_production_environment', 'isProductionEnvironment'],
      error: 'Non-production QA flags must still fail closed in production environments.',
    },
    {
      id: 'production_runtime_flag',
      requiredMarkers: ['VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION'],
      error: 'Production smoke preparation must require a production-specific runtime flag.',
    },
    {
      id: 'production_ack',
      requiredMarkers: ['APPROVED_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE'],
      error: 'Production smoke preparation must require a production-specific acknowledgement.',
    },
    {
      id: 'production_env_marker',
      requiredMarkers: ['VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_ENV', 'PRODUCTION'],
      error: 'Production smoke preparation must require an explicit production environment marker.',
    },
    {
      id: 'surface_allowlist',
      requiredMarkers: ['VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_SURFACE_ALLOWLIST'],
      error: 'Production smoke preparation must require a surface allowlist.',
    },
    {
      id: 'dashboard_surface_scope',
      requiredMarkers: ['export_audit_reviewer_dashboard'],
      error: 'Production smoke preparation must explicitly allowlist the dashboard surface.',
    },
    {
      id: 'api_read_model_surface_scope',
      requiredMarkers: ['export_audit_reviewer_api_read_model'],
      error: 'Production smoke preparation must explicitly allowlist the API read-model surface.',
    },
    {
      id: 'approval_id',
      requiredMarkers: ['VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_APPROVAL_ID'],
      error: 'Production smoke preparation must require a product-owner approval id.',
    },
    {
      id: 'expires_at',
      requiredMarkers: ['VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_EXPIRES_AT', 'Date.parse'],
      error: 'Production smoke preparation must require and parse a timeboxed expiration timestamp.',
    },
    {
      id: 'rollback_owner',
      requiredMarkers: ['VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_ROLLBACK_OWNER'],
      error: 'Production smoke preparation must require a non-secret rollback owner label.',
    },
    {
      id: 'monitoring_channel',
      requiredMarkers: ['VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_MONITORING_CHANNEL'],
      error: 'Production smoke preparation must require a non-secret monitoring channel label.',
    },
    {
      id: 'support_owner',
      requiredMarkers: ['VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_SUPPORT_OWNER'],
      error: 'Production smoke preparation must require a non-secret support owner label.',
    },
    {
      id: 'evidence_storage_owner',
      requiredMarkers: ['VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_EVIDENCE_STORAGE_OWNER'],
      error: 'Production smoke preparation must require a non-secret evidence storage owner label.',
    },
  ]

const API_REQUIRED_MARKER_CHECKS: readonly RequiredSourceCheck<ExportAuditReviewerApiSafetyCheckId>[] =
  [
    {
      id: 'approved_audit_actions',
      requiredMarkers: [
        'approvedExportAuditActions',
        'export.request_list_basic.downloaded',
        'export.request_list_basic.denied',
        'export.request_document_manifest.downloaded',
        'export.request_document_manifest.denied',
      ],
      error: 'The reviewer API must query only approved export audit actions.',
    },
    {
      id: 'membership_backed_scope',
      requiredMarkers: [
        'resolveReviewerParishContext',
        "activeParishContext.source !== 'membership'",
        'Export audit reviewer requires membership-backed parish authorization.',
      ],
      error: 'The reviewer API must require membership-backed active parish scope.',
    },
    {
      id: 'read_model_builder',
      requiredMarkers: ['buildExportAuditReviewerReadModel', 'rows: filteredRows'],
      error: 'The reviewer API must return safe read-model rows instead of raw audit metadata.',
    },
    {
      id: 'no_store_response',
      requiredMarkers: ["'Cache-Control'", "'no-store'"],
      error: 'The reviewer API must keep no-store response headers.',
    },
  ]

const DASHBOARD_REQUIRED_MARKER_CHECKS: readonly RequiredSourceCheck<ExportAuditReviewerDashboardSafetyCheckId>[] =
  [
    {
      id: 'non_production_gate_present',
      requiredMarkers: [
        'VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE',
        'APPROVED_EXPORT_AUDIT_REVIEWER_QA',
        'NON_PRODUCTION',
      ],
      error: 'The dashboard page must preserve the existing non-production prototype gate.',
    },
    {
      id: 'production_environment_block',
      requiredMarkers: ["process.env.NODE_ENV !== 'production'", "process.env.VERCEL_ENV !== 'production'"],
      error: 'The dashboard page must keep the current production environment block.',
    },
    {
      id: 'production_exports_no_go_label',
      requiredMarkers: ['Production exports remain NO-GO.', 'Production exports:'],
      error: 'The dashboard must keep production exports clearly labelled NO-GO.',
    },
    {
      id: 'api_read_model_fetch',
      requiredMarkers: ['/api/export-audit-reviewer'],
      error: 'The dashboard must continue reading through the protected reviewer API.',
    },
    {
      id: 'staff_cookie_fetch',
      requiredMarkers: ["credentials: 'include'"],
      error: 'The dashboard API request must use staff cookies through the API.',
    },
    {
      id: 'no_store_fetch',
      requiredMarkers: ["cache: 'no-store'"],
      error: 'The dashboard API request must avoid caching reviewer data.',
    },
    {
      id: 'saved_filter_controls',
      requiredMarkers: ['availableFilters', 'selectedFilter', 'savedFilterLabels'],
      error: 'The dashboard must keep saved-filter review controls.',
    },
  ]

const API_FORBIDDEN_MARKERS = [
  'createSignedUrl',
  'storage.from',
  '.download(',
  'returnExportFile',
  'Content-Disposition',
  'text/csv',
  '.insert(',
  '.update(',
  '.delete(',
] as const

const DASHBOARD_FORBIDDEN_MARKERS = [
  '<a ',
  'href=',
  'download=',
  'createSignedUrl',
  'storage.from',
  '.download(',
  'Content-Disposition',
  'text/csv',
  'raw audit metadata',
  'raw export',
  'Approve document',
  'Reject document',
  'Delete',
  'Merge',
] as const

function runRequiredChecks<Id extends string>(
  source: string,
  checks: readonly RequiredSourceCheck<Id>[]
): {
  readonly checks: SourcePreflightCheck<Id>[]
  readonly errors: string[]
} {
  const errors: string[] = []
  const results = checks.map((check): SourcePreflightCheck<Id> => {
    const matchedMarkers = check.requiredMarkers.filter((marker) => source.includes(marker))
    const missingMarkers = check.requiredMarkers.filter((marker) => !source.includes(marker))
    const ok = missingMarkers.length === 0

    if (!ok) errors.push(check.error)

    return {
      id: check.id,
      ok,
      matchedMarkers,
      missingMarkers,
    }
  })

  return { checks: results, errors }
}

function markerOrderCheck<Id extends string>(
  source: string,
  id: Id,
  beforeMarker: string,
  afterMarker: string,
  error: string
): {
  readonly check: SourcePreflightCheck<Id>
  readonly error: string | null
} {
  const beforeIndex = source.indexOf(beforeMarker)
  const afterIndex = source.indexOf(afterMarker)
  const ok = beforeIndex >= 0 && afterIndex >= 0 && beforeIndex < afterIndex

  return {
    check: {
      id,
      ok,
      matchedMarkers: [beforeMarker, afterMarker].filter((marker) => source.includes(marker)),
      missingMarkers: [beforeMarker, afterMarker].filter((marker) => !source.includes(marker)),
    },
    error: ok ? null : error,
  }
}

function forbiddenMarkerCheck<Id extends string>(
  source: string,
  id: Id,
  forbiddenMarkers: readonly string[],
  errorPrefix: string
): {
  readonly check: SourcePreflightCheck<Id>
  readonly errors: readonly string[]
} {
  const matchedMarkers = forbiddenMarkers.filter((marker) => source.includes(marker))

  return {
    check: {
      id,
      ok: matchedMarkers.length === 0,
      matchedMarkers,
      missingMarkers: [],
    },
    errors: matchedMarkers.map((marker) => `${errorPrefix}: ${marker}`),
  }
}

export function validateFutureExportAuditReviewerDashboardProductionGateSource(
  source: string
): ExportAuditReviewerDashboardProductionGatePreflightResult {
  const { checks, errors } = runRequiredChecks(source, FUTURE_DASHBOARD_PRODUCTION_GATE_CHECKS)

  return {
    ok: errors.length === 0,
    version: EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_GATE_PREFLIGHT_VERSION,
    checks,
    errors,
  }
}

export function validateExportAuditReviewerApiReadModelSafetySource(
  source: string
): ExportAuditReviewerApiSafetyPreflightResult {
  const required = runRequiredChecks(source, API_REQUIRED_MARKER_CHECKS)
  const orderChecks = [
    markerOrderCheck(
      source,
      'gate_before_staff_auth',
      'const gate = getReviewerPrototypeGate(process.env)',
      'const staff = await requireStaffFromRequest(request)',
      'The reviewer API gate must run before staff authentication.'
    ),
    markerOrderCheck(
      source,
      'staff_auth_before_parish_scope',
      'const staff = await requireStaffFromRequest(request)',
      'const activeParishContext = await resolveReviewerParishContext',
      'Staff authentication must run before active parish scope resolution.'
    ),
    markerOrderCheck(
      source,
      'parish_scope_before_admin_client',
      'const activeParishContext = await resolveReviewerParishContext',
      'const admin = createSupabaseServiceRoleClient()',
      'Membership-backed parish scope must resolve before service-role admin client work.'
    ),
    markerOrderCheck(
      source,
      'admin_client_before_audit_query',
      'const admin = createSupabaseServiceRoleClient()',
      'const sourceEvents = await queryAuditEvents',
      'The admin client must be used only after gate, staff auth, and parish scope checks.'
    ),
  ]
  const forbidden = forbiddenMarkerCheck(
    source,
    'no_storage_or_file_delivery',
    API_FORBIDDEN_MARKERS.slice(0, 6),
    'The reviewer API must not expose storage/file/export delivery marker'
  )
  const mutationForbidden = forbiddenMarkerCheck(
    source,
    'no_raw_export_or_mutation_delivery',
    API_FORBIDDEN_MARKERS.slice(6),
    'The reviewer API must remain read-only and avoid mutation marker'
  )
  const errors = [
    ...required.errors,
    ...orderChecks.map((result) => result.error).filter((error): error is string => Boolean(error)),
    ...forbidden.errors,
    ...mutationForbidden.errors,
  ]

  return {
    ok: errors.length === 0,
    version: EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_GATE_PREFLIGHT_VERSION,
    routeId: 'export_audit_reviewer_api_read_model',
    checks: [
      ...orderChecks.map((result) => result.check),
      ...required.checks,
      forbidden.check,
      mutationForbidden.check,
    ],
    errors,
  }
}

export function validateExportAuditReviewerDashboardPageSafetySource(
  pageSource: string,
  componentSource: string
): ExportAuditReviewerDashboardSafetyPreflightResult {
  const combinedSource = `${pageSource}\n${componentSource}`
  const required = runRequiredChecks(combinedSource, DASHBOARD_REQUIRED_MARKER_CHECKS)
  const unavailableFirst = markerOrderCheck(
    pageSource,
    'unavailable_before_dashboard_render',
    'if (!isPrototypeEnabled()) return <UnavailablePrototype />',
    'return <ExportAuditReviewerDashboardPrototype />',
    'The dashboard page must render the unavailable state before rendering the reviewer dashboard.'
  )
  const forbidden = forbiddenMarkerCheck(
    combinedSource,
    'no_export_or_file_controls',
    DASHBOARD_FORBIDDEN_MARKERS,
    'The dashboard must not render export, file, storage, raw data, or mutation control marker'
  )
  const errors = [
    ...required.errors,
    unavailableFirst.error,
    ...forbidden.errors,
  ].filter((error): error is string => Boolean(error))

  return {
    ok: errors.length === 0,
    version: EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_GATE_PREFLIGHT_VERSION,
    routeId: 'export_audit_reviewer_dashboard',
    checks: [unavailableFirst.check, ...required.checks, forbidden.check],
    errors,
  }
}
