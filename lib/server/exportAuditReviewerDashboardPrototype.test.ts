import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const pagePath = join(
  process.cwd(),
  'app',
  'dashboard',
  'admin',
  'export-audit-reviewer',
  'page.tsx'
)
const componentPath = join(
  process.cwd(),
  'app',
  'dashboard',
  'admin',
  'export-audit-reviewer',
  'ExportAuditReviewerDashboardPrototype.tsx'
)

function source(path: string) {
  return readFileSync(path, 'utf8')
}

describe('export audit reviewer dashboard prototype', () => {
  it('keeps the page non-production gated before rendering the client prototype', () => {
    const page = source(pagePath)

    for (const expected of [
      "export const dynamic = 'force-dynamic'",
      "process.env.VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE === REVIEWER_PROTOTYPE_ENABLED_VALUE",
      "process.env.VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK === REVIEWER_PROTOTYPE_ACK_VALUE",
      'process.env.VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV ===',
      "process.env.NODE_ENV !== 'production'",
      "process.env.VERCEL_ENV !== 'production'",
      'if (!isPrototypeEnabled()) return <UnavailablePrototype />',
      '<ExportAuditReviewerDashboardPrototype />',
      'Production exports remain NO-GO.',
    ]) {
      expect(page).toContain(expected)
    }
  })

  it('uses only the existing export audit reviewer API path for data loading', () => {
    const component = source(componentPath)
    const page = source(pagePath)

    expect(component).toContain("fetch(`/api/export-audit-reviewer?${params.toString()}`")
    expect(component).toContain("credentials: 'include'")
    expect(component).toContain("cache: 'no-store'")
    expect(component).toContain("params.set('filter', selectedFilter)")

    for (const forbidden of [
      '@supabase',
      'createClient',
      'createServerClient',
      'createSupabase',
      '.from(',
      '.insert(',
      '.update(',
      '.upsert(',
      '.delete(',
      '/api/exports/',
      '/api/requests/',
      '/api/family/',
      'signedUrl',
      'signed_url',
      'storage_path',
      'original_filename',
      'download=',
      'href=',
    ]) {
      expect(component).not.toContain(forbidden)
      expect(page).not.toContain(forbidden)
    }
  })

  it('renders selected parish, production no-go, saved filters, and safe reviewer fields', () => {
    const component = source(componentPath)

    for (const expected of [
      'Export Audit Reviewer',
      'Parish scope:',
      'Production exports:',
      'NO-GO',
      'savedFilterLabels',
      'exports_downloaded_recent',
      'exports_denied_recent',
      'exports_blocked_field_attempts',
      'exports_cross_parish_or_forged_scope',
      'exports_family_or_unauthenticated',
      'exports_after_rollback',
      'exports_metadata_incomplete',
      'document_manifest_safety_review',
      'request_list_basic_safety_review',
      'repeated_denials_by_actor',
      'event_action',
      'export_route_id',
      'export_preset_id',
      'target_object_type',
      'target_object_id_label',
      'decision',
      'http_status',
      'denied_reason_code',
      'runtime_gate_state',
      'runtime_environment_label',
      'staff_email_label',
      'active_parish_name_label',
      'membership_scope_status',
      'request_ownership_status',
      'safe_metadata_only',
      'secret_marker_scan_status',
      'file_material_marker_scan_status',
      'review_status',
      'severity',
      'suspicious_rules',
    ]) {
      expect(component).toContain(expected)
    }
  })

  it('uses safe loading, empty, and generic error states', () => {
    const component = source(componentPath)

    for (const expected of [
      'Loading export audit reviewer...',
      'Export audit reviewer is unavailable for this staff session.',
      'No export audit summaries found.',
      'Try a different saved filter',
      'role="alert"',
      'Refresh',
    ]) {
      expect(component).toContain(expected)
    }
  })

  it('does not render forbidden sensitive data controls or raw-material labels', () => {
    const component = source(componentPath)

    for (const forbidden of [
      'raw metadata',
      'raw audit',
      'raw CSV',
      'file-open',
      'signed URL button',
      'document preview',
      'token display',
      'production enablement',
      'Open file',
      'Open document',
      'Download file',
      'Download CSV',
      'Create signed URL',
      'Export CSV',
      'Raw metadata',
      'Storage path',
      'Original filename',
      'Portal token',
      'Token hash',
      'AI prompt',
      'AI output',
    ]) {
      expect(component).not.toContain(forbidden)
    }
  })
})
