import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const drillPlanPath = join(process.cwd(), 'docs', 'EXPORT_AUDIT_REVIEW_NONPRODUCTION_DRILL_PLAN_20260630.md')
const trustCenterPath = join(process.cwd(), 'docs', 'TRUST_CENTER_READINESS_PACKET_20260627.md')

describe('export audit review non-production drill plan', () => {
  it('is plan-only and keeps production exports blocked', () => {
    const plan = readFileSync(drillPlanPath, 'utf8')

    for (const expected of [
      'Status: Drill plan prepared only.',
      'Production was not accessed',
      'production export flags were not enabled',
      'no staff-facing production UI was added',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current decision state: `EXPORT AUDIT REVIEW NON-PRODUCTION DRILL PLAN PREPARED; DRILL NOT EXECUTED; PRODUCTION EXPORTS REMAIN NO-GO`',
      'Completion marker: `EXPORT_AUDIT_REVIEW_NONPRODUCTION_DRILL_PLAN_20260630`',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('links the runbook and evidence template for rehearsal', () => {
    const plan = readFileSync(drillPlanPath, 'utf8')

    for (const expected of [
      'This plan rehearses `docs/EXPORT_AUDIT_REVIEW_RUNBOOK_20260630.md` using `docs/EXPORT_AUDIT_REVIEW_EVIDENCE_TEMPLATE_20260630.md`.',
      'The export audit runbook and evidence template define how Vinea should review export activity.',
      'The reviewer has `docs/EXPORT_AUDIT_REVIEW_RUNBOOK_20260630.md` open.',
      'The reviewer has a blank copy of `docs/EXPORT_AUDIT_REVIEW_EVIDENCE_TEMPLATE_20260630.md`.',
      'Use `docs/EXPORT_AUDIT_REVIEW_EVIDENCE_TEMPLATE_20260630.md` and capture only:',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('covers allowed non-production route scenarios and explicit exclusions', () => {
    const plan = readFileSync(drillPlanPath, 'utf8')

    for (const expected of [
      '`request_list_basic` same-parish success.',
      '`request_list_basic` cross-parish denial.',
      '`request_list_basic` blocked-field denial.',
      '`request_list_basic` family portal or unauthenticated denial.',
      '`request_document_manifest` same-parish manifest success.',
      '`request_document_manifest` cross-parish denial.',
      '`request_document_manifest` blocked-field denial.',
      '`request_document_manifest` family portal or unauthenticated denial.',
      'Flag-off baseline and rollback verification for both approved pilot routes.',
      'Production access.',
      'Production export flags.',
      'Staff-facing production export UI.',
      'New export route wiring.',
      'Operational RLS changes.',
      'Document file delivery.',
      'Bulk document export.',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('defines execution steps, pass criteria, failure stops, and rollback rehearsal', () => {
    const plan = readFileSync(drillPlanPath, 'utf8')

    for (const expected of [
      'Confirm the non-production flag-off baseline returns unavailable or denied behavior for each pilot route.',
      'Review audit events using the runbook checklist.',
      'Confirm no new `*.downloaded` audit events appear after rollback.',
      'Flag-off baseline is unavailable or denied.',
      'Cross-parish attempts are denied before delivery.',
      'Blocked-field attempts are denied before query or delivery.',
      'Family portal or unauthenticated attempts are denied before delivery.',
      'Rollback by disabling non-production flags is verified.',
      'Stop the drill, disable non-production export flags, and record a blocked evidence result if any of these happen:',
      'A cross-parish request appears in a same-parish export.',
      'Rollback does not stop delivery.',
      'Rollback for this drill means disabling the non-production export runtime flags',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('forbids secret, token, file, signed-url, AI, and canonical material in evidence', () => {
    const plan = readFileSync(drillPlanPath, 'utf8')

    for (const expected of [
      'raw exports',
      'document contents',
      'signed URLs',
      'storage paths',
      'original filenames',
      'family portal tokens',
      'notes',
      'communications',
      'AI material',
      'sacramental/canonical details',
      'database URLs',
      'service-role keys',
      'passwords',
      'OpenAI keys',
      'Google OAuth tokens',
    ]) {
      expect(plan).toContain(expected)
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
      expect(plan).not.toContain(forbidden)
    }
  })

  it('is linked from the trust-center readiness packet without implying production readiness', () => {
    const trustCenter = readFileSync(trustCenterPath, 'utf8')

    for (const expected of [
      'Export audit review non-production drill plan: `docs/EXPORT_AUDIT_REVIEW_NONPRODUCTION_DRILL_PLAN_20260630.md`',
      'The export audit review non-production drill plan turns the runbook and evidence template into a rehearsal process for approved non-production targets',
      'These export audit review documents do not enable production exports, add runtime monitoring, or approve staff-facing export UI.',
      'Do not claim production runtime export controls',
    ]) {
      expect(trustCenter).toContain(expected)
    }
  })
})
