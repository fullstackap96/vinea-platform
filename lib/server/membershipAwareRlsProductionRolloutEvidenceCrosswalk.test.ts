import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const crosswalkPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_CROSSWALK_20260629.md'
)

describe('membership-aware RLS production rollout evidence crosswalk', () => {
  it('is explicitly planning-only and keeps production untouched', () => {
    const crosswalk = readFileSync(crosswalkPath, 'utf8')

    for (const expected of [
      'Status: Crosswalk prepared only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'This document does not approve production work.',
      'Current decision: `CROSSWALK_READY_PRODUCTION_NOT_APPROVED`',
    ]) {
      expect(crosswalk).toContain(expected)
    }
  })

  it('links the rollout template, fixture checklist, approval, and readiness docs', () => {
    const crosswalk = readFileSync(crosswalkPath, 'utf8')

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_VERIFICATION_CHECKLIST_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_PROMPT_TEMPLATE_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md',
    ]) {
      expect(crosswalk).toContain(expected)
    }
  })

  it('maps every rollout evidence template section to checklist or readiness sources', () => {
    const crosswalk = readFileSync(crosswalkPath, 'utf8')

    for (const expected of [
      '| Rollout Identity |',
      '| Completed Smoke-Test Data Checklist |',
      '| Named Sign-Offs |',
      '| Automated Checks |',
      '| Pre-Apply Health |',
      '| Forward Migration Output |',
      '| Post-Apply Health |',
      '| Policy Shape Verification |',
      '| Active-Parish-Cookie Request And Document Smoke |',
      '| Family Portal Safety Smoke |',
      '| Monitoring Observations |',
      '| Cleanup And Deactivation |',
      '| Rollback Decision |',
      '| Final Outcome |',
      'Smoke fixture verification checklist `Fixture-To-Evidence Map`',
      'Smoke fixture verification checklist `/api/health before apply` row',
      'Smoke fixture verification checklist `Request detail`, `Request documents`, and `Direct storage privacy` rows',
      'Smoke fixture verification checklist `Family portal` and `Family portal exclusions` rows',
    ]) {
      expect(crosswalk).toContain(expected)
    }
  })

  it('pre-fills only safe owner, scope, fixture, and cleanup labels', () => {
    const crosswalk = readFileSync(crosswalkPath, 'utf8')

    for (const expected of [
      'Alex Perez - Evidence Owner',
      'Alex Perez - Rollback Owner - available during rollout window',
      'Alex Perez - Local Codex session and Vercel/Supabase dashboards',
      'Vinea Production RLS Evidence Folder - restricted',
      'Confirm unchanged during rollout; public intake runtime routing is out of scope',
      'Production RLS Smoke Staff Account - no password recorded',
      'Production RLS Smoke Parish A',
      'Production RLS Denial Parish B',
      'Production RLS Smoke Request A - non-sensitive',
      'Production RLS Denied Request B - generic denial expected',
      'Production RLS Smoke Workflow Step - document safe',
      'Vinea production RLS smoke test staff document - synthetic file only',
      'Vinea production RLS smoke test family document - synthetic file only',
      'Create during smoke window; do not record raw token; deactivate immediately after smoke',
      'Delete synthetic docs, deactivate token, restore request status if changed',
    ]) {
      expect(crosswalk).toContain(expected)
    }
  })

  it('defines future evidence labels and hard stops for production approval boundaries', () => {
    const crosswalk = readFileSync(crosswalkPath, 'utf8')

    for (const expected of [
      'pre_apply_health_result',
      'forward_migration_sanitized_output',
      'post_apply_health_result',
      'policy_shape_sanitized_output',
      'same_parish_request_detail_result',
      'cross_parish_request_denial_result',
      'same_parish_document_route_result',
      'cross_parish_document_denial_result',
      'direct_storage_privacy_result',
      'family_portal_clean_session_result',
      'family_portal_exclusion_result',
      'audit_event_name_timestamp_result',
      'monitoring_30_minute_result',
      'cleanup_redaction_result',
      'rollback_decision_result',
      'final_outcome_result',
      'The explicit production approval phrase is missing.',
      'The final go/no-go checklist is not `GO`.',
      'Any raw secret, private parish data, raw token material, signed document URL, private document content, internal note, AI output, or private audit payload appears in evidence.',
    ]) {
      expect(crosswalk).toContain(expected)
    }
  })

  it('does not include real secrets, raw tokens, signed URLs, or known QA fixture ids', () => {
    const crosswalk = readFileSync(crosswalkPath, 'utf8')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'X-Amz-Signature',
      'token=',
      'token_hash:',
      'signedUrl',
      'calendarId=',
      'eventId=',
      'service_role:',
      'Bearer ',
      'sk-',
      '735840c9-a276-4b3d-9773-7b350c9fc35c',
      'f4a50f8b-4039-46d7-902f-a40719a12718',
    ]) {
      expect(crosswalk).not.toContain(forbidden)
    }
  })
})
