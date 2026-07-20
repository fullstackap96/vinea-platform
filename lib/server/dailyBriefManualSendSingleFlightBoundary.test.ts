import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const settings = read('app/dashboard/settings/ParishSettingsPage.tsx')

describe('Daily Brief manual send single-flight boundary', () => {
  it('locks synchronously before the authenticated delivery route', () => {
    const start = settings.indexOf('async function sendDailyBriefNow()')
    const end = settings.indexOf('async function savePublicIntakeRouting', start)
    const handler = settings.slice(start, end)

    expect(start).toBeGreaterThanOrEqual(0)
    expect(end).toBeGreaterThan(start)
    expect(settings).toContain(
      "useRef<'settings-save' | 'daily-brief-send' | null>(null)",
    )
    expect(handler).toContain(
      'if (parishSettingsMutationInFlightRef.current || parishSettingsMutationRequiresRefresh) return',
    )
    expect(
      handler.indexOf(
        "parishSettingsMutationInFlightRef.current = 'daily-brief-send'",
      ),
    ).toBeLessThan(
      handler.indexOf("fetch('/api/parish/daily-brief'"),
    )
    expect(handler.indexOf('finally {')).toBeLessThan(
      handler.indexOf('parishSettingsMutationInFlightRef.current = null'),
    )
  })

  it('keeps the confirmation visible and non-interactive during delivery', () => {
    const start = settings.indexOf('<VineaConfirmDialog\n        open={confirmDailyBriefSendOpen}')
    const dialog = settings.slice(start, settings.indexOf('\n      />', start) + 9)

    expect(start).toBeGreaterThanOrEqual(0)
    expect(dialog).toContain('busy={dailyBriefSending}')
    expect(dialog).toContain('busyLabel="Sending brief..."')
    expect(dialog).toContain('onConfirm={() => void sendDailyBriefNow()}')
    expect(dialog).not.toContain(
      'onConfirm={() => {\n          setConfirmDailyBriefSendOpen(false)',
    )
  })

  it('closes after settlement and preserves staff-visible result guidance', () => {
    const start = settings.indexOf('async function sendDailyBriefNow()')
    const end = settings.indexOf('async function savePublicIntakeRouting', start)
    const handler = settings.slice(start, end)

    expect(handler).toContain('setConfirmDailyBriefSendOpen(false)')
    expect(handler).toContain("parishSettingsClientErrorMessage('sendDailyBrief'")
    expect(handler).toContain('Daily brief sent to')
  })

  it('documents immediate exclusion without claiming provider idempotency', () => {
    const evidence = read('docs/DAILY_BRIEF_MANUAL_SEND_SINGLE_FLIGHT_BOUNDARY_20260711.md')
    for (const phrase of [
      'Daily Brief Manual Send Single-Flight Boundary',
      'staff confirmation',
      'selected-parish',
      'not provider-level idempotency',
      'No production',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
