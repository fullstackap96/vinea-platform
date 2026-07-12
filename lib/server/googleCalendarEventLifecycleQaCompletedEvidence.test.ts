import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const evidencePath = join(
  root,
  'docs',
  'GOOGLE_CALENDAR_EVENT_LIFECYCLE_QA_COMPLETED_20260628.md'
)

describe('Google Calendar event lifecycle QA completed evidence', () => {
  const evidence = readFileSync(evidencePath, 'utf8')

  it('records the non-production scope and bypass revocation', () => {
    expect(evidence).toContain('https://vinea-platform-8jm7cy6ju-vinea.vercel.app')
    expect(evidence).toContain('Production accessed | `NO`')
    expect(evidence).toContain('Migrations applied | `NO`')
    expect(evidence).toContain('Operational RLS changed | `NO`')
    expect(evidence).toContain('Real parish calendar data touched | `NO`')
    expect(evidence).toContain('Automation Bypass removed')
    expect(evidence).toContain('`VERCEL_AUTOMATION_BYPASS_SECRET` is no longer present')
  })

  it('records create, update, delete, and cleanup evidence for the same-parish fixture', () => {
    expect(evidence).toContain('| Create event | Passed |')
    expect(evidence).toContain('| Update event | Passed |')
    expect(evidence).toContain('| Delete event | Passed |')
    expect(evidence).toContain('Google Calendar Synced')
    expect(evidence).toContain('Calendar event saved. No conflicts found.')
    expect(evidence).toContain('Google Calendar event removed and link cleared.')
    expect(evidence).toContain('The safe QA event was cleaned up through the Vinea delete flow.')
  })

  it('records cross-parish and mismatched-calendar denial evidence', () => {
    expect(evidence).toContain('The cross-parish request showed `Request not found`.')
    expect(evidence).toContain('No Google Calendar mutation was attempted from the denied request.')
    expect(evidence).toContain(
      'This request is linked to a different parish calendar. Recreate the Google Calendar event for the selected parish.'
    )
    expect(evidence).toContain(
      'This request is linked to a different parish calendar. Switch to the linked parish or contact an administrator before removing the event.'
    )
    expect(evidence).toContain('The request stayed synced after both denial attempts.')
  })
})
