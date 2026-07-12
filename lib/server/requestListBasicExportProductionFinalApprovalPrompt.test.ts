import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const promptPath = join(
  process.cwd(),
  'docs',
  'REQUEST_LIST_BASIC_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_20260630.md'
)

describe('request_list_basic export production final approval prompt template', () => {
  it('is template-only and preserves production safety boundaries', () => {
    const prompt = readFileSync(promptPath, 'utf8')

    for (const expected of [
      'Status: Final approval prompt template prepared only.',
      'Production was not accessed',
      'production flags were not enabled',
      'no staff-facing production UI was added',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current decision state: `PRODUCTION REQUEST_LIST_BASIC EXPORT SMOKE NOT APPROVED BY THIS TEMPLATE`',
      'Completion marker: `REQUEST_LIST_BASIC_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_20260630`',
    ]) {
      expect(prompt).toContain(expected)
    }
  })

  it('links the worksheet and readiness packet used to validate the prompt', () => {
    const prompt = readFileSync(promptPath, 'utf8')

    for (const expected of [
      'docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md',
      'docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md',
      'This template does not approve production export runtime flags',
    ]) {
      expect(prompt).toContain(expected)
    }
  })

  it('contains the final prompt with confirmed labels and approved public-url/window values', () => {
    const prompt = readFileSync(promptPath, 'utf8')

    for (const expected of [
      'PRODUCTION_APP_URL=https://vineaplatform.com',
      'REQUEST_LIST_BASIC_EXPORT_PRODUCTION_ROLLOUT_WINDOW=July 2, 2026, 8:00-8:30 PM Central',
      'PRODUCTION_SUPABASE_PROJECT_LABEL=Vinea production Supabase project',
      'PRODUCTION_DEPLOYMENT_LABEL=Current production Vercel deployment',
      'PRODUCTION_EXPORT_SAFE_STAFF=Designated production smoke staff account for Parish A',
      'PRODUCTION_EXPORT_PARISH_A=Designated production smoke parish - Parish A',
      'PRODUCTION_EXPORT_SAME_PARISH_REQUEST=Safe same-parish join parish request for request_list_basic export smoke',
      'PRODUCTION_EXPORT_CROSS_PARISH_DENIED_REQUEST=Route-level cross-parish denial substitute using unauthorized active parish scope',
      'PRODUCTION_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD=Signed-out browser export route check',
      'PRODUCTION_EXPORT_BLOCKED_FIELD_ATTEMPT=request_reference plus access_token/internal_notes blocked-field attempt',
      'PRODUCTION_EXPORT_AUDIT_INSPECTION_METHOD=Staff Audit Log page filtered to export.request_list_basic.downloaded',
      'REQUEST_LIST_BASIC_EXPORT_MONITORING_OWNER=Vinea product owner',
      'REQUEST_LIST_BASIC_EXPORT_MONITORING_CHANNEL=Owner-managed rollout notes channel',
      'REQUEST_LIST_BASIC_EXPORT_SUPPORT_OWNER=Vinea product owner',
      'REQUEST_LIST_BASIC_EXPORT_ROLLBACK_OWNER=Vinea engineering owner',
      'REQUEST_LIST_BASIC_EXPORT_ROLLBACK_DECISION_DEADLINE=Within 30 minutes after the approved production smoke window ends',
    ]) {
      expect(prompt).toContain(expected)
    }
  })

  it('keeps production smoke blocked until the exact future approval prompt is provided', () => {
    const prompt = readFileSync(promptPath, 'utf8')

    for (const expected of [
      'Do not use this prompt unless you are intentionally approving the narrow production smoke.',
      'Current validation result: `READY_FOR_SEPARATE_PRODUCT_OWNER_APPROVAL_PROMPT`',
      'This document still does not approve the production smoke by itself.',
      'Production exports remain `NO-GO` until the exact approval prompt above is intentionally submitted as a separate product-owner instruction.',
      'The production app URL differs from `https://vineaplatform.com` without product-owner confirmation.',
      'The rollout window differs from `July 2, 2026, 8:00-8:30 PM Central` without product-owner confirmation.',
      'The intended smoke requires a migration.',
      'The intended smoke requires an operational RLS change.',
      'The intended smoke requires Google Calendar behavior.',
      'The intended smoke adds or exposes staff-facing production export UI.',
      'The intended smoke expands beyond `request_list_basic`.',
    ]) {
      expect(prompt).toContain(expected)
    }
  })

  it('does not include obvious credential, connection-string, token, raw ID, or fixture material', () => {
    const prompt = readFileSync(promptPath, 'utf8')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'PRODUCTION_APP_URL=<exact public production URL>',
      'REQUEST_LIST_BASIC_EXPORT_PRODUCTION_ROLLOUT_WINDOW=<exact low-traffic rollout window>',
      '<exact public production URL>',
      '<exact low-traffic rollout window>',
      'sb-',
      'eyJ',
      '00000000-0000-4000-8000-000000000000',
    ]) {
      expect(prompt).not.toContain(forbidden)
    }
  })
})
