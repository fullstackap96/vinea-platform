import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const templatePath = join(
  process.cwd(),
  'docs',
  'EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE_EVIDENCE_TEMPLATE_20260701.md'
)

describe('export audit reviewer dashboard production smoke evidence template', () => {
  it('is template-only and preserves production no-go boundaries', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'Status: Evidence template prepared only.',
      'Production was not accessed',
      'production dashboard exposure was not enabled',
      'production flags were not enabled',
      'production navigation was not added',
      'production smoke was not run',
      'migrations were not applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'storage was not accessed',
      'signed URLs were not created',
      'raw exports were not exposed',
      'raw metadata was not exposed',
      'no secrets were exposed',
      'Current decision state: `PRODUCTION EXPORT AUDIT REVIEWER DASHBOARD SMOKE NOT EXECUTED; PRODUCTION DASHBOARD EXPOSURE REMAINS NO-GO; PRODUCTION EXPORTS REMAIN NO-GO`',
      'Completion marker: `EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE_EVIDENCE_TEMPLATE_20260701`',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('links the readiness, intake, gate, preflight, QA, and trust-center references', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_READINESS_APPROVAL_PACKET_20260701.md',
      'docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260701.md',
      'docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_GATE_IMPLEMENTATION_APPROVAL_PACKET_20260701.md',
      'lib/server/exportAuditReviewerDashboardProductionGatePreflight.ts',
      'docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PROTOTYPE_QA_EVIDENCE_20260701.md',
      'docs/EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260701_COMPLETED.md',
      'docs/TRUST_CENTER_READINESS_PACKET_20260627.md',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('records that the production dashboard gate is not implemented or enabled', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'Current production dashboard gate status: `PRODUCTION EXPORT AUDIT REVIEWER DASHBOARD GATE CODE IS NOT IMPLEMENTED`',
      'Product-owner approval to implement the production-specific dashboard/API gate.',
      'Passing source-level preflight for the future gate implementation.',
      'Production-specific dashboard/API flags that are disabled by default.',
      'Separate product-owner approval to enable production smoke flags for the approved window.',
      'Do not treat this template as approval to implement or enable that gate.',
      'PENDING_NOT_APPROVED_GATE_CODE_NOT_IMPLEMENTED',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('covers all requested production smoke evidence areas', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'Rollout Identity',
      'Pre-Smoke Approval Record',
      'Production-Safe Fixture Checklist',
      'Pre-Smoke Health And Flag-Off Baseline',
      'Future Gate Flag Matrix',
      'Flag-On Smoke Checks',
      'Downloaded filter row',
      'Denied filter row',
      'Empty filter row',
      'Cross-parish denial',
      'Unauthenticated denial',
      'Family-facing denial',
      'Forbidden data exclusions',
      'Forbidden control exclusions',
      'Audit And Reviewer Evidence',
      'Monitoring Evidence',
      'Rollback Evidence',
      'Cleanup And Deactivation',
      'Final Sign-Off',
      'Sanitized Evidence JSON Template',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('keeps the reviewer dashboard read-only and forbids export, file, storage, and raw-data surfaces', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'This template does not approve production flags, production dashboard exposure, production navigation, production exports',
      'raw audit metadata exposure',
      'raw export exposure',
      'Dashboard stays read-only and API/read-model backed.',
      'Dashboard renders no export, download, file-open, storage, signed URL, approve, reject, delete, merge, or mutation controls',
      'Smoke behavior does not call storage APIs, create signed URLs, open files, or deliver exports',
      'Reviewer evidence proves the dashboard can inspect downloaded and denied export audit events without becoming a second export surface.',
      'Evidence screenshots and notes contain only safe read-model labels, counts, statuses, and redacted observations.',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('uses pending placeholders instead of fake evidence or secret material', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'PENDING_EXACT_PUBLIC_URL',
      'PENDING_EXACT_DATE_TIME_TIMEZONE',
      'PENDING_GO_OR_NO_GO',
      'PENDING_REDACTED_COUNT_ONLY',
      'SMOKE_NOT_RUN_NO_APPROVAL',
      'SMOKE_BLOCKED_BY_MISSING_PRODUCTION_GATE',
      'PENDING_ROLLBACK_OR_CONTINUED_NO_GO',
    ]) {
      expect(template).toContain(expected)
    }

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
      '00000000-0000-4000-8000-000000000001',
    ]) {
      expect(template).not.toContain(forbidden)
    }
  })
})
