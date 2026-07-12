import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'EXPORT_AUDIT_REVIEWER_DASHBOARD_PROTOTYPE_APPROVAL_PACKET_20260701.md'
)

describe('export audit reviewer dashboard prototype approval packet', () => {
  it('is an approval packet only and keeps production exports blocked', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Status: Product-owner approval packet prepared only.',
      'Production was not accessed',
      'production export flags were not enabled',
      'dashboard UI was not added',
      'migrations were not applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'storage was not accessed',
      'signed URLs were not created',
      'raw exports were not exposed',
      'no secrets were exposed',
      'Current decision state: `EXPORT AUDIT REVIEWER DASHBOARD PROTOTYPE APPROVAL PACKET PREPARED; DASHBOARD NOT IMPLEMENTED; PRODUCTION EXPORTS REMAIN NO-GO`',
      'Completion marker: `EXPORT_AUDIT_REVIEWER_DASHBOARD_PROTOTYPE_APPROVAL_PACKET_20260701`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('limits future implementation to dashboard prototype files and existing API/read-model data', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      '`app/dashboard/admin/export-audit-reviewer/page.tsx`',
      '`app/dashboard/admin/export-audit-reviewer/ExportAuditReviewerDashboardPrototype.tsx`',
      '`lib/server/exportAuditReviewerDashboardPrototype.test.ts`',
      '`docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PROTOTYPE_QA_EVIDENCE_20260701.md`',
      '`lib/server/exportAuditReviewerDashboardPrototypeQaEvidence.test.ts`',
      'The dashboard prototype should not query Supabase directly.',
      'It should not call export routes.',
      'It should not add new data delivery paths.',
      'It should not add production monitoring.',
      'It should not expose raw audit metadata.',
      'If the implementation discovers the existing API/read-model response is missing a display-safe field, stop and prepare a separate approval packet',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines non-production gates, authentication, parish scope, and read-only behavior', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      '`VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE=ENABLED`',
      '`VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK=APPROVED_EXPORT_AUDIT_REVIEWER_QA`',
      '`VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV=NON_PRODUCTION`',
      '`NODE_ENV=production`',
      '`VERCEL_ENV=production`',
      'staff authentication',
      'selected active parish context',
      'membership-backed parish authorization',
      'forged active parish denial',
      'The page must not fetch audit events directly from Supabase',
      'must not implement a second parish-scope resolver',
      'insert, update, delete, or upsert rows',
      'write audit events',
      'call export routes',
      'read Supabase Storage',
      'generate signed URLs',
      'mutate cookies',
      'apply migrations',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines dashboard UX expectations, saved filters, and safe display fields', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'page title: `Export Audit Reviewer`',
      'selected parish label',
      'non-production prototype badge',
      'production exports `NO-GO` badge',
      'filter tabs or segmented controls for saved filters',
      'compact table of safe read-model rows',
      'export/download buttons',
      'raw metadata drawer',
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
      'event action',
      'export route id',
      'decision',
      'severity',
      'suspicious rule ids',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('forbids sensitive data, direct file access, and production escalation', () => {
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
      'production dashboard UI remains `NO-GO`',
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
    ]) {
      expect(packet).not.toContain(forbidden)
    }
  })

  it('defines manual QA, rollback, and exact future approval language', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Confirm `/api/health` returns `checks.schema: true`.',
      'Confirm the dashboard is unavailable with reviewer flags off.',
      'Select safe Parish A.',
      'Confirm production exports show `NO-GO`.',
      'Confirm saved filters render and update results.',
      'Disable or unset `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE`.',
      'Verify dashboard prototype route is unavailable.',
      'No database cleanup, migration rollback, storage cleanup, Google cleanup, audit-event cleanup, or production change should be required.',
      'Approve non-production implementation of the staff-facing export audit reviewer dashboard prototype only.',
      'Use only the existing /api/export-audit-reviewer API/read-model path and safe read-model fields.',
      'Keep production exports NO-GO after implementation.',
    ]) {
      expect(packet).toContain(expected)
    }
  })
})
