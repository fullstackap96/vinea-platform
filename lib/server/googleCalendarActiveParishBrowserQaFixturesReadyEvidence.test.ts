import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'GOOGLE_CALENDAR_ACTIVE_PARISH_BROWSER_QA_FIXTURES_READY_20260627.md'
)

describe('Google Calendar active-parish browser QA fixtures-ready evidence', () => {
  it('records safety boundaries and prevents overstating the browser QA result', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: `FIXTURES READY - BROWSER QA BLOCKED BY LOCAL APP HEALTH`',
      'Production accessed | `NO`',
      'Real parish Google Calendar data touched | `NO`',
      'Migrations applied | `NO`',
      'Operational RLS changed | `NO`',
      'Google OAuth reconnect started | `NO`',
      'Google event create/update/delete attempted | `NO`',
      'Final decision | `BLOCKED BY LOCAL APP HEALTH`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('documents shared QA synthetic fixtures without exposing ids or secrets', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Supabase project | `gnfomgsuottcuueasfvi`',
      'scripts/create-google-calendar-shared-qa-fixtures.mjs',
      'Parish A present.',
      'Parish B present.',
      'Staff memberships present.',
      'Same-parish request present.',
      'Cross-parish request present.',
      'Mismatched-calendar request present.',
      'Secrets printed: `false`',
      'does not print staff email, passwords, service-role key, parish ids, request ids',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('records app health as the remaining browser QA blocker', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Fixture usability | `PASS`',
      '`/api/health` | `FAIL/BLOCKED`',
      'Staff sign-in | `NOT RUN`',
      'Selected-parish OAuth reconnect | `NOT RUN`',
      'Before rerunning browser QA, get the non-production app to a stable `/api/health` response',
      'What changed in plain English',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
