import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md'
)

describe('request_document_manifest export production readiness approval packet', () => {
  it('is approval-only and preserves production safety boundaries', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a production-readiness and product-owner approval packet only.',
      'Production was not accessed',
      'production flags were not enabled',
      'no staff-facing production UI was added',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current decision state: `PRODUCTION REQUEST_DOCUMENT_MANIFEST EXPORT NOT APPROVED BY THIS DOCUMENT`',
      'Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('links completed non-production evidence before asking for production approval', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_NONPRODUCTION_QA_EVIDENCE_20260630.md',
      'docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630.md',
      'docs/DATA_EXPORT_ACCESS_CONTROL_POLICY_PROPOSAL_20260630.md',
      'docs/TRUST_CENTER_READINESS_PACKET_20260627.md',
      'docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_ROUTE_WIRING_APPROVAL_PACKET_20260630.md',
      'docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_APPROVAL_PACKET_20260630.md',
      'This packet does not approve production export runtime flags',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines production-safe target, fixture, UI, support, monitoring, and rollback requirements', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Production app target label: `PRODUCTION_APP_URL`',
      'Production export route under approval: `<PRODUCTION_APP_URL>/api/exports/requests/documents/manifest`',
      'Production Supabase project label: `PRODUCTION_SUPABASE_PROJECT_LABEL`',
      'Production Vercel deployment label: `PRODUCTION_DEPLOYMENT_LABEL`',
      'Rollout window label: `REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_ROLLOUT_WINDOW`',
      'Safe staff fixture label: `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAFE_STAFF`',
      'Active parish fixture label: `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_PARISH_A`',
      'Same-parish request fixture label: `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAME_PARISH_REQUEST`',
      'Same-parish document set fixture label: `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET`',
      'Cross-parish denial fixture label: `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_CROSS_PARISH_DENIED_REQUEST`',
      'Family/unauthenticated denial method label: `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD`',
      'Blocked-field attempt label: `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_BLOCKED_FIELD_ATTEMPT`',
      'Audit-log inspection method label: `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_AUDIT_INSPECTION_METHOD`',
      'Current UI decision: `NO STAFF-FACING PRODUCTION DOCUMENT MANIFEST EXPORT UI APPROVED`',
      'Support owner placeholder: `REQUEST_DOCUMENT_MANIFEST_EXPORT_SUPPORT_OWNER`',
      'Monitoring owner placeholder: `REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_OWNER`',
      'Monitoring channel placeholder: `REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_CHANNEL`',
      'Rollback owner placeholder: `REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_OWNER`',
      'Rollback decision deadline placeholder: `REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_DECISION_DEADLINE`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('keeps the production smoke manifest-only and blocks file/storage/token/private data exposure', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'The export remains manifest-only.',
      'must never create signed URLs',
      'expose storage paths',
      'export original filenames',
      'deliver document files',
      'expose family portal tokens',
      'expose token hashes',
      'expose staff notes',
      'expose communications',
      'expose AI material',
      'expose sacramental/canonical details',
      'The blocked-field attempt must include at least `signed_url`, `storage_path`, `original_filename`, and `portal_token`.',
      'Current UI decision: `NO STAFF-FACING PRODUCTION DOCUMENT MANIFEST EXPORT UI APPROVED`',
      'Verify no signed URL, storage, file preview, or file download APIs are used.',
      'CSV does not contain signed URL, storage path, original filename, file content, token, note, communication, AI, Google, or sacramental/canonical markers.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires production smoke gates, pass/fail criteria, exact approval language, and no-go language', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Product owner approves the exact production target and rollout window.',
      'Security/data owner approves the fixture labels, manifest-only boundary, blocked-field smoke, and no-file-delivery evidence.',
      'Engineering owner confirms the production route still satisfies source-level export preflight and still contains no signed URL, storage, or file download API usage.',
      'Parish operations owner approves the staff-facing language boundary or confirms there is no staff-facing UI.',
      'Support owner approves the support handling plan.',
      'Monitoring owner and channel are named.',
      'Rollback owner is named.',
      'The route is smoke-tested flag-off before any production flag change.',
      'Production flags are enabled only for the approved smoke window and only if rollback is ready.',
      'Flag-off baseline returns generic unavailable behavior.',
      'Same-parish manifest export succeeds only for the selected active parish.',
      'CSV contains only approved `request_document_manifest` fields.',
      'Cross-parish denial is generic and does not deliver CSV.',
      'Blocked-field denial is generic and does not reveal field existence.',
      'Family/unauthenticated access is denied before parish scope, query, audit, or delivery.',
      'Approve production smoke for request_document_manifest export only.',
      'Keep the export manifest-only.',
      'Do not add staff-facing production UI, apply migrations, change operational RLS, touch Google Calendar data, mutate records beyond approved audit metadata, expose secrets, create signed URLs, expose storage paths, export original filenames, deliver document files, expose tokens, notes, communications, AI material, sacramental/canonical details, or expand exports beyond request_document_manifest.',
      'Current recommendation: `NO-GO UNTIL PRODUCT OWNER CONFIRMS PRODUCTION-SAFE DOCUMENT MANIFEST FIXTURES, EXACT PUBLIC PRODUCTION URL, EXACT ROLLOUT WINDOW, AND EXACT FUTURE APPROVAL PROMPT`',
      'Production target labels are filled.',
      'Exact public production app URL is confirmed.',
      'Exact production rollout window is confirmed.',
      'Keep production exports `NO-GO` until the product owner fills non-secret production fixture labels',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('does not include obvious credential, token, connection-string, or raw fixture material', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'sb-',
      'eyJ',
      '00000000-0000-4000-8000-000000000000',
    ]) {
      expect(packet).not.toContain(forbidden)
    }
  })
})
