import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  validateExportAuditReviewerApiReadModelSafetySource,
  validateExportAuditReviewerDashboardPageSafetySource,
  validateFutureExportAuditReviewerDashboardProductionGateSource,
} from './exportAuditReviewerDashboardProductionGatePreflight'

const apiRoutePath = join(process.cwd(), 'app', 'api', 'export-audit-reviewer', 'route.ts')
const dashboardPagePath = join(
  process.cwd(),
  'app',
  'dashboard',
  'admin',
  'export-audit-reviewer',
  'page.tsx'
)
const dashboardComponentPath = join(
  process.cwd(),
  'app',
  'dashboard',
  'admin',
  'export-audit-reviewer',
  'ExportAuditReviewerDashboardPrototype.tsx'
)

const futureProductionGateSource = `
  const REVIEWER_PROTOTYPE_ACK_VALUE = 'APPROVED_EXPORT_AUDIT_REVIEWER_QA'
  const REVIEWER_DASHBOARD_PRODUCTION_FLAG = 'VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION'
  const REVIEWER_DASHBOARD_PRODUCTION_ACK_VALUE = 'APPROVED_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE'
  const REVIEWER_DASHBOARD_PRODUCTION_ENV_FLAG = 'VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_ENV'
  const REVIEWER_DASHBOARD_SURFACE_ALLOWLIST_FLAG = 'VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_SURFACE_ALLOWLIST'
  const REVIEWER_DASHBOARD_APPROVAL_ID_FLAG = 'VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_APPROVAL_ID'
  const REVIEWER_DASHBOARD_EXPIRES_AT_FLAG = 'VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_EXPIRES_AT'
  const REVIEWER_DASHBOARD_ROLLBACK_OWNER_FLAG = 'VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_ROLLBACK_OWNER'
  const REVIEWER_DASHBOARD_MONITORING_CHANNEL_FLAG = 'VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_MONITORING_CHANNEL'
  const REVIEWER_DASHBOARD_SUPPORT_OWNER_FLAG = 'VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_SUPPORT_OWNER'
  const REVIEWER_DASHBOARD_EVIDENCE_STORAGE_OWNER_FLAG = 'VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_EVIDENCE_STORAGE_OWNER'

  function isProductionEnvironment(env) {
    return env.NODE_ENV === 'production' || env.VERCEL_ENV === 'production'
  }

  function getExportAuditReviewerDashboardGate(env, surfaceId) {
    if (isProductionEnvironment(env) && env.VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK === REVIEWER_PROTOTYPE_ACK_VALUE) {
      return { enabled: false, state: 'blocked_production_environment' }
    }

    const productionEnabled = env[REVIEWER_DASHBOARD_PRODUCTION_FLAG] === 'ENABLED'
    const productionAck = env.VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_ACK === REVIEWER_DASHBOARD_PRODUCTION_ACK_VALUE
    const productionEnv = env[REVIEWER_DASHBOARD_PRODUCTION_ENV_FLAG] === 'PRODUCTION'
    const allowlist = String(env[REVIEWER_DASHBOARD_SURFACE_ALLOWLIST_FLAG] ?? '').split(',')
    const surfaceAllowed =
      allowlist.includes('export_audit_reviewer_dashboard') &&
      allowlist.includes('export_audit_reviewer_api_read_model') &&
      allowlist.includes(surfaceId)
    const approvalId = env[REVIEWER_DASHBOARD_APPROVAL_ID_FLAG]
    const expiresAt = Date.parse(env[REVIEWER_DASHBOARD_EXPIRES_AT_FLAG] ?? '')
    const rollbackOwner = env[REVIEWER_DASHBOARD_ROLLBACK_OWNER_FLAG]
    const monitoringChannel = env[REVIEWER_DASHBOARD_MONITORING_CHANNEL_FLAG]
    const supportOwner = env[REVIEWER_DASHBOARD_SUPPORT_OWNER_FLAG]
    const evidenceStorageOwner = env[REVIEWER_DASHBOARD_EVIDENCE_STORAGE_OWNER_FLAG]

    return {
      enabled:
        productionEnabled &&
        productionAck &&
        productionEnv &&
        surfaceAllowed &&
        approvalId &&
        Number.isFinite(expiresAt) &&
        Date.now() < expiresAt &&
        rollbackOwner &&
        monitoringChannel &&
        supportOwner &&
        evidenceStorageOwner,
    }
  }
`

describe('export audit reviewer dashboard production gate preflight scaffold', () => {
  it('accepts future dashboard production gate source only with scoped, timeboxed production controls', () => {
    const result = validateFutureExportAuditReviewerDashboardProductionGateSource(
      futureProductionGateSource
    )

    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.checks.map((check) => check.id)).toEqual([
      'qa_ack_still_present',
      'qa_ack_production_block',
      'production_runtime_flag',
      'production_ack',
      'production_env_marker',
      'surface_allowlist',
      'dashboard_surface_scope',
      'api_read_model_surface_scope',
      'approval_id',
      'expires_at',
      'rollback_owner',
      'monitoring_channel',
      'support_owner',
      'evidence_storage_owner',
    ])
  })

  it('rejects future dashboard production gate source when required production controls are missing', () => {
    const unsafeSource = futureProductionGateSource
      .replace(/VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_SURFACE_ALLOWLIST/g, 'MISSING_ALLOWLIST')
      .replace(/export_audit_reviewer_api_read_model/g, 'missing_api_surface')
      .replace(/VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_APPROVAL_ID/g, 'MISSING_APPROVAL_ID')
      .replace(/VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_EXPIRES_AT/g, 'MISSING_EXPIRES_AT')
      .replace(/Date\.parse/g, 'Number')
      .replace(/VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_ROLLBACK_OWNER/g, 'MISSING_ROLLBACK_OWNER')
      .replace(
        /VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_MONITORING_CHANNEL/g,
        'MISSING_MONITORING_CHANNEL'
      )
      .replace(/VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_SUPPORT_OWNER/g, 'MISSING_SUPPORT_OWNER')
      .replace(
        /VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_EVIDENCE_STORAGE_OWNER/g,
        'MISSING_EVIDENCE_STORAGE_OWNER'
      )

    const result = validateFutureExportAuditReviewerDashboardProductionGateSource(unsafeSource)

    expect(result.ok).toBe(false)
    expect(result.errors).toContain('Production smoke preparation must require a surface allowlist.')
    expect(result.errors).toContain(
      'Production smoke preparation must explicitly allowlist the API read-model surface.'
    )
    expect(result.errors).toContain(
      'Production smoke preparation must require a product-owner approval id.'
    )
    expect(result.errors).toContain(
      'Production smoke preparation must require and parse a timeboxed expiration timestamp.'
    )
    expect(result.errors).toContain(
      'Production smoke preparation must require a non-secret rollback owner label.'
    )
    expect(result.errors).toContain(
      'Production smoke preparation must require a non-secret monitoring channel label.'
    )
    expect(result.errors).toContain(
      'Production smoke preparation must require a non-secret support owner label.'
    )
    expect(result.errors).toContain(
      'Production smoke preparation must require a non-secret evidence storage owner label.'
    )
  })

  it('passes the current export audit reviewer API through read-model safety preflight', () => {
    const routeSource = readFileSync(apiRoutePath, 'utf8')
    const result = validateExportAuditReviewerApiReadModelSafetySource(routeSource)

    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.checks.every((check) => check.ok)).toBe(true)
  })

  it('fails API safety preflight when auth/scope order moves after audit-event reads', () => {
    const unsafeSource = `
      const sourceEvents = await queryAuditEvents(admin, activeParishContext.activeParishId, limit)
      const admin = createSupabaseServiceRoleClient()
      const activeParishContext = await resolveReviewerParishContext(staff.supabase, requestedParishId)
      const staff = await requireStaffFromRequest(request)
      const gate = getReviewerPrototypeGate(process.env)
      const approvedExportAuditActions = ['export.request_list_basic.downloaded', 'export.request_list_basic.denied', 'export.request_document_manifest.downloaded', 'export.request_document_manifest.denied']
      function resolveReviewerParishContext() {
        if (activeParishContext.source !== 'membership') throw new Error('Export audit reviewer requires membership-backed parish authorization.')
      }
      buildExportAuditReviewerReadModel([], { safeMetadataOnly: true })
      'Cache-Control'
      'no-store'
    `

    const result = validateExportAuditReviewerApiReadModelSafetySource(unsafeSource)

    expect(result.ok).toBe(false)
    expect(result.errors).toContain('The reviewer API gate must run before staff authentication.')
    expect(result.errors).toContain('Staff authentication must run before active parish scope resolution.')
    expect(result.errors).toContain(
      'Membership-backed parish scope must resolve before service-role admin client work.'
    )
    expect(result.errors).toContain(
      'The admin client must be used only after gate, staff auth, and parish scope checks.'
    )
  })

  it('fails API safety preflight when storage, raw export delivery, or mutation markers appear', () => {
    const routeSource = `${readFileSync(apiRoutePath, 'utf8')}
      await storage.from('request-documents').createSignedUrl('path', 60)
      returnExportFile(rows)
      response.headers.set('Content-Disposition', 'attachment')
      'text/csv'
      await admin.from('audit_events').insert({ raw: true })
    `

    const result = validateExportAuditReviewerApiReadModelSafetySource(routeSource)

    expect(result.ok).toBe(false)
    expect(result.errors).toContain(
      'The reviewer API must not expose storage/file/export delivery marker: createSignedUrl'
    )
    expect(result.errors).toContain(
      'The reviewer API must not expose storage/file/export delivery marker: storage.from'
    )
    expect(result.errors).toContain(
      'The reviewer API must not expose storage/file/export delivery marker: returnExportFile'
    )
    expect(result.errors).toContain(
      'The reviewer API must not expose storage/file/export delivery marker: Content-Disposition'
    )
    expect(result.errors).toContain(
      'The reviewer API must not expose storage/file/export delivery marker: text/csv'
    )
    expect(result.errors).toContain(
      'The reviewer API must remain read-only and avoid mutation marker: .insert('
    )
  })

  it('passes the current dashboard page and component through read-only safety preflight', () => {
    const pageSource = readFileSync(dashboardPagePath, 'utf8')
    const componentSource = readFileSync(dashboardComponentPath, 'utf8')
    const result = validateExportAuditReviewerDashboardPageSafetySource(pageSource, componentSource)

    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.checks.every((check) => check.ok)).toBe(true)
  })

  it('fails dashboard safety preflight when unavailable state moves after dashboard render', () => {
    const pageSource = `
      function ExportAuditReviewerPage() {
        return <ExportAuditReviewerDashboardPrototype />
        if (!isPrototypeEnabled()) return <UnavailablePrototype />
      }
      process.env.NODE_ENV !== 'production'
      process.env.VERCEL_ENV !== 'production'
      VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE
      APPROVED_EXPORT_AUDIT_REVIEWER_QA
      NON_PRODUCTION
      Production exports remain NO-GO.
    `
    const componentSource = `
      fetch('/api/export-audit-reviewer', { credentials: 'include', cache: 'no-store' })
      Production exports:
      availableFilters
      selectedFilter
      savedFilterLabels
    `

    const result = validateExportAuditReviewerDashboardPageSafetySource(pageSource, componentSource)

    expect(result.ok).toBe(false)
    expect(result.errors).toContain(
      'The dashboard page must render the unavailable state before rendering the reviewer dashboard.'
    )
  })

  it('fails dashboard safety preflight when export, file, storage, or raw-data controls appear', () => {
    const pageSource = readFileSync(dashboardPagePath, 'utf8')
    const componentSource = `${readFileSync(dashboardComponentPath, 'utf8')}
      <a href="/api/export-audit-reviewer?format=csv" download="audit.csv">Export raw export</a>
      await storage.from('request-documents').createSignedUrl('path', 60)
      <button>Delete</button>
    `

    const result = validateExportAuditReviewerDashboardPageSafetySource(pageSource, componentSource)

    expect(result.ok).toBe(false)
    expect(result.errors).toContain(
      'The dashboard must not render export, file, storage, raw data, or mutation control marker: <a '
    )
    expect(result.errors).toContain(
      'The dashboard must not render export, file, storage, raw data, or mutation control marker: href='
    )
    expect(result.errors).toContain(
      'The dashboard must not render export, file, storage, raw data, or mutation control marker: download='
    )
    expect(result.errors).toContain(
      'The dashboard must not render export, file, storage, raw data, or mutation control marker: createSignedUrl'
    )
    expect(result.errors).toContain(
      'The dashboard must not render export, file, storage, raw data, or mutation control marker: storage.from'
    )
    expect(result.errors).toContain(
      'The dashboard must not render export, file, storage, raw data, or mutation control marker: raw export'
    )
    expect(result.errors).toContain(
      'The dashboard must not render export, file, storage, raw data, or mutation control marker: Delete'
    )
  })
})
