import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_APPROVAL_PACKET_20260630.md'
)
const policyPath = join(process.cwd(), 'docs', 'DATA_EXPORT_ACCESS_CONTROL_POLICY_PROPOSAL_20260630.md')
const trustCenterPath = join(process.cwd(), 'docs', 'TRUST_CENTER_READINESS_PACKET_20260627.md')

describe('request_document_manifest export live non-production smoke approval packet', () => {
  it('is approval-only and preserves the production and runtime safety boundary', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a product-owner approval packet only.',
      'Production was not accessed',
      'production flags were not enabled',
      'no staff-facing production UI was added',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current decision state: `LIVE NON-PRODUCTION DOCUMENT MANIFEST EXPORT SMOKE NOT APPROVED BY THIS DOCUMENT`',
      'Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_APPROVAL_PACKET_20260630`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines exact app target, flags, fixtures, denial cases, audit inspection, monitoring, and rollback', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'App target label: `NON_PRODUCTION_APP_URL`',
      'Route under smoke: `/api/exports/requests/documents/manifest`',
      '`VINEA_EXPORT_RUNTIME=ENABLED`',
      '`VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`',
      '`VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`',
      'Staff fixture label: `SAFE_DOCUMENT_MANIFEST_EXPORT_QA_STAFF`',
      'Active parish fixture label: `SAFE_DOCUMENT_MANIFEST_EXPORT_PARISH_A`',
      'Same-parish request fixture label: `SAFE_DOCUMENT_MANIFEST_EXPORT_SAME_PARISH_REQUEST`',
      'Same-parish document fixture label: `SAFE_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET`',
      'Cross-parish fixture label: `SAFE_DOCUMENT_MANIFEST_EXPORT_CROSS_PARISH_DENIED_REQUEST`',
      '/api/exports/requests/documents/manifest?fields=request_reference,signed_url',
      '/api/exports/requests/documents/manifest?fields=request_reference,storage_path',
      '/api/exports/requests/documents/manifest?fields=request_reference,original_filename',
      '/api/exports/requests/documents/manifest?fields=request_reference,portal_token',
      'Preferred method: open the route from a browser context that is not authenticated as staff.',
      'Audit action: `export.request_document_manifest.downloaded`',
      'Rollback owner placeholder: `ROLLBACK_OWNER_NAME`',
      '/api/health` returns `checks.schema: true`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('keeps the smoke manifest-only and blocks document file, storage, token, note, AI, and sacramental exposure', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Signed URL generation.',
      'Storage bucket exposure.',
      'Storage object path exposure.',
      'Direct storage path exposure.',
      'Original filename export.',
      'Uploaded file content export.',
      'File previews or downloads.',
      'Bulk document file exports.',
      'Family portal token export.',
      'Family portal token hash export.',
      'Staff-only internal note export.',
      'Staff-only document comment export.',
      'Communication-history export.',
      'AI summary, draft, prompt, provider payload, or token-material export.',
      'Sacramental/canonical detail export.',
      'Any operational RLS change.',
      'Any database migration.',
      'Any Google Calendar behavior.',
      'Any record mutation beyond approved safe audit metadata.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires exact future approval language before live smoke execution', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Approve live non-production HTTP/browser smoke for the request_document_manifest export route only.',
      'Run flag-off baseline first',
      'Verify same-parish manifest CSV success, cross-parish denial, blocked-field denial, family-portal or unauthenticated denial, safe audit metadata, CSV field exclusions, no signed URL/storage/file API usage, monitoring expectations, and rollback by disabling flags.',
      'Keep the export manifest-only and do not create signed URLs, expose storage paths, export original filenames, deliver document files, expose tokens, notes, communications, AI material, sacramental/canonical details, or mutate records beyond approved audit metadata.',
      'Do not access production, enable production flags, add production UI, apply migrations, change operational RLS, touch Google Calendar data, or expose secrets.',
      'Current recommendation: `NO-GO UNTIL PRODUCT OWNER FILLS FIXTURES AND APPROVES THE EXACT FUTURE PROMPT`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('updates policy and trust-center docs while keeping live smoke unapproved by default', () => {
    const policy = readFileSync(policyPath, 'utf8')
    const trustCenter = readFileSync(trustCenterPath, 'utf8')

    expect(policy).toContain('REQUEST DOCUMENT MANIFEST LIVE SMOKE APPROVAL PACKET PREPARED')
    expect(policy).toContain('REQUEST DOCUMENT MANIFEST LIVE NON-PRODUCTION SMOKE PASSED')
    expect(policy).toContain(
      'Request document manifest live non-production smoke approval packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_APPROVAL_PACKET_20260630.md`'
    )
    expect(policy).toContain(
      'Request document manifest live non-production smoke evidence: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630.md`'
    )
    expect(policy).toContain(
      'The document manifest live non-production smoke approval packet intentionally does not approve executing the smoke by itself.'
    )
    expect(trustCenter).toContain(
      'Request document manifest live non-production smoke approval packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_APPROVAL_PACKET_20260630.md`'
    )
    expect(trustCenter).toContain(
      'Request document manifest live non-production smoke approval packet tests: `lib/server/requestDocumentManifestExportLiveSmokeApprovalPacket.test.ts`'
    )
    expect(trustCenter).toContain(
      'Request document manifest live non-production smoke evidence: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630.md`'
    )
    expect(trustCenter).toContain(
      'Document manifest production export remains unapproved until production-safe fixture labels, exact public production app target, exact rollout window, rollback owner, monitoring expectations, staff-facing UI boundary, support handling, exact approval language, and an approved production-runtime gate implementation path are supplied.'
    )
    expect(trustCenter).toContain(
      'The source-level preflight scaffold validates the expected gate shape and manifest safety markers before future implementation.'
    )
    expect(trustCenter).toContain(
      'The production gate implementation approval packet defines exact implementation files, expected tests, flag-off production baseline, monitoring requirements, rollback behavior, and post-implementation `NO-GO` boundary before any production smoke.'
    )
  })

  it('does not include obvious credential, connection-string, token, signed URL, or raw fixture material', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'https://signed',
      'eyJ',
      '00000000-0000-4000-8000-000000000000',
    ]) {
      expect(packet).not.toContain(forbidden)
    }
  })
})
