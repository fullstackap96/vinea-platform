import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const templatePath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_PROMPT_TEMPLATE_20260629.md'
)

describe('membership-aware RLS production final approval prompt template', () => {
  it('is explicitly a template and does not approve or execute production work', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'Status: Final approval prompt template prepared only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current decision: `TEMPLATE_READY_APPROVAL_NOT_GIVEN`',
      'This document does not approve production work.',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('links the filled intake checklist, validation gate, and rollout evidence docs', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_VALIDATION_GATE_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('requires safe production target placeholders and current rollout values', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      '<PRODUCTION_APP_HOST>',
      '<PRODUCTION_DATABASE_HOST>',
      '<PRODUCTION_RELEASE_LABEL>',
      '<PRODUCTION_ROLLOUT_WINDOW>',
      '<ROLLBACK_DECISION_DEADLINE>',
      '<ROLLBACK_OWNER>',
      '<MONITORING_OWNER_AND_CHANNEL>',
      '<EVIDENCE_STORAGE_LOCATION>',
      '2026-07-01 8:00-8:30 PM Central',
      '2026-07-01 8:20 PM Central',
      'Alex Perez - Rollback Owner - available during rollout window',
      'Local Codex session and Vercel/Supabase dashboards',
      'Vinea Production RLS Evidence Folder - restricted',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('contains the exact future approval phrase and final readiness decision', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT',
      'I explicitly approve the production membership-aware operational RLS rollout for Vinea.',
      'Final readiness decision: GO',
      'GO_READY_FOR_PRODUCT_OWNER_APPROVAL',
      'Do not paste this prompt until the product owner is intentionally approving production work.',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('keeps public intake, AI, Google Calendar, cleanup, and unrelated deployment scopes excluded', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'Runtime public intake routing.',
      'Public intake runtime routing production flags.',
      'AI production flag enablement.',
      'Google Calendar data mutation.',
      'Staff membership data cleanup.',
      'Operational table schema redesign.',
      'Production data cleanup.',
      'Pricing, billing, marketing, or customer communication changes.',
      'Any unrelated deployment or feature rollout.',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('documents post-approval operator guardrails and hard stops', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'Re-read `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`.',
      'Run automated checks on the production-intended commit.',
      'Capture pre-apply `/api/health`.',
      'Apply only `supabase/migrations/20260626170000_membership_aware_operational_rls.sql`.',
      'Run the documented post-apply smoke checks.',
      'Do not proceed from approval template to production execution if any of these are true:',
      '`<PRODUCTION_APP_HOST>` is missing or is not HTTPS.',
      '`<PRODUCTION_DATABASE_HOST>` is missing or includes a connection string.',
      'Any secret, password, token, signed URL, private document content, private parish data, raw family portal token, token hash, service-role key, or database URL appears in the approval prompt.',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('does not contain real credential values or private production target details', () => {
    const template = readFileSync(templatePath, 'utf8')

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
      'token_hash',
      'signedUrl',
      'calendarId=',
      'eventId=',
      'service_role:',
      'Bearer ',
      'sk-',
      '735840c9-a276-4b3d-9773-7b350c9fc35c',
      'f4a50f8b-4039-46d7-902f-a40719a12718',
    ]) {
      expect(template).not.toContain(forbidden)
    }
  })
})
