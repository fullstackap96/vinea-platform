import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  PARISH_SETTINGS_MUTATION_CONFIRMATION_TIMEOUT_MS,
  PARISH_SETTINGS_REFRESH_REQUIRED_MESSAGE,
  STAFF_ACCESS_REFRESH_REQUIRED_MESSAGE,
} from '../parishSettingsClientConfirmation'

const source = readFileSync(
  join(process.cwd(), 'app', 'dashboard', 'settings', 'ParishSettingsPage.tsx'),
  'utf8',
)

function handler(startMarker: string, endMarker: string): string {
  const start = source.indexOf(startMarker)
  const end = source.indexOf(endMarker, start)
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return source.slice(start, end)
}

describe('Parish Settings mutation confirmation deadline boundary', () => {
  it('keeps confirmation finite and uses refresh-first safe messages', () => {
    expect(PARISH_SETTINGS_MUTATION_CONFIRMATION_TIMEOUT_MS).toBe(60_000)
    expect(PARISH_SETTINGS_REFRESH_REQUIRED_MESSAGE).toContain('Refresh Settings')
    expect(STAFF_ACCESS_REFRESH_REQUIRED_MESSAGE).toContain('Refresh Settings')
  })

  it('confirms parish settings writes and the selected-parish reload before success', () => {
    const save = handler('async function handleSave', 'function updateSla')

    expect(save).toContain('const saveParishId = activeParishIdRef.current')
    expect(save).toContain(
      'signal: AbortSignal.timeout(PARISH_SETTINGS_MUTATION_CONFIRMATION_TIMEOUT_MS)',
    )
    expect(save).toContain('if (activeParishIdRef.current !== saveParishId) return')
    expect(save).toContain('if (!res.ok)')
    expect(save).toContain('if (!data?.ok)')
    expect(save).toContain('setParishSettingsMutationRequiresRefresh(true)')
    expect(save).toContain('const refreshed = await load()')
    expect(save).toContain('if (!refreshed)')
    expect(save.indexOf("setSaveMessage('Settings saved.')")).toBeGreaterThan(
      save.indexOf('if (!refreshed)'),
    )
  })

  it('confirms Staff Access additions and updates before reporting success', () => {
    const add = handler('async function addStaffAccess', 'async function updateStaffAccess')
    const update = handler('async function updateStaffAccess', 'function confirmStaffDeactivation')

    for (const block of [add, update]) {
      expect(block).toContain('const saveParishId = activeParishIdRef.current')
      expect(block).toContain(
        'signal: AbortSignal.timeout(PARISH_SETTINGS_MUTATION_CONFIRMATION_TIMEOUT_MS)',
      )
      expect(block).toContain('if (activeParishIdRef.current !== saveParishId) return')
      expect(block).toContain('if (!res.ok)')
      expect(block).toContain('if (!data?.ok)')
      expect(block).toContain('setStaffAccessMutationRequiresRefresh(true)')
      expect(block).toContain('const refreshed = await loadStaffAccess()')
      expect(block).toContain('if (!refreshed)')
    }
  })

  it('freezes every related control until refresh and resets only when parish scope changes', () => {
    expect(source).toContain(
      'saving || dailyBriefSending || parishSettingsMutationRequiresRefresh',
    )
    expect(source).toContain(
      'staffAccessAdding || staffAccessUpdatingId !== null || staffAccessMutationRequiresRefresh',
    )
    expect(source).toContain('setParishSettingsMutationRequiresRefresh(false)')
    expect(source).toContain('setStaffAccessMutationRequiresRefresh(false)')
    expect(source).not.toContain('setTimeout(() => handleSave')
    expect(source).not.toContain('setTimeout(() => addStaffAccess')
    expect(source).not.toContain('setTimeout(() => updateStaffAccess')
  })
})
