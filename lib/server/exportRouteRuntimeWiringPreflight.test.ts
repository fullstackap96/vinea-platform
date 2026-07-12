import { describe, expect, it } from 'vitest'
import { validateFutureExportRouteRuntimeWiringSource } from './exportRouteRuntimeWiringPreflight'

const validFutureRouteSource = `
  const EXPORT_RUNTIME_ACK_VALUE = 'APPROVED_EXPORT_RUNTIME_QA'
  const runtimeAck = process.env.VINEA_EXPORT_RUNTIME_ACK
  const requiredAuditMetadata = EXPORT_AUDIT_METADATA_REQUIREMENTS
  const blockedPatterns = BLOCKED_EXPORT_FIELD_PATTERNS
  const gate = getExportRuntimeGate(process.env)
  if (!gate.enabled) return Response.json({ error: 'export_unavailable' }, { status: 404 })
  const genericExportBlockedReason = 'Export request cannot be completed.'
  const staff = await requireStaffFromRequest(request)
  const activeParishContext = await resolveActiveStaffParishContext(staff.id)
  const activeParishId = activeParishContext.activeParishId
  const membershipParishIds = activeParishContext.membershipParishIds
  const exportPermission = buildExportPermissionEvaluationDto({
    staff,
    scope: { activeParishId, membershipParishIds, targetParishIds },
    request: { familyPortalSurface: false, requestedFields },
  })
  if (!exportPermission.ok) return Response.json({ error: genericExportBlockedReason }, { status: 403 })
  const blockedFieldsRequested = exportPermission.dto.blockedFieldsRequested
  const familyPortalSurface = exportPermission.dto.familyPortalSurface
  if (familyPortalSurface) return Response.json({ error: 'family_portal_surface_cannot_export_staff_data' }, { status: 403 })
  const auditMetadataTemplate = exportPermission.dto.auditMetadataTemplate
  const auditWritten = await writeAuditEvent({ metadata: auditMetadataTemplate })
  if (!auditWritten) return Response.json({ error: genericExportBlockedReason }, { status: 503 })
  const rows = await queryExportRows(exportPermission.dto)
  returnExportFile(rows)
`

describe('export route runtime wiring preflight', () => {
  it('accepts future route source only when all gates appear before export query and delivery', () => {
    const result = validateFutureExportRouteRuntimeWiringSource('requests-export', validFutureRouteSource)

    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.gates.map((gate) => gate.id)).toEqual([
      'runtime_gate',
      'authentication',
      'active_parish_scope',
      'membership_scope',
      'permission_dto',
      'blocked_field_controls',
      'family_portal_exclusion',
      'audit_metadata',
      'audit_persistence',
      'generic_blocked_errors',
    ])
    expect(result.gates.every((gate) => gate.ok)).toBe(true)
  })

  it('accepts route source that delegates runtime flag validation to the export runtime gate helper', () => {
    const result = validateFutureExportRouteRuntimeWiringSource(
      'helper-backed-export',
      `
        const gate = getExportRuntimeGate(process.env)
        if (!gate.enabled) return Response.json({ error: 'export_unavailable' }, { status: 404 })
        const genericExportBlockedReason = 'Export request cannot be completed.'
        const staff = await requireStaffFromRequest(request)
        const activeParishContext = await resolveActiveStaffParishContext(staff.supabase)
        const activeParishId = activeParishContext.activeParishId
        const membershipParishIds = activeParishContext.parishIds
        const parsedFields = parseRequestedExportFields(url.searchParams.get('fields'))
        const exportPermission = buildExportPermissionEvaluationDto({
          scope: { activeParishId, membershipParishIds, targetParishIds: [activeParishId] },
          request: { familyPortalSurface: false },
        })
        const blockedFieldsRequested = exportPermission.dto.blockedFieldsRequested
        const familyPortalSurface = exportPermission.dto.familyPortalSurface
        if (blockedFieldsRequested.length > 0 || familyPortalSurface || !exportDtoAllowsRuntimeGate(exportPermission.dto)) {
          const disallowedFieldsCount = parsedFields.ok ? 0 : parsedFields.disallowedFields.length
          return Response.json({ error: genericExportBlockedReason, disallowedFieldsCount }, { status: 403 })
        }
        const auditMetadataTemplate = safeAuditMetadata({ dto: exportPermission.dto })
        const auditWritten = await writeAuditEvent({ metadata: auditMetadataTemplate })
        if (!auditWritten) return Response.json({ error: genericExportBlockedReason }, { status: 503 })
        const rows = await queryExportRows(exportPermission.dto)
        returnExportFile(rows)
      `
    )

    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('fails if a future route queries export rows before the permission DTO is built', () => {
    const result = validateFutureExportRouteRuntimeWiringSource(
      'unsafe-export',
      `
        const gate = getExportRuntimeGate(process.env)
        const staff = await requireStaffFromRequest(request)
        const activeParishContext = await resolveActiveStaffParishContext(staff.id)
        const activeParishId = activeParishContext.activeParishId
        const membershipParishIds = activeParishContext.membershipParishIds
        const rows = await queryExportRows({})
        const exportPermission = buildExportPermissionEvaluationDto({})
        const blockedFieldsRequested = exportPermission.dto.blockedFieldsRequested
        const familyPortalSurface = exportPermission.dto.familyPortalSurface
        const auditMetadataTemplate = exportPermission.dto.auditMetadataTemplate
        const genericExportBlockedReason = 'Export request cannot be completed.'
        returnExportFile(rows)
      `
    )

    expect(result.ok).toBe(false)
    expect(result.errors.some((error) => error.startsWith('permission_dto must appear before'))).toBe(true)
  })

  it('fails if future route source omits the disabled-by-default runtime gate', () => {
    const result = validateFutureExportRouteRuntimeWiringSource(
      'missing-gate-export',
      validFutureRouteSource.replace('const gate = getExportRuntimeGate(process.env)', '')
    )

    expect(result.ok).toBe(false)
    expect(result.errors.some((error) => error.startsWith('runtime_gate must appear before'))).toBe(true)
  })

  it('fails if export delivery exists without audit metadata before delivery', () => {
    const result = validateFutureExportRouteRuntimeWiringSource(
      'missing-audit-export',
      validFutureRouteSource
        .replace('const auditMetadataTemplate = exportPermission.dto.auditMetadataTemplate', '')
        .replace('const auditWritten = await writeAuditEvent({ metadata: auditMetadataTemplate })', '')
    )

    expect(result.ok).toBe(false)
    expect(result.errors.some((error) => error.startsWith('audit_metadata must appear before'))).toBe(true)
  })

  it('fails if a future route does not stop after required audit persistence fails', () => {
    const result = validateFutureExportRouteRuntimeWiringSource(
      'unchecked-audit-export',
      validFutureRouteSource.replace(
        'if (!auditWritten) return Response.json({ error: genericExportBlockedReason }, { status: 503 })',
        '',
      ),
    )

    expect(result.ok).toBe(false)
    expect(result.errors.some((error) => error.startsWith('audit_persistence must appear before')))
      .toBe(true)
  })

  it('fails if future route source includes only partial markers for required export gates', () => {
    const result = validateFutureExportRouteRuntimeWiringSource(
      'partial-export',
      `
        const gate = getExportRuntimeGate(process.env)
        const genericExportBlockedReason = 'Export request cannot be completed.'
        const staff = await requireStaffFromRequest(request)
        const activeParishContext = await resolveActiveStaffParishContext(staff.id)
        const membershipParishIds = activeParishContext.membershipParishIds
        const exportPermission = buildExportPermissionEvaluationDto({})
        const blockedFieldsRequested = exportPermission.dto.blockedFieldsRequested
        const familyPortalSurface = exportPermission.dto.familyPortalSurface
        const auditMetadataTemplate = exportPermission.dto.auditMetadataTemplate
        const auditWritten = await writeAuditEvent({ metadata: auditMetadataTemplate })
        const rows = await queryExportRows(exportPermission.dto)
        returnExportFile(rows)
      `
    )

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('runtime_gate'),
        expect.stringContaining('active_parish_scope'),
        expect.stringContaining('blocked_field_controls'),
        expect.stringContaining('family_portal_exclusion'),
        expect.stringContaining('audit_metadata'),
        expect.stringContaining('generic_blocked_errors'),
      ])
    )
    expect(result.errors.join('\n')).toContain('Expected all markers from one set')
  })
})
