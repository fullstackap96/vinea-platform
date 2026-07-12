import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'GOOGLE_CALENDAR_ACTIVE_PARISH_BROWSER_QA_EVIDENCE_20260627_BLOCKED.md'
)

describe('Google Calendar active-parish browser QA blocked evidence', () => {
  it('records that the run stopped before production, migrations, RLS, OAuth, or Google mutation', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: `BLOCKED - FIXTURES NOT AVAILABLE`',
      'Production accessed | `NO`',
      'Production Google account/calendar used | `NO`',
      'Migrations applied | `NO`',
      'Operational RLS changed | `NO`',
      'Google OAuth reconnect started | `NO`',
      'Google event create/update/delete attempted | `NO`',
      'Secrets printed into evidence | `NO`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('records variable presence by name only and fixture unavailability without exposing values', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'all required variable names were present',
      'Values were not printed',
      'QA_ACTIVE_PARISH_A_ID` | `NO` | Marked `NOT_AVAILABLE`',
      'QA_ACTIVE_PARISH_B_ID` | `NO` | Marked `NOT_AVAILABLE`',
      'QA_GOOGLE_SAME_PARISH_REQUEST_ID` | `NO` | Marked `NOT_AVAILABLE`',
      'QA_GOOGLE_CROSS_PARISH_REQUEST_ID` | `NO` | Marked `NOT_AVAILABLE`',
      'QA_GOOGLE_MISMATCHED_CALENDAR_REQUEST_ID` | `NO` | Marked `NOT_AVAILABLE`',
      'did not print parish ids, request ids, passwords, Google credentials',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('lists the required fixture work before a live reconnect QA run', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'A QA staff account authorized for parish A.',
      'A selected active parish A id.',
      'A second parish B id',
      'A same-parish request owned by parish A.',
      'A cross-parish denied request owned by parish B.',
      'A safe Google Calendar account/calendar approved for non-production mutation.',
      'What changed in plain English',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
