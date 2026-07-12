import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const captureFormPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_FIXTURE_CAPTURE_FORM_20260629.md'
)

describe('membership-aware RLS production owner and fixture capture form', () => {
  it('is explicitly non-executing and keeps production RLS at NO-GO', () => {
    const form = readFileSync(captureFormPath, 'utf8')

    for (const expected of [
      'Status: Capture form prepared only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'Current decision: `NO-GO`',
      'Current decision: `NO_GO_MISSING_OWNER`',
    ]) {
      expect(form).toContain(expected)
    }
  })

  it('links the existing production readiness source documents', () => {
    const form = readFileSync(captureFormPath, 'utf8')

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_SIGNOFF_CAPTURE_PACKET_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_WORKSHEET_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SUPPORT_COMMUNICATION_NOTE_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_BLOCKER_REGISTER_20260628.md',
    ]) {
      expect(form).toContain(expected)
    }
  })

  it('requires every production owner role needed for the approval gate', () => {
    const form = readFileSync(captureFormPath, 'utf8')

    for (const expected of [
      '| Product owner |',
      '| Technical owner |',
      '| QA owner |',
      '| Security/data owner |',
      '| Rollback owner |',
      '| Monitoring owner |',
      '| Support owner |',
      '| Evidence storage owner |',
    ]) {
      expect(form).toContain(expected)
    }
  })

  it('requires the production-safe smoke fixtures and cleanup details', () => {
    const form = readFileSync(captureFormPath, 'utf8')

    for (const expected of [
      'Staff account email or safe identifier',
      'Staff account has membership in active parish',
      'Active parish display name',
      'Cross-parish denial parish or substitute',
      'Same-parish request safe label',
      'Cross-parish denied request safe label',
      'Workflow step safe label',
      'Staff-facing test document content label',
      'Family-facing test document content label',
      'Family portal token creation plan',
      'Family portal token deactivation plan',
      'Evidence redaction plan',
      'Cleanup/deactivation plan is recorded',
    ]) {
      expect(form).toContain(expected)
    }
  })

  it('forbids secrets, private data, and unrelated integration data', () => {
    const form = readFileSync(captureFormPath, 'utf8')

    for (const expected of [
      'Passwords.',
      'Database URLs or connection strings.',
      'Supabase service-role keys or anon keys.',
      'OAuth client secrets, access tokens, refresh tokens, or authorization codes.',
      'OpenAI API keys.',
      'Raw family portal tokens or token hashes.',
      'Signed document URLs.',
      'Private document contents.',
      'Internal note bodies.',
      'AI prompts, AI raw outputs, or AI private audit payloads.',
      'Google Calendar event ids, calendar ids, or real parish calendar data',
    ]) {
      expect(form).toContain(expected)
    }
  })

  it('does not contain credential-like values or connection strings', () => {
    const form = readFileSync(captureFormPath, 'utf8')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'X-Amz-Signature',
    ]) {
      expect(form).not.toContain(forbidden)
    }
  })
})
