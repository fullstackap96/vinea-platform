import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'GOOGLE_CALENDAR_ACTIVE_PARISH_BROWSER_QA_HEALTH_UNBLOCKED_20260627.md'
)

describe('Google Calendar browser QA health-unblocked evidence', () => {
  it('records the safety boundaries for the health fix and blocked browser QA attempt', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: `APP HEALTH GREEN - BROWSER QA BLOCKED BY LOCALHOST BROWSER ACCESS`',
      'Production accessed | `NO`',
      'Production Google account/calendar used | `NO`',
      'Migrations applied | `NO`',
      'Operational RLS changed | `NO`',
      'Google OAuth reconnect started | `NO`',
      'Google event create/update/delete attempted | `NO`',
      'Secrets printed | `NO`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('documents the corrected health probe and green schema result', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'check_public_intake_rate_limit` with `p_limit: 0`',
      'p_limit: 1',
      'Local app `/api/health` through HTTP | `PASS - HTTP 200, checks.schema: true`',
      '"schema": true',
      'What Changed In Plain English',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('prevents overstating the browser QA outcome', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Staff sign-in | `NOT RUN - browser localhost navigation blocked`',
      'Selected-parish OAuth reconnect | `NOT RUN`',
      'Same-parish event create/update/delete | `NOT RUN`',
      'Final decision | `BLOCKED BY BROWSER LOCALHOST ACCESS`',
      'Do not mark Google Calendar selected-parish browser QA as passed',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
