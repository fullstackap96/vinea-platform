import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'REQUEST_LIST_BASIC_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_PLACEHOLDER_BLOCKED_20260630.md'
)

describe('request_list_basic export production final approval prompt blocked evidence', () => {
  it('records a safe blocked state without production side effects', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Blocked safely before completing the final approval prompt.',
      'Production was not accessed',
      'production flags were not enabled',
      'no staff-facing production UI was added',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current decision state: `PRODUCTION REQUEST_LIST_BASIC EXPORT SMOKE STILL NOT APPROVED`',
      'Completion marker: `REQUEST_LIST_BASIC_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_PLACEHOLDER_BLOCKED_20260630`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('explains that placeholder values were provided instead of exact production values', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'The requested replacement values were still placeholders:',
      '`PRODUCTION_APP_URL=<my exact public production URL>`',
      '`REQUEST_LIST_BASIC_EXPORT_PRODUCTION_ROLLOUT_WINDOW=<my exact low-traffic rollout window>`',
      'A later retry also described the values as real non-secret values, but still supplied placeholder text:',
      '`PRODUCTION_APP_URL=<actual public production URL>`',
      '`REQUEST_LIST_BASIC_EXPORT_PRODUCTION_ROLLOUT_WINDOW=<actual date/time window and timezone>`',
      'Another later retry again described the values as actual public, non-secret values, but still supplied placeholder text:',
      '`PRODUCTION_APP_URL=https://YOUR_REAL_PUBLIC_PRODUCTION_DOMAIN_HERE`',
      '`REQUEST_LIST_BASIC_EXPORT_PRODUCTION_ROLLOUT_WINDOW=YOUR_REAL_DATE_TIME_WINDOW_AND_TIMEZONE_HERE`',
      'A newest retry again described the values as actual public, non-secret values, but still supplied angle-bracket placeholder text:',
      '`PRODUCTION_APP_URL=https://<the actual public Vinea production domain>`',
      '`REQUEST_LIST_BASIC_EXPORT_PRODUCTION_ROLLOUT_WINDOW=<actual date, start time, end time, and timezone>`',
      'Current validation result: `BLOCKED_PLACEHOLDER_VALUES_PROVIDED`',
      'The production app URL is still a placeholder.',
      'The rollout window is still a placeholder.',
      'The final approval prompt cannot be safely used until both placeholders are replaced with real non-secret values.',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('names only the two safe values needed next', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      '`PRODUCTION_APP_URL`: the public Vinea production URL only.',
      '`REQUEST_LIST_BASIC_EXPORT_PRODUCTION_ROLLOUT_WINDOW`: a specific date/time window and timezone.',
      'Production exports remain `NO-GO`.',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('does not include obvious credential, connection-string, token, raw ID, or fixture material', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

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
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
