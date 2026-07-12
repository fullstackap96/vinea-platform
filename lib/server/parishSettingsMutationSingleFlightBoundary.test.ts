import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const settings = read('app/dashboard/settings/ParishSettingsPage.tsx')

function handler(startMarker: string, endMarker: string) {
  const start = settings.indexOf(startMarker)
  const end = settings.indexOf(endMarker, start)
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return settings.slice(start, end)
}

describe('Parish Settings mutation single-flight boundary', () => {
  it('shares one synchronous lock between settings save and Daily Brief send', () => {
    expect(settings).toContain(
      "useRef<'settings-save' | 'daily-brief-send' | null>(null)",
    )

    const save = handler('async function handleSave', 'function updateSla')
    const send = handler('async function sendDailyBriefNow', 'function beginPublicRoutingMutation')

    expect(save).toContain('if (parishSettingsMutationInFlightRef.current) return')
    expect(save.indexOf("parishSettingsMutationInFlightRef.current = 'settings-save'")).toBeLessThan(
      save.indexOf("fetch('/api/parish/settings'"),
    )
    expect(send).toContain('if (parishSettingsMutationInFlightRef.current) return')
    expect(send.indexOf("parishSettingsMutationInFlightRef.current = 'daily-brief-send'")).toBeLessThan(
      send.indexOf("fetch('/api/parish/daily-brief'"),
    )
  })

  it('releases both operations through finally', () => {
    const save = handler('async function handleSave', 'function updateSla')
    const send = handler('async function sendDailyBriefNow', 'function beginPublicRoutingMutation')

    for (const block of [save, send]) {
      expect(block.indexOf('finally {')).toBeLessThan(
        block.indexOf('parishSettingsMutationInFlightRef.current = null'),
      )
    }
  })

  it('freezes the complete reviewed configuration during save or delivery', () => {
    expect(settings).toContain('const parishSettingsBusy = saving || dailyBriefSending')
    expect(settings).toContain('aria-busy={parishSettingsBusy}')
    expect(
      settings.match(/disabled=\{parishSettingsBusy\}/g)?.length ?? 0,
    ).toBeGreaterThanOrEqual(10)
  })

  it('preserves visible progress for the active operation', () => {
    expect(settings).toContain("saving ? 'Saving…' : 'Save parish details'")
    expect(settings).toContain("dailyBriefSending ? 'Sending brief...' : \"Send today's brief now\"")
    expect(settings).toContain('busy={dailyBriefSending}')
  })

  it('documents recipient/configuration race prevention without claiming idempotency', () => {
    const evidence = read('docs/PARISH_SETTINGS_MUTATION_SINGLE_FLIGHT_BOUNDARY_20260711.md')
    for (const phrase of [
      'Parish Settings Mutation Single-Flight Boundary',
      'Daily Brief recipient',
      'selected-parish',
      'staff-reviewed configuration snapshot',
      'not provider-level or durable server idempotency',
      'No production',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
