import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getExportRuntimeGate } from './exportRuntimeGate'
import {
  validateFutureExportProductionGateSource,
  validateRequestDocumentManifestProductionSafetySource,
} from './exportProductionGatePreflight'

const currentGatePath = join(process.cwd(), 'lib', 'server', 'exportRuntimeGate.ts')
const documentManifestRoutePath = join(
  process.cwd(),
  'app',
  'api',
  'exports',
  'requests',
  'documents',
  'manifest',
  'route.ts'
)

const futureProductionGateSource = `
  const EXPORT_RUNTIME_ACK_VALUE = 'APPROVED_EXPORT_RUNTIME_QA'
  const EXPORT_RUNTIME_PRODUCTION_ACK_VALUE = 'APPROVED_EXPORT_RUNTIME_PRODUCTION_SMOKE'
  const EXPORT_RUNTIME_ROUTE_ALLOWLIST_FLAG = 'VINEA_EXPORT_RUNTIME_ROUTE_ALLOWLIST'
  const EXPORT_RUNTIME_APPROVAL_ID_FLAG = 'VINEA_EXPORT_RUNTIME_APPROVAL_ID'
  const EXPORT_RUNTIME_EXPIRES_AT_FLAG = 'VINEA_EXPORT_RUNTIME_EXPIRES_AT'
  const EXPORT_RUNTIME_ROLLBACK_OWNER_FLAG = 'VINEA_EXPORT_RUNTIME_ROLLBACK_OWNER'
  const EXPORT_RUNTIME_MONITORING_CHANNEL_FLAG = 'VINEA_EXPORT_RUNTIME_MONITORING_CHANNEL'
  function isProductionEnvironment(env) {
    return env.NODE_ENV === 'production' || env.VERCEL_ENV === 'production'
  }
  function getExportRuntimeGate(env, routeId) {
    if (isProductionEnvironment(env) && env.VINEA_EXPORT_RUNTIME_ACK === EXPORT_RUNTIME_ACK_VALUE) {
      return { enabled: false, state: 'blocked_production_environment' }
    }
    const productionAck = env.VINEA_EXPORT_RUNTIME_ACK === EXPORT_RUNTIME_PRODUCTION_ACK_VALUE
    const productionEnv = env.VINEA_EXPORT_RUNTIME_ENV === 'PRODUCTION'
    const allowlist = String(env[EXPORT_RUNTIME_ROUTE_ALLOWLIST_FLAG] ?? '').split(',')
    const routeAllowed = allowlist.includes('request_document_manifest') && allowlist.includes(routeId)
    const approvalId = env[EXPORT_RUNTIME_APPROVAL_ID_FLAG]
    const expiresAt = Date.parse(env[EXPORT_RUNTIME_EXPIRES_AT_FLAG] ?? '')
    const rollbackOwner = env[EXPORT_RUNTIME_ROLLBACK_OWNER_FLAG]
    const monitoringChannel = env[EXPORT_RUNTIME_MONITORING_CHANNEL_FLAG]
    return {
      enabled:
        productionAck &&
        productionEnv &&
        routeAllowed &&
        approvalId &&
        Number.isFinite(expiresAt) &&
        Date.now() < expiresAt &&
        rollbackOwner &&
        monitoringChannel,
    }
  }
`

describe('export production gate preflight scaffold', () => {
  it('confirms the current runtime gate still blocks QA flags in production', () => {
    const currentGateSource = readFileSync(currentGatePath, 'utf8')
    const gate = getExportRuntimeGate({
      VINEA_EXPORT_RUNTIME: 'ENABLED',
      VINEA_EXPORT_RUNTIME_ACK: 'APPROVED_EXPORT_RUNTIME_QA',
      VINEA_EXPORT_RUNTIME_ENV: 'NON_PRODUCTION',
      VERCEL_ENV: 'production',
    })

    expect(gate.enabled).toBe(false)
    expect(gate.state).toBe('blocked_production_environment')
    expect(currentGateSource).toContain('blocked_production_environment')
    expect(currentGateSource).toContain('APPROVED_EXPORT_RUNTIME_QA')
    expect(currentGateSource).not.toContain('APPROVED_EXPORT_RUNTIME_PRODUCTION_SMOKE')
  })

  it('accepts future production gate source only when production flags are route scoped and timeboxed', () => {
    const result = validateFutureExportProductionGateSource(futureProductionGateSource)

    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.checks.map((check) => check.id)).toEqual([
      'qa_ack_still_present',
      'qa_ack_production_block',
      'production_ack',
      'production_env_marker',
      'route_allowlist',
      'document_manifest_route_scope',
      'approval_id',
      'expires_at',
      'rollback_owner',
      'monitoring_channel',
    ])
  })

  it('fails future production gate source when approval, expiry, owner, or monitoring controls are missing', () => {
    const unsafeSource = futureProductionGateSource
      .replace(/VINEA_EXPORT_RUNTIME_APPROVAL_ID/g, 'MISSING_APPROVAL_ID')
      .replace(/VINEA_EXPORT_RUNTIME_EXPIRES_AT/g, 'MISSING_EXPIRES_AT')
      .replace(/Date\.parse/g, 'Number')
      .replace(/VINEA_EXPORT_RUNTIME_ROLLBACK_OWNER/g, 'MISSING_ROLLBACK_OWNER')
      .replace(/VINEA_EXPORT_RUNTIME_MONITORING_CHANNEL/g, 'MISSING_MONITORING_CHANNEL')

    const result = validateFutureExportProductionGateSource(unsafeSource)

    expect(result.ok).toBe(false)
    expect(result.errors).toContain('Production smoke must require a product-owner approval id.')
    expect(result.errors).toContain(
      'Production smoke must require and parse a timeboxed expiration timestamp.'
    )
    expect(result.errors).toContain('Production smoke must require a non-secret rollback owner label.')
    expect(result.errors).toContain('Production smoke must require a non-secret monitoring channel label.')
  })

  it('passes the current request_document_manifest route through production safety preflight', () => {
    const routeSource = readFileSync(documentManifestRoutePath, 'utf8')
    const result = validateRequestDocumentManifestProductionSafetySource(routeSource)

    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.checks.every((check) => check.ok)).toBe(true)
  })

  it('fails manifest route source when unsafe storage or file-delivery markers appear', () => {
    const routeSource = `${readFileSync(documentManifestRoutePath, 'utf8')}
      await storage.from('request-documents').createSignedUrl(storage_path, 60)
      const original_filename = 'unsafe.pdf'
      await documents.download('file')
    `

    const result = validateRequestDocumentManifestProductionSafetySource(routeSource)

    expect(result.ok).toBe(false)
    expect(result.errors).toContain('Manifest export must not create signed URLs.')
    expect(result.errors).toContain('Manifest export must not call Supabase Storage APIs.')
    expect(result.errors).toContain('Manifest export must not download document files.')
    expect(result.errors).toContain('Manifest export must not expose original filenames.')
    expect(result.errors).toContain('Manifest export must not expose storage paths.')
  })

  it('fails manifest route source when route safety checks move after query work', () => {
    const routeSource = `
      const rows = await queryExportRows(admin, activeParishId)
      const gate = getExportRuntimeGate(process.env)
      const staff = await requireStaffFromRequest(request)
      const activeParishContext = await resolveActiveStaffParishContext(staff.supabase)
      const activeParishId = activeParishContext.activeParishId
      const membershipParishIds = activeParishContext.parishIds
      const exportPermission = buildExportPermissionEvaluationDto({
        request: { presetId: 'request_document_manifest' },
      })
      const blockedFieldsRequested = exportPermission.dto.blockedFieldsRequested
      const familyPortalSurface = exportPermission.dto.familyPortalSurface
      const auditMetadataTemplate = exportPermission.dto.auditMetadataTemplate
      await writeAuditEvent({ targetId: 'request_document_manifest', metadata: auditMetadataTemplate })
      const genericExportBlockedReason = 'Export request cannot be completed.'
      const REQUEST_DOCUMENT_MANIFEST_EXPORT_FIELDS = []
      parseRequestedExportFields('')
      from('parishioners').eq('parish_id', activeParishId).in('parishioner_id', parishionerIds)
      from('request_workflow_steps').eq('parish_id', activeParishId)
      from('request_documents').eq('parish_id', activeParishId)
      SACRAMENTAL_CANONICAL_EXPORT_MARKERS
      isSafeManifestExportRow({})
      returnExportFile(rows)
    `

    const result = validateRequestDocumentManifestProductionSafetySource(routeSource)

    expect(result.ok).toBe(false)
    expect(result.errors.some((error) => error.startsWith('runtime_gate must appear before'))).toBe(
      true
    )
    expect(result.errors.some((error) => error.startsWith('permission_dto must appear before'))).toBe(
      true
    )
  })
})
