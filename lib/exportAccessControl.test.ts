import { describe, expect, it } from 'vitest'
import {
  BLOCKED_EXPORT_FIELD_PATTERNS,
  EXPORT_ACCESS_CONTROL_DTO_VERSION,
  EXPORT_DATA_CLASS_POLICIES,
  EXPORT_PRESET_POLICIES,
  EXPORT_ROLE_DEFAULT_PERMISSIONS,
  buildExportPermissionEvaluationDto,
  type ExportPermissionEvaluationInput,
} from './exportAccessControl'

function baseInput(
  overrides?: Partial<ExportPermissionEvaluationInput>
): ExportPermissionEvaluationInput {
  return {
    staff: {
      userId: 'staff-1',
      email: 'Secretary@ExampleParish.test',
      roles: ['parish_admin'],
      ...overrides?.staff,
    },
    scope: {
      activeParishId: 'parish-a',
      membershipParishIds: ['parish-a', 'parish-b'],
      targetParishIds: ['parish-a'],
      selectedParishName: 'Vinea QA Parish A',
      ...overrides?.scope,
    },
    request: {
      presetId: 'request_list_basic',
      targetObjectType: 'requests',
      requestedFields: ['request_id', 'request_type', 'status', 'created_at'],
      filtersSummary: 'Open requests created this month',
      estimatedRowCount: 25,
      ...overrides?.request,
    },
    timestamp: '2026-06-30T12:00:00.000Z',
  }
}

describe('export access-control DTOs', () => {
  it('declares non-runtime export policy registries for permissions, roles, data classes, and blocked fields', () => {
    expect(EXPORT_ACCESS_CONTROL_DTO_VERSION).toBe('2026-06-30-export-access-non-runtime-v1')
    expect(EXPORT_PRESET_POLICIES.request_list_basic.requiredPermission).toBe('export_same_parish_basic')
    expect(EXPORT_PRESET_POLICIES.sacramental_records_certificate_evidence.requiredPermission).toBe(
      'export_sacramental_canonical'
    )
    expect(EXPORT_PRESET_POLICIES.request_document_files_bulk.runtimeExportEnabled).toBe(false)
    expect(EXPORT_DATA_CLASS_POLICIES.sacramental_canonical.sacramentalCanonicalRestricted).toBe(true)
    expect(EXPORT_DATA_CLASS_POLICIES.document_files.runtimeExportEnabled).toBe(false)
    expect(EXPORT_ROLE_DEFAULT_PERMISSIONS.parish_secretary).toContain('export_same_parish_basic')
    expect(EXPORT_ROLE_DEFAULT_PERMISSIONS.parish_secretary).not.toContain('export_audit_security')
    expect(BLOCKED_EXPORT_FIELD_PATTERNS).toContain('portal_token_hash')
    expect(BLOCKED_EXPORT_FIELD_PATTERNS).toContain('raw_openai_prompt')
  })

  it('builds a same-parish basic export DTO with safe audit metadata but keeps runtime export disabled', () => {
    const result = buildExportPermissionEvaluationDto(baseInput())

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.dto.runtimeState).toBe('non_runtime_export_permission_only')
    expect(result.dto.decision).toBe('disabled_non_runtime')
    expect(result.dto.blockedReason).toBe('runtime_export_not_enabled')
    expect(result.dto.activeParishId).toBe('parish-a')
    expect(result.dto.parishIdsIncluded).toEqual(['parish-a'])
    expect(result.dto.preset.requiredPermission).toBe('export_same_parish_basic')
    expect(result.dto.familyFacingExportAllowed).toBe(false)
    expect(result.dto.requiresAuditEvent).toBe(true)
    expect(result.dto.auditMetadataTemplate).toMatchObject({
      staff_user_id_or_email: 'staff-1',
      active_parish_id: 'parish-a',
      parish_ids_included: ['parish-a'],
      export_preset_id: 'request_list_basic',
      target_object_type: 'requests',
      row_count_or_estimate: 25,
      decision: 'disabled_non_runtime',
      safeMetadataOnly: true,
    })
  })

  it('denies cross-parish exports even when the staff member belongs to both parishes', () => {
    const result = buildExportPermissionEvaluationDto(
      baseInput({
        scope: {
          activeParishId: 'parish-a',
          membershipParishIds: ['parish-a', 'parish-b'],
          targetParishIds: ['parish-b'],
          selectedParishName: 'Vinea QA Parish A',
        },
      })
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.dto.decision).toBe('denied_non_runtime')
    expect(result.dto.blockedReason).toBe('target_parish_does_not_match_active_parish')
    expect(result.dto.auditMetadataTemplate.decision).toBe('denied_non_runtime')
  })

  it('denies staff who lacks the export permission for sensitive audit/security exports', () => {
    const result = buildExportPermissionEvaluationDto(
      baseInput({
        staff: {
          userId: 'staff-2',
          email: 'secretary@exampleparish.test',
          roles: ['parish_secretary'],
        },
        request: {
          presetId: 'audit_security_window',
          targetObjectType: 'audit_events',
          requestedFields: ['event_id', 'actor_email', 'event_type', 'created_at'],
          filtersSummary: 'Last 24 hours',
          estimatedRowCount: 10,
          reason: 'Security review for parish administrator',
        },
      })
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.dto.decision).toBe('denied_non_runtime')
    expect(result.dto.blockedReason).toBe('missing_export_permission:export_audit_security')
    expect(result.dto.humanApprovalRequired).toBe(true)
  })

  it('requires a reason for sensitive and sacramental/canonical export presets', () => {
    const result = buildExportPermissionEvaluationDto(
      baseInput({
        request: {
          presetId: 'sacramental_records_certificate_evidence',
          targetObjectType: 'sacramental_records',
          requestedFields: ['record_id', 'person_name', 'sacrament_type', 'record_date'],
          filtersSummary: 'Certificate evidence for one parish request',
          estimatedRowCount: 1,
          reason: null,
        },
      })
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.dto.decision).toBe('denied_non_runtime')
    expect(result.dto.blockedReason).toBe('export_reason_required')
    expect(result.dto.sacramentalCanonicalRestricted).toBe(true)
    expect(result.dto.humanApprovalRequired).toBe(true)
  })

  it('blocks family portal surfaces from staff export DTOs', () => {
    const result = buildExportPermissionEvaluationDto(
      baseInput({
        request: {
          presetId: 'request_document_manifest',
          targetObjectType: 'request_documents',
          requestedFields: ['document_id', 'family_label', 'status'],
          filtersSummary: 'Required documents',
          estimatedRowCount: 3,
          familyPortalSurface: true,
        },
      })
    )

    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('Expected family portal export evaluation to be blocked.')

    expect(result.blockedReason).toBe('family_portal_surface_cannot_export_staff_data')
  })

  it('blocks requested fields that look like secrets, tokens, signed URLs, or raw AI material', () => {
    const result = buildExportPermissionEvaluationDto(
      baseInput({
        request: {
          presetId: 'request_document_manifest',
          targetObjectType: 'request_documents',
          requestedFields: ['document_id', 'signed_url', 'portal_token_hash'],
          filtersSummary: 'Required documents',
          estimatedRowCount: 3,
        },
      })
    )

    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('Expected blocked export fields evaluation to be denied.')

    expect(result.blockedReason).toBe('blocked_export_fields_requested')
  })

  it('keeps disabled future multi-parish and support export presets behind explicit non-runtime decisions', () => {
    const diocesan = buildExportPermissionEvaluationDto(
      baseInput({
        staff: {
          userId: 'staff-3',
          email: 'diocese@example.test',
          roles: ['diocese_admin_future'],
        },
        scope: {
          activeParishId: 'parish-a',
          membershipParishIds: ['parish-a', 'parish-b'],
          targetParishIds: ['parish-a', 'parish-b'],
          selectedParishName: 'Vinea QA Parish A',
        },
        request: {
          presetId: 'diocesan_multi_parish_rollup',
          targetObjectType: 'diocesan_rollup',
          requestedFields: ['parish_id', 'request_count'],
          filtersSummary: 'Cluster rollup',
          estimatedRowCount: 2,
          reason: 'Future diocesan pilot review',
        },
      })
    )
    const support = buildExportPermissionEvaluationDto(
      baseInput({
        staff: {
          userId: 'support-1',
          email: 'support@example.test',
          roles: ['vinea_support_operator'],
        },
        request: {
          presetId: 'support_break_glass_package',
          targetObjectType: 'support_package',
          requestedFields: ['request_id', 'status'],
          filtersSummary: 'Support case package',
          estimatedRowCount: 1,
          reason: 'Approved support case review',
        },
      })
    )

    expect(diocesan.ok).toBe(true)
    if (diocesan.ok) {
      expect(diocesan.dto.decision).toBe('denied_non_runtime')
      expect(diocesan.dto.blockedReason).toBe('target_parish_does_not_match_active_parish')
    }

    expect(support.ok).toBe(true)
    if (support.ok) {
      expect(support.dto.decision).toBe('denied_non_runtime')
      expect(support.dto.blockedReason).toBe('missing_export_permission:support_break_glass_export')
    }
  })
})
