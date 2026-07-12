import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'EXPORT_AUDIT_REVIEWER_PROTOTYPE_APPROVAL_PACKET_20260701.md'
)
const trustCenterPath = join(process.cwd(), 'docs', 'TRUST_CENTER_READINESS_PACKET_20260627.md')

describe('export audit reviewer prototype approval packet', () => {
  it('is approval-packet-only and keeps production exports blocked', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Status: Product-owner approval packet prepared only.',
      'Production was not accessed',
      'production export flags were not enabled',
      'staff-facing production export UI was not added',
      'migrations were not applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current decision state: `EXPORT AUDIT REVIEWER PROTOTYPE APPROVAL PACKET PREPARED; PROTOTYPE NOT IMPLEMENTED; PRODUCTION EXPORTS REMAIN NO-GO`',
      'Completion marker: `EXPORT_AUDIT_REVIEWER_PROTOTYPE_APPROVAL_PACKET_20260701`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires choosing exactly one prototype path and defines exact files', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Choose exactly one future prototype path before coding:',
      'Recommended: API-only non-production prototype.',
      'Alternate: Dashboard-only non-production prototype backed by local fixture data.',
      'Do not implement both in one phase.',
      '`app/api/export-audit-reviewer/route.ts`',
      '`lib/server/exportAuditReviewerRoute.test.ts`',
      '`app/dashboard/admin/export-audit-reviewer/page.tsx`',
      '`app/dashboard/admin/export-audit-reviewer/ExportAuditReviewerPrototype.tsx`',
      '`lib/server/exportAuditReviewerReadModel.ts` only if a small builder fix is required',
      '`docs/VINEA_BUILD_STATUS.md`',
      '`docs/TRUST_CENTER_READINESS_PACKET_20260627.md`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines active parish, membership, non-production gate, and read-only requirements', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      '`VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE=ENABLED`',
      '`VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK=APPROVED_EXPORT_AUDIT_REVIEWER_QA`',
      '`VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV=NON_PRODUCTION`',
      '`NODE_ENV=production`',
      '`VERCEL_ENV=production`',
      'use the same active parish context resolver pattern as existing selected-parish read paths',
      'reject forged active parish cookies',
      'reject active parish cookies that resolve through legacy fallback instead of membership',
      'constrain audit-event reads to the selected active parish',
      'never include audit events from unauthorized parishes',
      'insert, update, delete, or upsert any row',
      'write no audit event',
      'mutate cookies',
      'apply migrations',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines saved-filter UX/API expectations and required tests', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
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
      'available filter ids',
      'selected filter id',
      'row count',
      'severity counts',
      'rows returned after filtering',
      'selected parish label',
      'filter tabs or segmented controls',
      'compact row table',
      'no export/download button',
      'no raw metadata drawer',
      'flag-off returns unavailable before auth/query',
      'production environment is blocked even with flags',
      'selected active parish cookie is membership-validated',
      'saved-filter selection works',
      'no write-like calls are made',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('forbids sensitive data exposure and production/runtime escalation', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'raw CSV rows',
      'raw export files',
      'raw audit metadata blobs',
      'raw requested field names for denied events',
      'raw blocked field names for denied events',
      'document contents',
      'storage paths',
      'signed URLs',
      'original filenames',
      'portal token values',
      'portal token hashes',
      'OAuth tokens',
      'email provider tokens',
      'database URLs',
      'service-role keys',
      'API keys',
      'notes',
      'communications',
      'AI prompts',
      'AI outputs',
      'sacramental/canonical detail',
      'family-facing private data beyond generic denial classification',
      'production exports remain `NO-GO`',
      'production export monitoring remains `NO-GO`',
      'staff-facing production export UI remains `NO-GO`',
    ]) {
      expect(packet).toContain(expected)
    }

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'sb_secret_',
      'eyJ',
      '00000000-0000-4000-8000-000000000000',
    ]) {
      expect(packet).not.toContain(forbidden)
    }
  })

  it('defines rollback/no-op behavior and exact approval language', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'disable prototype flags',
      'leave export routes unchanged',
      'leave audit events unchanged',
      'leave production flags off',
      'leave production exports disabled',
      'No database cleanup, migration rollback, storage cleanup, Google cleanup, or audit-event cleanup should be required.',
      '`NON-PRODUCTION EXPORT AUDIT REVIEWER PROTOTYPE IMPLEMENTED AND TESTED; PRODUCTION MONITORING AND PRODUCTION EXPORTS REMAIN NO-GO`',
      '`I approve non-production implementation of the export audit reviewer API-only prototype.',
      'Add only app/api/export-audit-reviewer/route.ts and focused tests',
      'Keep production exports NO-GO after implementation.`',
      '`I approve non-production implementation of the export audit reviewer dashboard-only prototype using sanitized/local read-model rows only.',
      'Do not add API routes, live audit-event queries, production monitoring',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('is linked from the trust-center readiness packet without implying prototype approval', () => {
    const trustCenter = readFileSync(trustCenterPath, 'utf8')

    for (const expected of [
      'Export audit reviewer prototype approval packet: `docs/EXPORT_AUDIT_REVIEWER_PROTOTYPE_APPROVAL_PACKET_20260701.md`',
      'The export audit reviewer prototype approval packet defines the future API-only or dashboard-only non-production prototype choices, exact files, active-parish and membership scope rules, read-only behavior, saved-filter UX expectations, forbidden-data checks, rollback/no-op behavior, and post-implementation `NO-GO` boundary.',
      'It does not implement any prototype or approve production monitoring, production flags, production exports, migrations, operational RLS changes, or staff-facing production export UI.',
      'Do not claim production runtime export controls',
    ]) {
      expect(trustCenter).toContain(expected)
    }
  })
})
