import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const templatePath = join(
  process.cwd(),
  'docs',
  'REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_EVIDENCE_TEMPLATE_20260630.md'
)

describe('request_document_manifest export production smoke evidence template', () => {
  it('is template-only and keeps production export execution blocked', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'Status: Evidence template prepared only.',
      'Production was not accessed',
      'production flags were not enabled',
      'no staff-facing production UI was added',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current decision state: `PRODUCTION REQUEST_DOCUMENT_MANIFEST EXPORT SMOKE NOT EXECUTED; PRODUCTION EXPORTS REMAIN NO-GO`',
      'Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_EVIDENCE_TEMPLATE_20260630`',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('links the approval, readiness, non-production evidence, policy, and trust-center docs', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md',
      'docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md',
      'docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_20260630.md',
      'docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630.md',
      'docs/DATA_EXPORT_ACCESS_CONTROL_POLICY_PROPOSAL_20260630.md',
      'docs/TRUST_CENTER_READINESS_PACKET_20260627.md',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('records that the current runtime gate is still non-production only and production-blocked', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'Current export runtime gate status: `PRODUCTION RUNTIME EXPORT GATE IS STILL PRODUCTION-BLOCKED`',
      '`VINEA_EXPORT_RUNTIME=ENABLED`',
      '`VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`',
      '`VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`',
      'The current gate blocks production environments.',
      'Do not treat this template as approval to change that gate.',
      'PENDING_NOT_APPROVED_CURRENT_GATE_IS_PRODUCTION_BLOCKED',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('covers all required smoke evidence areas', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'Rollout Identity',
      'Pre-Smoke Approval Record',
      'Production-Safe Fixture Checklist',
      'Pre-Smoke Health And Flag-Off Baseline',
      'Flag State Matrix',
      'Flag-On Smoke Checks',
      'Same-parish manifest success',
      'Cross-parish denial',
      'Blocked signed URL field',
      'Blocked storage path field',
      'Blocked original filename field',
      'Blocked portal token field',
      'Family/unauthenticated denial',
      'Audit Evidence',
      'Monitoring Evidence',
      'Rollback Evidence',
      'Cleanup And Deactivation',
      'Final Sign-Off',
      'Sanitized Evidence JSON Template',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('preserves manifest-only export boundaries and forbidden data classes', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'This template does not approve production runtime flags',
      'signed URL delivery',
      'storage path exposure',
      'original filename export',
      'document file delivery',
      'bulk document export',
      'No signed URL/storage/file API usage',
      'No signed URLs, storage paths, original filenames, document files, tokens, notes, communications, AI material, or sacramental/canonical details are exposed.',
      'Audit evidence does not become a second export of sensitive data.',
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
      'PENDING_GO_OR_NO_GO',
      'PENDING_REDACTED_COUNT_ONLY',
      'SMOKE_NOT_RUN_NO_APPROVAL',
      'SMOKE_BLOCKED_BY_PRODUCTION_GATE',
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
