import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const planPath = join(
  process.cwd(),
  'docs',
  'EXPORT_AUDIT_REVIEWER_READ_MODEL_PLAN_20260701.md',
)
const trustCenterPath = join(process.cwd(), 'docs', 'TRUST_CENTER_READINESS_PACKET_20260627.md')

describe('export audit reviewer read-model plan', () => {
  it('is planning-only and keeps production exports blocked', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const expected of [
      'Status: Plan prepared only.',
      'Production was not accessed',
      'production export flags were not enabled',
      'staff-facing production export UI was not added',
      'migrations were not applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current decision state: `EXPORT AUDIT REVIEWER READ MODEL PLANNED; PRODUCTION EXPORTS REMAIN NO-GO`',
      'Completion marker: `EXPORT_AUDIT_REVIEWER_READ_MODEL_PLAN_20260701`',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('defines source events and required reviewer columns for downloaded and denied exports', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const expected of [
      '`export.request_list_basic.downloaded`',
      '`export.request_list_basic.denied`',
      '`export.request_document_manifest.downloaded`',
      '`export.request_document_manifest.denied`',
      '`metadata_incomplete`',
      '`audit_event_id`',
      '`created_at`',
      '`event_action`',
      '`export_route_id`',
      '`export_preset_id`',
      '`decision`',
      '`http_status`',
      '`denied_reason_code`',
      '`staff_user_id_label`',
      '`active_parish_id_label`',
      '`membership_scope_status`',
      '`request_ownership_status`',
      '`requested_fields_count`',
      '`blocked_fields_requested_count`',
      '`disallowed_fields_count`',
      '`row_count_bucket`',
      '`safe_metadata_only`',
      '`review_status`',
      '`severity`',
      '`evidence_reference`',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('defines saved filters and suspicious pattern rules for reviewer workflow', () => {
    const plan = readFileSync(planPath, 'utf8')

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
      '`downloaded_outside_approval_window`',
      '`downloaded_after_rollback`',
      '`downloaded_while_flags_off`',
      '`cross_parish_delivery`',
      '`family_or_unauthenticated_delivery`',
      '`document_manifest_sensitive_material`',
      '`repeated_denied_attempts`',
      '`blocked_field_attempt`',
      '`active_parish_scope_denied`',
      '`route_preset_mismatch`',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('requires a safe reviewer workflow and future implementation gates', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const expected of [
      'Confirm the review window, environment, and flag state from the relevant evidence packet.',
      'Open `exports_downloaded_recent` and verify every downloaded event matches the approved route, staff, active parish, and fixture/window.',
      'Open `exports_denied_recent` and verify denied events are generic, safe, and did not deliver data.',
      'Record evidence using `docs/EXPORT_AUDIT_REVIEW_EVIDENCE_TEMPLATE_20260630.md`.',
      'Escalate severity 1 or repeated severity 2 patterns using `docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md`.',
      'Add a server-only read-model builder that converts safe `audit_events` metadata into the columns listed above.',
      'Add source-level tests proving forbidden columns and forbidden markers cannot appear.',
      'Add a staff-only non-production reviewer route behind an explicit non-production gate.',
      'Prepare a production-readiness packet before any production reviewer UI or export runtime gate is enabled.',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('forbids sensitive export, document, token, AI, and canonical material', () => {
    const plan = readFileSync(planPath, 'utf8')

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
      'database URLs',
      'service-role keys',
      'API keys',
      'notes',
      'communications',
      'AI prompts',
      'AI outputs',
      'sacramental/canonical detail',
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
      '00000000-0000-4000-8000-000000000000',
    ]) {
      expect(plan).not.toContain(forbidden)
    }
  })

  it('is linked from the trust-center readiness packet without implying runtime readiness', () => {
    const trustCenter = readFileSync(trustCenterPath, 'utf8')

    for (const expected of [
      'Export audit reviewer read-model plan: `docs/EXPORT_AUDIT_REVIEWER_READ_MODEL_PLAN_20260701.md`',
      'The export audit reviewer read-model plan defines the future safe reviewer columns, saved filters, suspicious-pattern rules, and reviewer workflow',
      'The read-model plan does not add a reviewer route, dashboard UI, runtime monitoring, production export flags, migrations, or staff-facing production UI.',
      'Do not claim production runtime export controls',
    ]) {
      expect(trustCenter).toContain(expected)
    }
  })
})
