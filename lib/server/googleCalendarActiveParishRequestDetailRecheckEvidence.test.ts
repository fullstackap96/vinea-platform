import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'GOOGLE_CALENDAR_ACTIVE_PARISH_REQUEST_DETAIL_RECHECK_20260627.md'
)

describe('Google Calendar active-parish request detail recheck evidence', () => {
  it('records the safe request-detail recheck result without claiming calendar mutation QA', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: `PASSED - SAME-PARISH REQUEST DETAIL LOADS`',
      'Production accessed | `NO`',
      'Migrations applied | `NO`',
      'Operational RLS changed | `NO`',
      'Google OAuth credentials submitted | `NO`',
      'Google event create/update/delete attempted | `NO`',
      'Real parish Google Calendar data touched | `NO`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('documents that the active parish and same-parish request detail gates passed', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Active parish selection | Parish A can be selected',
      'The active parish selector value matched Parish A',
      'Same-parish request detail | Parish A request detail loads',
      'did not show `Request not found`',
      'showed request detail/Google Calendar page signals',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('keeps remaining OAuth and event lifecycle follow-up explicit', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'REQUEST DETAIL BLOCKER RESOLVED; OAUTH CALLBACK STILL BLOCKED',
      'approved HTTPS callback',
      'selected-parish Google Calendar reconnect QA',
      'create/update/delete run against the safe QA calendar',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
