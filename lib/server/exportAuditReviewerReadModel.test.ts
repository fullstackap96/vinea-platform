import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  buildExportAuditReviewerReadModel,
  EXPORT_AUDIT_REVIEWER_READ_MODEL_VERSION,
  type ExportAuditReviewerSourceEvent,
} from '@/lib/server/exportAuditReviewerReadModel'

const sourcePath = join(process.cwd(), 'lib', 'server', 'exportAuditReviewerReadModel.ts')

const approvedWindow = {
  startsAt: '2026-07-01T14:00:00.000Z',
  endsAt: '2026-07-01T15:00:00.000Z',
}

function requestListDownloaded(
  overrides: Partial<ExportAuditReviewerSourceEvent> = {}
): ExportAuditReviewerSourceEvent {
  return {
    id: 'audit-request-list-downloaded',
    created_at: '2026-07-01T14:15:00.000Z',
    action: 'export.request_list_basic.downloaded',
    actor_email: 'qa-staff@example.com',
    parish_id: 'parish-a',
    target_type: 'export',
    target_id: 'request_list_basic',
    metadata: {
      routeId: 'app/api/exports/requests/basic',
      runtimeGateState: 'enabled_non_production',
      export_preset_id: 'request_list_basic',
      target_object_type: 'requests',
      staff_user_id_or_email: 'safe-staff-label',
      active_parish_id: 'parish-a',
      active_parish_name: 'QA Parish A',
      parish_ids_included: ['parish-a'],
      row_count_or_estimate: 38,
      destination: 'download',
      csv_header_approved: true,
      safeMetadataOnly: true,
    },
    ...overrides,
  }
}

function documentManifestDenied(
  overrides: Partial<ExportAuditReviewerSourceEvent> = {}
): ExportAuditReviewerSourceEvent {
  return {
    id: 'audit-document-manifest-denied',
    created_at: '2026-07-01T14:20:00.000Z',
    action: 'export.request_document_manifest.denied',
    actor_email: 'qa-staff@example.com',
    parish_id: 'parish-a',
    target_type: 'export',
    target_id: 'request_document_manifest',
    metadata: {
      routeId: 'app/api/exports/requests/documents/manifest',
      runtimeGateState: 'enabled_non_production',
      export_preset_id: 'request_document_manifest',
      target_object_type: 'request_documents',
      active_parish_id: 'parish-a',
      parish_ids_included: ['parish-a'],
      decision: 'denied',
      deniedReasonCode: 'blocked_or_disallowed_fields',
      httpStatus: 403,
      requestedActiveParishCookiePresent: true,
      requestedFieldsCount: 2,
      blockedFieldsRequestedCount: 1,
      disallowedFieldsCount: 0,
      safeMetadataOnly: true,
    },
    ...overrides,
  }
}

describe('export audit reviewer read-model builder', () => {
  it('builds a safe downloaded request-list reviewer row', () => {
    const [row] = buildExportAuditReviewerReadModel([requestListDownloaded()], {
      approvedWindow,
      reviewerLabel: 'QA Reviewer',
      reviewedAt: '2026-07-01T15:05:00.000Z',
      evidenceReference: 'non-production export drill',
    })

    expect(row).toMatchObject({
      version: EXPORT_AUDIT_REVIEWER_READ_MODEL_VERSION,
      audit_event_id: 'audit-request-list-downloaded',
      event_action: 'export.request_list_basic.downloaded',
      export_route_id: 'app/api/exports/requests/basic',
      export_preset_id: 'request_list_basic',
      target_object_type: 'requests',
      decision: 'downloaded',
      denied_reason_code: null,
      runtime_gate_state: 'enabled_non_production',
      staff_email_label: 'qa-staff@example.com',
      active_parish_id_label: 'parish-a',
      parish_ids_included_count: 1,
      row_count_bucket: '1-100',
      delivery_format: 'download',
      csv_header_approved: true,
      manifest_only: false,
      safe_metadata_only: true,
      secret_marker_scan_status: 'clear',
      file_material_marker_scan_status: 'clear',
      metadata_completeness_status: 'complete',
      review_status: 'ready_for_review',
      severity: 'none',
      rollback_required: false,
      incident_response_required: false,
      reviewer_label: 'QA Reviewer',
      evidence_reference: 'non-production export drill',
    })
    expect(row.saved_filters).toEqual(['exports_downloaded_recent', 'request_list_basic_safety_review'])
    expect(row.suspicious_rules).toEqual([])
  })

  it('builds a safe denied document-manifest row with blocked-field review flags', () => {
    const [row] = buildExportAuditReviewerReadModel([documentManifestDenied()], {
      approvedWindow,
    })

    expect(row).toMatchObject({
      decision: 'denied',
      http_status: 403,
      denied_reason_code: 'blocked_or_disallowed_fields',
      export_preset_id: 'request_document_manifest',
      target_object_type: 'request_documents',
      requested_active_parish_cookie_present: true,
      requested_fields_count: 2,
      blocked_fields_requested_count: 1,
      disallowed_fields_count: 0,
      manifest_only: true,
      blocked_field_boundary: true,
      metadata_completeness_status: 'complete',
      severity: 'severity_2',
      review_status: 'needs_review',
      rollback_required: false,
      incident_response_required: false,
    })
    expect(row.saved_filters).toEqual([
      'exports_denied_recent',
      'exports_blocked_field_attempts',
      'document_manifest_safety_review',
    ])
    expect(row.suspicious_rules).toEqual(['blocked_field_attempt'])
  })

  it('routes selected-parish role denials into the forged-scope review queue', () => {
    const [row] = buildExportAuditReviewerReadModel([
      documentManifestDenied({
        metadata: {
          routeId: 'app/api/exports/requests/documents/manifest',
          runtimeGateState: 'enabled_non_production',
          export_preset_id: 'request_document_manifest',
          target_object_type: 'request_documents',
          active_parish_id: 'parish-b',
          parish_ids_included: ['parish-b'],
          decision: 'denied',
          deniedReasonCode: 'selected_parish_role_denied',
          httpStatus: 403,
          requestedActiveParishCookiePresent: true,
          requestedFieldsCount: 11,
          safeMetadataOnly: true,
        },
      }),
    ])

    expect(row.denied_reason_code).toBe('selected_parish_role_denied')
    expect(row.saved_filters).toContain('exports_cross_parish_or_forged_scope')
    expect(row.suspicious_rules).toContain('active_parish_scope_denied')
    expect(row.review_status).toBe('needs_review')
  })

  it('classifies cross-parish, family, rollback, flag-off, and manifest-sensitive delivery as severity 1', () => {
    const [row] = buildExportAuditReviewerReadModel(
      [
        requestListDownloaded({
          created_at: '2026-07-01T16:30:00.000Z',
          target_id: 'request_document_manifest',
          action: 'export.request_document_manifest.downloaded',
          metadata: {
            routeId: 'app/api/exports/requests/documents/manifest',
            runtimeGateState: 'enabled_non_production',
            export_preset_id: 'request_document_manifest',
            target_object_type: 'request_documents',
            active_parish_id: 'parish-a',
            parish_ids_included: ['parish-a', 'parish-b'],
            row_count_or_estimate: 7500,
            destination: 'download',
            crossParishBoundary: true,
            familyPortalSurface: true,
            suspiciousProbe: 'signed url material was detected',
            safeMetadataOnly: true,
          },
        }),
      ],
      {
        approvedWindow,
        rollbackDeadline: '2026-07-01T15:30:00.000Z',
        flagsExpectedOff: true,
        highRowCountThreshold: 5000,
      }
    )

    expect(row.severity).toBe('severity_1')
    expect(row.review_status).toBe('needs_escalation')
    expect(row.rollback_required).toBe(true)
    expect(row.incident_response_required).toBe(true)
    expect(row.saved_filters).toEqual([
      'exports_downloaded_recent',
      'exports_cross_parish_or_forged_scope',
      'exports_family_or_unauthenticated',
      'exports_after_rollback',
      'document_manifest_safety_review',
    ])
    expect(row.suspicious_rules).toEqual([
      'downloaded_outside_approval_window',
      'downloaded_after_rollback',
      'downloaded_while_flags_off',
      'cross_parish_delivery',
      'family_or_unauthenticated_delivery',
      'document_manifest_sensitive_material',
      'row_count_unusually_high',
    ])
  })

  it('classifies repeated denied attempts by actor and preset', () => {
    const rows = buildExportAuditReviewerReadModel(
      [
        documentManifestDenied({ id: 'denied-1' }),
        documentManifestDenied({ id: 'denied-2' }),
        documentManifestDenied({ id: 'denied-3', actor_email: 'other-staff@example.com' }),
      ],
      { approvedWindow, repeatedDeniedThreshold: 2 }
    )

    expect(rows[0].saved_filters).toContain('repeated_denials_by_actor')
    expect(rows[0].suspicious_rules).toContain('repeated_denied_attempts')
    expect(rows[1].saved_filters).toContain('repeated_denials_by_actor')
    expect(rows[1].suspicious_rules).toContain('repeated_denied_attempts')
    expect(rows[2].saved_filters).not.toContain('repeated_denials_by_actor')
    expect(rows[2].suspicious_rules).not.toContain('repeated_denied_attempts')
  })

  it('fails incomplete or mismatched audit metadata into review instead of guessing', () => {
    const [row] = buildExportAuditReviewerReadModel([
      {
        id: 'legacy-event',
        created_at: '2026-07-01T14:25:00.000Z',
        action: 'export.request_list_basic.downloaded',
        actor_email: 'qa-staff@example.com',
        target_type: 'export',
        target_id: 'request_document_manifest',
        metadata: {
          routeId: 'app/api/exports/requests/basic',
          export_preset_id: 'request_document_manifest',
          target_object_type: 'requests',
        },
      },
    ])

    expect(row.metadata_completeness_status).toBe('incomplete')
    expect(row.saved_filters).toEqual([
      'exports_downloaded_recent',
      'exports_metadata_incomplete',
      'document_manifest_safety_review',
    ])
    expect(row.suspicious_rules).toEqual(['metadata_incomplete', 'route_preset_mismatch'])
    expect(row.severity).toBe('severity_2')
  })

  it('does not serialize forbidden input material into reviewer rows', () => {
    const rows = buildExportAuditReviewerReadModel([
      documentManifestDenied({
        id: 'secret-shaped-event',
        target_id: 'postgresql://example.invalid/not-real',
        metadata: {
          routeId: 'app/api/exports/requests/documents/manifest',
          runtimeGateState: 'enabled_non_production',
          export_preset_id: 'request_document_manifest',
          target_object_type: 'request_documents',
          active_parish_id: 'parish-a',
          decision: 'denied',
          deniedReasonCode: 'blocked_or_disallowed_fields',
          httpStatus: 403,
          rawRequestedFields: ['access_token', 'storage_path'],
          unsafeDocumentMaterial: 'https://files.example.invalid/signed-url',
          unsafeConnectionString: 'postgresql://postgres:secret@example.invalid/postgres',
          unsafeJwt: 'eyJnotARealTokenButStillSecretShaped',
          unsafePrompt: 'raw prompt and ai output should not be copied',
          safeMetadataOnly: true,
        },
      }),
    ])

    const serialized = JSON.stringify(rows)

    expect(rows[0].target_object_id_label).toBe('redacted_sensitive_marker')
    expect(rows[0].secret_marker_scan_status).toBe('blocked_marker_detected')
    expect(rows[0].file_material_marker_scan_status).toBe('blocked_marker_detected')
    expect(rows[0].suspicious_rules).toContain('document_manifest_sensitive_material')
    for (const forbidden of [
      'access_token',
      'storage_path',
      'signed-url',
      'postgresql://',
      'eyJnotARealToken',
      'raw prompt',
      'ai output',
    ]) {
      expect(serialized).not.toContain(forbidden)
    }
  })

  it('remains a server-only read-model builder without runtime, storage, writer, or route dependencies', () => {
    const source = readFileSync(sourcePath, 'utf8')

    expect(source).toContain("import 'server-only'")
    for (const forbidden of [
      "from '@/lib/supabaseServiceServer'",
      "from '@/lib/server/auditLog'",
      "from 'next/server'",
      'writeAuditEvent',
      'createSupabase',
      '.insert(',
      '.update(',
      '.delete(',
      'signedUrl',
      'createSignedUrl',
      'googleapis',
      'process.env',
    ]) {
      expect(source).not.toContain(forbidden)
    }
  })
})
