import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'GOOGLE_CALENDAR_ACTIVE_PARISH_BROWSER_QA_EVIDENCE_20260627_PARTIAL.md'
)

describe('Google Calendar active-parish partial browser QA evidence', () => {
  it('records safety boundaries and prevents claiming full Google Calendar QA completion', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: `PARTIAL - HEALTH, LOGIN, SETTINGS VERIFIED; RECONNECT AND EVENT LIFECYCLE BLOCKED`',
      'Production accessed | `NO`',
      'Migrations applied | `NO`',
      'Operational RLS changed | `NO`',
      'Google OAuth credentials submitted | `NO`',
      'Google event create/update/delete attempted | `NO`',
      'Real parish Google Calendar data touched | `NO`',
      'Final decision | `PARTIAL - FOLLOW-UP REQUIRED`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('records the production-mode server-action fix discovered during QA', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'A "use server" file can only export async functions, found object.',
      'lib/server/activeParishSelection.ts',
      'app/dashboard/parish-context/actions.ts',
      'Next.js 16 documentation',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('records both remaining blockers before Google event mutation', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Google rejected private IP callback',
      'No Google credentials were submitted.',
      'Same-parish request detail still returned `Request not found`',
      'Event create/update/delete was intentionally not attempted',
      'Use a Google-authorized non-production callback URL',
      'Re-test active-parish persistence into server-rendered request detail',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
