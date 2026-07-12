import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE_APPROVAL_PACKET_20260701.md'
)

describe('export audit reviewer API live non-production smoke approval packet', () => {
  it('requires exact non-production target, flags, fixtures, monitoring, and rollback owner', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const required of [
      'Completion marker: `EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE_APPROVAL_PACKET_20260701`',
      'Current decision state: `LIVE NON-PRODUCTION EXPORT AUDIT REVIEWER API SMOKE NOT APPROVED BY THIS DOCUMENT`',
      'App target label: `NON_PRODUCTION_APP_URL`',
      'Route under smoke: `/api/export-audit-reviewer`',
      'Health check route: `<NON_PRODUCTION_APP_URL>/api/health`',
      '`VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE=ENABLED`',
      '`VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK=APPROVED_EXPORT_AUDIT_REVIEWER_QA`',
      '`VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV=NON_PRODUCTION`',
      'Staff fixture label: `SAFE_EXPORT_AUDIT_REVIEWER_QA_STAFF`',
      'Active parish fixture label: `SAFE_EXPORT_AUDIT_REVIEWER_PARISH_A`',
      'Downloaded request-list event fixture label: `SAFE_EXPORT_AUDIT_REVIEWER_REQUEST_LIST_DOWNLOADED_EVENT`',
      'Denied request-list event fixture label: `SAFE_EXPORT_AUDIT_REVIEWER_REQUEST_LIST_DENIED_EVENT`',
      'Downloaded document-manifest event fixture label: `SAFE_EXPORT_AUDIT_REVIEWER_DOCUMENT_MANIFEST_DOWNLOADED_EVENT`',
      'Denied document-manifest event fixture label: `SAFE_EXPORT_AUDIT_REVIEWER_DOCUMENT_MANIFEST_DENIED_EVENT`',
      'Cross-parish fixture label: `SAFE_EXPORT_AUDIT_REVIEWER_CROSS_PARISH_DENIAL_FIXTURE`',
      'Rollback owner placeholder: `ROLLBACK_OWNER_NAME`',
      'Production exports and production monitoring remain `NO-GO`.',
    ]) {
      expect(packet).toContain(required)
    }
  })

  it('defines saved-filter, forbidden-data, and exact approval-language gates', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const required of [
      '`exports_downloaded_recent`',
      '`exports_denied_recent`',
      '`exports_blocked_field_attempts`',
      '`exports_cross_parish_or_forged_scope`',
      '`exports_family_or_unauthenticated`',
      '`exports_after_rollback`',
      '`exports_metadata_incomplete`',
      '`document_manifest_safety_review`',
      '`request_list_basic_safety_review`',
      '`repeated_denials_by_actor`',
      'raw audit metadata blobs',
      'raw requested field names',
      'raw blocked field names',
      'storage paths',
      'signed URLs',
      'database URLs',
      'service-role keys',
      'API keys',
      'AI prompts',
      'AI outputs',
      'sacramental/canonical detail',
      'Approve live non-production HTTP/browser smoke for the export audit reviewer API-only prototype only.',
      'Run flag-off baseline first',
      'Verify health, staff authentication, selected active parish membership scope, saved-filter responses, forbidden data exclusions',
      'Do not access production, enable production flags, add dashboard UI, apply migrations, change operational RLS',
    ]) {
      expect(packet).toContain(required)
    }
  })

  it('keeps the packet from approving production, runtime exports, storage, signed URLs, or mutation', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const forbiddenApproval of [
      'Current decision state: `APPROVED`',
      'Production exports are approved',
      'Production monitoring is approved',
      'Dashboard UI approved',
      'Migrations approved',
      'RLS changes approved',
    ]) {
      expect(packet).not.toContain(forbiddenApproval)
    }

    for (const noGo of [
      'This packet does not approve:',
      'Production export reviewer flags.',
      'Production export monitoring.',
      'Production export runtime flags.',
      'Production exports.',
      'Dashboard UI.',
      'Storage access.',
      'Signed URL generation.',
      'Record mutation.',
      'The smoke requires export runtime flags.',
      'The route would access storage.',
      'The route would mutate records.',
    ]) {
      expect(packet).toContain(noGo)
    }
  })
})
