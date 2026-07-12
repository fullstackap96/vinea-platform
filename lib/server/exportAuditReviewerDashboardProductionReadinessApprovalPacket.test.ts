import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_READINESS_APPROVAL_PACKET_20260701.md'
)

describe('export audit reviewer dashboard production readiness approval packet', () => {
  it('keeps production disabled and records the exact no-go boundary', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Completion marker: `EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_READINESS_APPROVAL_PACKET_20260701`',
      'Current decision state: `PRODUCTION EXPORT AUDIT REVIEWER DASHBOARD NOT APPROVED; PRODUCTION EXPORTS REMAIN NO-GO`',
      'Production was not accessed',
      'production flags were not enabled',
      'production navigation was not added',
      'migrations were not applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'storage was not accessed',
      'signed URLs were not created',
      'raw exports were not exposed',
      'no secrets were exposed',
      'This packet does not implement the production gate.',
      'Current UI decision: `NO PRODUCTION NAVIGATION APPROVED`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires evidence, owners, fixtures, monitoring, support, and rollback labels', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Export audit reviewer dashboard live browser QA evidence: `docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PROTOTYPE_QA_EVIDENCE_20260701.md`',
      'Production app URL label.',
      'Rollback owner label.',
      'Monitoring owner label.',
      'Monitoring channel label.',
      'Support owner label.',
      'Security/data owner sign-off label.',
      'Parish operations owner sign-off label.',
      'Evidence storage owner label.',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_SAFE_STAFF`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_PARISH_A`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_DOWNLOADED_EVENT`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_DENIED_EVENT`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_CROSS_PARISH_DENIAL_METHOD`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_FAMILY_OR_UNAUTH_DENIAL_METHOD`',
      '`EXPORT_AUDIT_REVIEWER_DASHBOARD_MONITORING_OWNER`',
      '`EXPORT_AUDIT_REVIEWER_DASHBOARD_MONITORING_CHANNEL`',
      '`EXPORT_AUDIT_REVIEWER_DASHBOARD_SUPPORT_OWNER`',
      '`EXPORT_AUDIT_REVIEWER_DASHBOARD_ROLLBACK_OWNER`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines production gate, smoke, forbidden-data, and rollback requirements', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Require a production acknowledgement value distinct from the QA acknowledgement.',
      'Require a route/surface allowlist containing `export_audit_reviewer_dashboard`.',
      'Require an approval id label.',
      'Require an expiration timestamp inside the approved rollout window.',
      'Keep `/api/export-audit-reviewer` staff-authenticated and membership-scoped.',
      'No export/download controls render.',
      'No file-open, document-open, storage, signed URL, raw metadata, raw export, token, AI, notes, communications, sacramental/canonical, delete, approve, reject, or merge controls render.',
      'Rollback by disabling flags returns the dashboard to unavailable behavior.',
      'raw audit metadata',
      'storage paths',
      'signed URLs',
      'original filenames',
      'token material',
      'raw export contents',
      'notes',
      'communications',
      'AI payloads',
      'sacramental/canonical details',
      'Dashboard route returns the generic unavailable state.',
      'No new export delivery events were created by the reviewer dashboard.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('includes exact future approval language while preserving the later production-smoke gate', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Approve production smoke preparation for the export audit reviewer dashboard only.',
      'Implement the production-specific reviewer dashboard gate behind disabled-by-default flags',
      'requiring route/surface allowlist, approval id, expiration, rollback owner, monitoring channel, and support owner labels',
      'keeping production navigation disabled',
      'Do not enable production flags, add production navigation, enable production exports, apply migrations, change operational RLS, touch Google Calendar data, mutate records, access storage, create signed URLs, expose raw exports, expose raw metadata, or expose secrets.',
      'After implementation, production dashboard exposure remains NO-GO until I separately approve the exact production smoke rollout window.',
      'Separate approval is still required later to enable production smoke flags during the approved rollout window.',
    ]) {
      expect(packet).toContain(expected)
    }
  })
})
