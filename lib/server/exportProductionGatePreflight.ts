import { validateFutureExportRouteRuntimeWiringSource } from './exportRouteRuntimeWiringPreflight'

export const EXPORT_PRODUCTION_GATE_PREFLIGHT_VERSION =
  '2026-06-30-export-production-gate-preflight-v1'

export type ExportProductionGatePreflightCheckId =
  | 'qa_ack_still_present'
  | 'qa_ack_production_block'
  | 'production_ack'
  | 'production_env_marker'
  | 'route_allowlist'
  | 'document_manifest_route_scope'
  | 'approval_id'
  | 'expires_at'
  | 'rollback_owner'
  | 'monitoring_channel'

export type RequestDocumentManifestProductionSafetyCheckId =
  | 'base_route_preflight'
  | 'manifest_export_preset'
  | 'server_owned_field_allowlist'
  | 'requested_field_parser'
  | 'request_ownership_parish_scope'
  | 'workflow_step_parish_scope'
  | 'document_parish_scope'
  | 'sacramental_canonical_filter'
  | 'no_signed_url_or_storage_api'
  | 'no_storage_or_original_filename_export'

export type SourcePreflightCheck<Id extends string> = {
  readonly id: Id
  readonly ok: boolean
  readonly matchedMarkers: readonly string[]
  readonly missingMarkers: readonly string[]
}

export type ExportProductionGatePreflightResult = {
  readonly ok: boolean
  readonly version: typeof EXPORT_PRODUCTION_GATE_PREFLIGHT_VERSION
  readonly checks: readonly SourcePreflightCheck<ExportProductionGatePreflightCheckId>[]
  readonly errors: readonly string[]
}

export type RequestDocumentManifestProductionSafetyPreflightResult = {
  readonly ok: boolean
  readonly version: typeof EXPORT_PRODUCTION_GATE_PREFLIGHT_VERSION
  readonly routeId: 'request_document_manifest'
  readonly checks: readonly SourcePreflightCheck<RequestDocumentManifestProductionSafetyCheckId>[]
  readonly errors: readonly string[]
}

type RequiredSourceCheck<Id extends string> = {
  readonly id: Id
  readonly requiredMarkers: readonly string[]
  readonly error: string
}

const PRODUCTION_GATE_SOURCE_CHECKS: readonly RequiredSourceCheck<ExportProductionGatePreflightCheckId>[] =
  [
    {
      id: 'qa_ack_still_present',
      requiredMarkers: ['APPROVED_EXPORT_RUNTIME_QA'],
      error: 'The existing QA acknowledgement must remain explicit and separate from production.',
    },
    {
      id: 'qa_ack_production_block',
      requiredMarkers: ['blocked_production_environment', 'isProductionEnvironment'],
      error: 'QA flags must still fail closed in production environments.',
    },
    {
      id: 'production_ack',
      requiredMarkers: ['APPROVED_EXPORT_RUNTIME_PRODUCTION_SMOKE'],
      error: 'Production smoke must require a production-specific acknowledgement.',
    },
    {
      id: 'production_env_marker',
      requiredMarkers: ['VINEA_EXPORT_RUNTIME_ENV', 'PRODUCTION'],
      error: 'Production smoke must require an explicit production environment marker.',
    },
    {
      id: 'route_allowlist',
      requiredMarkers: ['VINEA_EXPORT_RUNTIME_ROUTE_ALLOWLIST'],
      error: 'Production smoke must require a route allowlist.',
    },
    {
      id: 'document_manifest_route_scope',
      requiredMarkers: ['request_document_manifest'],
      error: 'Production smoke must be scoped to the request document manifest route.',
    },
    {
      id: 'approval_id',
      requiredMarkers: ['VINEA_EXPORT_RUNTIME_APPROVAL_ID'],
      error: 'Production smoke must require a product-owner approval id.',
    },
    {
      id: 'expires_at',
      requiredMarkers: ['VINEA_EXPORT_RUNTIME_EXPIRES_AT', 'Date.parse'],
      error: 'Production smoke must require and parse a timeboxed expiration timestamp.',
    },
    {
      id: 'rollback_owner',
      requiredMarkers: ['VINEA_EXPORT_RUNTIME_ROLLBACK_OWNER'],
      error: 'Production smoke must require a non-secret rollback owner label.',
    },
    {
      id: 'monitoring_channel',
      requiredMarkers: ['VINEA_EXPORT_RUNTIME_MONITORING_CHANNEL'],
      error: 'Production smoke must require a non-secret monitoring channel label.',
    },
  ]

const REQUEST_DOCUMENT_MANIFEST_SAFETY_CHECKS: readonly RequiredSourceCheck<RequestDocumentManifestProductionSafetyCheckId>[] =
  [
    {
      id: 'manifest_export_preset',
      requiredMarkers: [
        "const exportPresetId = 'request_document_manifest'",
        'presetId: exportPresetId',
        'targetId: exportPresetId',
      ],
      error: 'The route must keep the request_document_manifest export preset and audit target.',
    },
    {
      id: 'server_owned_field_allowlist',
      requiredMarkers: ['REQUEST_DOCUMENT_MANIFEST_EXPORT_FIELDS'],
      error: 'The route must keep a server-owned manifest field allowlist.',
    },
    {
      id: 'requested_field_parser',
      requiredMarkers: ['parseRequestedExportFields', 'blockedFieldsRequested'],
      error: 'The route must parse requested fields and deny blocked fields before export work.',
    },
    {
      id: 'request_ownership_parish_scope',
      requiredMarkers: ["from('parishioners')", ".eq('parish_id', activeParishId)", ".in('parishioner_id', parishionerIds)"],
      error: 'The route must derive request scope from same-parish parishioners before manifest rows.',
    },
    {
      id: 'workflow_step_parish_scope',
      requiredMarkers: ["from('request_workflow_steps')", ".eq('parish_id', activeParishId)"],
      error: 'Workflow step rows must remain scoped to the active parish.',
    },
    {
      id: 'document_parish_scope',
      requiredMarkers: ["from('request_documents')", ".eq('parish_id', activeParishId)"],
      error: 'Document rows must remain scoped to the active parish.',
    },
    {
      id: 'sacramental_canonical_filter',
      requiredMarkers: ['SACRAMENTAL_CANONICAL_EXPORT_MARKERS', 'isSafeManifestExportRow'],
      error: 'Sacramental/canonical markers must remain filtered from manifest rows.',
    },
  ]

const REQUEST_DOCUMENT_MANIFEST_FORBIDDEN_MARKERS = [
  'createSignedUrl',
  'storage.from',
  '.download(',
  'original_filename',
  'storage_path',
  'portal_token',
  'token_hash',
] as const

function runRequiredChecks<Id extends string>(
  source: string,
  checks: readonly RequiredSourceCheck<Id>[]
): {
  readonly checks: readonly SourcePreflightCheck<Id>[]
  readonly errors: readonly string[]
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

export function validateFutureExportProductionGateSource(
  source: string
): ExportProductionGatePreflightResult {
  const { checks, errors } = runRequiredChecks(source, PRODUCTION_GATE_SOURCE_CHECKS)

  return {
    ok: errors.length === 0,
    version: EXPORT_PRODUCTION_GATE_PREFLIGHT_VERSION,
    checks,
    errors,
  }
}

export function validateRequestDocumentManifestProductionSafetySource(
  source: string
): RequestDocumentManifestProductionSafetyPreflightResult {
  const routePreflight = validateFutureExportRouteRuntimeWiringSource(
    'app/api/exports/requests/documents/manifest/route.ts',
    source
  )
  const { checks: manifestChecks, errors: manifestErrors } = runRequiredChecks(
    source,
    REQUEST_DOCUMENT_MANIFEST_SAFETY_CHECKS
  )
  const errors = [...manifestErrors]
  const forbiddenMatches = REQUEST_DOCUMENT_MANIFEST_FORBIDDEN_MARKERS.filter((marker) =>
    source.includes(marker)
  )

  const checks: SourcePreflightCheck<RequestDocumentManifestProductionSafetyCheckId>[] = [
    {
      id: 'base_route_preflight',
      ok: routePreflight.ok,
      matchedMarkers: routePreflight.gates
        .map((gate) => gate.matchedMarker)
        .filter((marker): marker is string => Boolean(marker)),
      missingMarkers: routePreflight.errors,
    },
    ...manifestChecks,
    {
      id: 'no_signed_url_or_storage_api',
      ok: !forbiddenMatches.some((marker) =>
        ['createSignedUrl', 'storage.from', '.download('].includes(marker)
      ),
      matchedMarkers: forbiddenMatches.filter((marker) =>
        ['createSignedUrl', 'storage.from', '.download('].includes(marker)
      ),
      missingMarkers: [],
    },
    {
      id: 'no_storage_or_original_filename_export',
      ok: !forbiddenMatches.some((marker) =>
        ['original_filename', 'storage_path', 'portal_token', 'token_hash'].includes(marker)
      ),
      matchedMarkers: forbiddenMatches.filter((marker) =>
        ['original_filename', 'storage_path', 'portal_token', 'token_hash'].includes(marker)
      ),
      missingMarkers: [],
    },
  ]

  if (!routePreflight.ok) errors.push(...routePreflight.errors)
  if (forbiddenMatches.includes('createSignedUrl')) errors.push('Manifest export must not create signed URLs.')
  if (forbiddenMatches.includes('storage.from')) errors.push('Manifest export must not call Supabase Storage APIs.')
  if (forbiddenMatches.includes('.download(')) errors.push('Manifest export must not download document files.')
  if (forbiddenMatches.includes('original_filename')) errors.push('Manifest export must not expose original filenames.')
  if (forbiddenMatches.includes('storage_path')) errors.push('Manifest export must not expose storage paths.')
  if (forbiddenMatches.includes('portal_token')) errors.push('Manifest export must not expose portal tokens.')
  if (forbiddenMatches.includes('token_hash')) errors.push('Manifest export must not expose token hashes.')

  return {
    ok: errors.length === 0,
    version: EXPORT_PRODUCTION_GATE_PREFLIGHT_VERSION,
    routeId: 'request_document_manifest',
    checks,
    errors,
  }
}
