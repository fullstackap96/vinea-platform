import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const page = readFileSync(
  join(process.cwd(), 'app', 'dashboard', 'requests', '[id]', 'page.tsx'),
  'utf8',
)

describe('Google Calendar delete confirmation boundary', () => {
  it('opens the shared confirmation instead of deleting directly from the section', () => {
    expect(page).toContain('onDelete={() => setConfirmGoogleCalendarDeleteOpen(true)}')
    expect(page).not.toContain('onDelete={deleteGoogleCalendarEvent}')
    expect(page).toContain('open={confirmGoogleCalendarDeleteOpen}')
    expect(page).toContain('title="Delete this Google Calendar event?"')
    expect(page).toContain('confirmLabel="Delete calendar event"')
  })

  it('keeps cancel as a no-op and dispatches the existing delete action only on confirm', () => {
    expect(page).toContain('onCancel={() => setConfirmGoogleCalendarDeleteOpen(false)}')
    expect(page).toContain('void deleteGoogleCalendarEvent()')

    const dialogStart = page.indexOf('open={confirmGoogleCalendarDeleteOpen}')
    const dialogEnd = page.indexOf('/>', dialogStart)
    const dialog = page.slice(dialogStart, dialogEnd)
    expect(dialog.indexOf('setConfirmGoogleCalendarDeleteOpen(false)')).toBeGreaterThan(-1)
    expect(dialog.indexOf('void deleteGoogleCalendarEvent()')).toBeGreaterThan(
      dialog.indexOf('setConfirmGoogleCalendarDeleteOpen(false)'),
    )
  })

  it('explains the Vinea schedule boundary before external deletion', () => {
    expect(page).toContain(
      'The confirmed request date or time will remain in Vinea. Change it separately if the schedule itself has changed.',
    )
    expect(page).toContain('selected parish calendar')
  })
})
