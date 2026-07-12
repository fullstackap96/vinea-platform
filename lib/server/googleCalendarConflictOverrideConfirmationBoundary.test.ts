import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const page = readFileSync(
  join(process.cwd(), 'app', 'dashboard', 'requests', '[id]', 'page.tsx'),
  'utf8',
)

describe('Google Calendar conflict override confirmation boundary', () => {
  it('routes force-create through an explicit confirmation', () => {
    expect(page).toContain(
      'onForceCreate={() => setConfirmGoogleCalendarConflictOverrideOpen(true)}',
    )
    expect(page).not.toContain('onForceCreate={forceCreateGoogleCalendarEvent}')
    expect(page).toContain('open={confirmGoogleCalendarConflictOverrideOpen}')
    expect(page).toContain('title="Create this event despite calendar conflicts?"')
    expect(page).toContain('confirmLabel="Create event anyway"')
  })

  it('keeps cancellation side-effect free and force-creates only after confirmation', () => {
    expect(page).toContain(
      'onCancel={() => setConfirmGoogleCalendarConflictOverrideOpen(false)}',
    )
    expect(page).toContain('void forceCreateGoogleCalendarEvent()')

    const dialogStart = page.indexOf('open={confirmGoogleCalendarConflictOverrideOpen}')
    const dialogEnd = page.indexOf('/>', dialogStart)
    const dialog = page.slice(dialogStart, dialogEnd)
    expect(dialog.indexOf('setConfirmGoogleCalendarConflictOverrideOpen(false)')).toBeGreaterThan(-1)
    expect(dialog.indexOf('void forceCreateGoogleCalendarEvent()')).toBeGreaterThan(
      dialog.indexOf('setConfirmGoogleCalendarConflictOverrideOpen(false)'),
    )
  })

  it('shows the conflict count and preserves staff scheduling responsibility', () => {
    expect(page).toContain("gcalConflicts.length === 1 ? '1 conflicting event'")
    expect(page).toContain('Review the conflict list before continuing.')
    expect(page).toContain('does not resolve or change the existing events')
    expect(page).toContain('staff remain responsible for confirming the schedule')
  })
})
