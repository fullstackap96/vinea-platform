import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'EXPORT_AUDIT_REVIEWER_READ_MODEL_IMPLEMENTATION_APPROVAL_PACKET_20260701.md',
)
const trustCenterPath = join(process.cwd(), 'docs', 'TRUST_CENTER_READINESS_PACKET_20260627.md')

describe('export audit reviewer read-model implementation approval packet', () => {
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
      'Current decision state: `EXPORT AUDIT REVIEWER READ MODEL BUILDER APPROVAL PACKET PREPARED; IMPLEMENTATION NOT STARTED; PRODUCTION EXPORTS REMAIN NO-GO`',
      'Completion marker: `EXPORT_AUDIT_REVIEWER_READ_MODEL_IMPLEMENTATION_APPROVAL_PACKET_20260701`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('limits future implementation to exact files and excludes routes, UI, migrations, and integrations', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      '`lib/server/exportAuditReviewerReadModel.ts`',
      '`lib/server/exportAuditReviewerReadModel.test.ts`',
      '`lib/server/exportAuditReviewerReadModelFixtures.test.ts` only if fixture separation is needed',
      '`docs/VINEA_BUILD_STATUS.md`',
      '`docs/TRUST_CENTER_READINESS_PACKET_20260627.md`',
      '`app/api/export-audit-reviewer/*`',
      '`app/dashboard/*export*`',
      'any staff-facing dashboard UI',
      'any production monitoring route',
      'any migration under `supabase/migrations`',
      'any storage or file access helper',
      'any Google Calendar code',
      'any export route mutation',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines read-only inputs, outputs, saved-filter expectations, and suspicious-pattern tests', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'safe audit-event records',
      '`safe_metadata_only: true`',
      '`metadata_completeness_status`',
      '`review_status`',
      '`severity`',
      '`rollback_required`',
      '`incident_response_required`',
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
      'downloaded event outside an approved window',
      'downloaded event after rollback',
      'downloaded event while flags are expected off',
      'cross-parish delivery',
      'family or unauthenticated delivery',
      'document-manifest sensitive-material marker',
      'route/preset mismatch',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires forbidden data checks and explicit output allowlists', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'raw CSV rows',
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
      'explicit output allowlists rather than copying metadata objects wholesale',
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

  it('defines rollback/no-op behavior and the post-implementation NO-GO boundary', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Rollback for this implementation is code-level only:',
      'remove or stop calling the read-model builder',
      'leave export routes unchanged',
      'leave audit events unchanged',
      'leave production flags off',
      'leave staff-facing UI absent',
      'rollback must not require database cleanup or migration rollback',
      'production exports remain `NO-GO`',
      'staff-facing export UI remains `NO-GO`',
      'production export monitoring remains `NO-GO`',
      'production runtime export flags remain `NO-GO`',
      'dashboard reviewer UI remains `NO-GO`',
      'route/API exposure remains `NO-GO`',
      '`SERVER-ONLY READ-MODEL BUILDER IMPLEMENTED AND TESTED; NO RUNTIME REVIEWER SURFACE; PRODUCTION EXPORTS REMAIN NO-GO`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('includes exact approval language and required checks', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      '`I approve non-production implementation of the server-only export audit reviewer read-model builder.',
      'Implement only lib/server/exportAuditReviewerReadModel.ts and focused tests',
      'Do not add dashboard UI, API routes, production monitoring, production export flags, migrations, operational RLS changes, Google Calendar changes, record mutations, storage access, signed URLs, raw exports, or secrets.',
      'Keep production exports NO-GO after implementation.`',
      'focused read-model tests',
      'trust-center linkage tests',
      'forbidden-data serialization tests',
      '`npm.cmd run lint`',
      '`npm.cmd run build`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('is linked from the trust-center readiness packet without implying implementation approval', () => {
    const trustCenter = readFileSync(trustCenterPath, 'utf8')

    for (const expected of [
      'Export audit reviewer read-model implementation approval packet: `docs/EXPORT_AUDIT_REVIEWER_READ_MODEL_IMPLEMENTATION_APPROVAL_PACKET_20260701.md`',
      'The export audit reviewer read-model implementation approval packet defines the exact future builder files, read-only safety rules, saved-filter expectations, forbidden-data tests, rollback/no-op behavior, and post-implementation `NO-GO` boundary.',
      'It does not implement the builder or approve dashboard UI, API routes, production monitoring, production flags, migrations, operational RLS changes, or production exports.',
      'Do not claim production runtime export controls',
    ]) {
      expect(trustCenter).toContain(expected)
    }
  })
})
