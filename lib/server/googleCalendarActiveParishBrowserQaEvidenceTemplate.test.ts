import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'GOOGLE_CALENDAR_ACTIVE_PARISH_BROWSER_QA_EVIDENCE_TEMPLATE_20260627.md'
)

describe('Google Calendar active-parish browser QA evidence template', () => {
  it('documents the safety boundaries for non-production browser QA', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const required of [
      'Status: Evidence template only.',
      'Do not access production',
      'do not apply migrations',
      'do not change operational RLS',
      'Production access: `NO`',
      'Production Google account/calendar: `NO`',
      'Production Supabase database: `NO`',
      'Migrations applied: `NO`',
      'Operational RLS changed: `NO`',
      'Google event create/update/delete code changed during this QA run: `NO`',
      'scripts/set-google-calendar-browser-qa-env.ps1',
      'scripts/check-google-calendar-browser-qa-env.ps1',
      'APPROVED_NON_PRODUCTION_GOOGLE_CALENDAR_QA',
      'APPROVED_GOOGLE_CALENDAR_RECONNECT_QA',
      'Do not paste passwords, OAuth tokens, refresh tokens, session cookies, event ids, or raw secrets',
    ]) {
      expect(evidence).toContain(required)
    }
  })

  it('requires the safe credentials and fixture inputs needed for a live run', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const required of [
      'NON_PRODUCTION_APP_URL',
      'QA_STAFF_EMAIL',
      'QA_STAFF_PASSWORD',
      'QA_GOOGLE_CALENDAR_EMAIL',
      'QA_GOOGLE_CALENDAR_PASSWORD',
      'QA_ACTIVE_PARISH_A_ID',
      'QA_ACTIVE_PARISH_B_ID',
      'QA_GOOGLE_SAME_PARISH_REQUEST_ID',
      'QA_GOOGLE_CROSS_PARISH_REQUEST_ID',
      'QA_GOOGLE_MISMATCHED_CALENDAR_REQUEST_ID',
      'QA_SAFE_GOOGLE_CALENDAR_ID',
      'QA_GOOGLE_RECONNECT_ALLOWED',
    ]) {
      expect(evidence).toContain(required)
    }
  })

  it('covers selected-parish reconnect, settings status, lifecycle, denial, mismatch, and cleanup gates', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const required of [
      '## Gate 1 - Selected-Parish Google Reconnect',
      'saves `parish_google_integrations` to the selected parish',
      'Returns to `/dashboard/settings?gcal=connected`',
      'Connected account shown for parish A',
      'Parish B does not inherit parish A connection unless intentionally connected',
      '## Gate 2 - Same-Parish Event Lifecycle',
      'Create Google Calendar event',
      'Update request/calendar event',
      'Delete Google Calendar event',
      'No active matching QA event remains',
      '## Gate 3 - Cross-Parish And Stale Selection Denials',
      'No Google event created',
      'No Google event patched',
      'No Google event deleted or cleared',
      'No OAuth tokens, refresh tokens, membership internals, or private parish data',
      '## Gate 4 - Mismatched Calendar Safety',
      'Stored calendar fields remain unchanged',
      '## Gate 5 - Rollback / Cleanup',
      'Revoke safe Google test OAuth, if required by owner',
    ]) {
      expect(evidence).toContain(required)
    }
  })

  it('keeps final outcome and blocked status explicit until safe QA inputs exist', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const required of [
      '## Final Outcome',
      'Selected-parish OAuth reconnect',
      'Settings status selected-parish scoped',
      'Create/update/delete selected parish event lifecycle',
      'Cross-parish/stale selection denial',
      'Mismatched calendar safety',
      'Cleanup completed',
      'Production touched',
      'Final decision',
      '## Current Blocked Status',
      'safe non-production app credentials, safe staff credentials, safe Google Calendar credentials, request fixtures, and explicit reconnect approval',
      'did not find the required inputs in process, user, or machine scope',
    ]) {
      expect(evidence).toContain(required)
    }
  })
})
