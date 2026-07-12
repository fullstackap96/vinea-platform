import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const settingsPagePath = join(
  process.cwd(),
  'app',
  'dashboard',
  'settings',
  'ParishSettingsPage.tsx'
)
const settingsRoutePath = join(process.cwd(), 'app', 'api', 'parish', 'settings', 'route.ts')
const evidencePath = join(process.cwd(), 'docs', 'SETTINGS_SELECTED_PARISH_SCOPE_UX_20260629.md')

describe('settings selected parish scope UX', () => {
  it('keeps the Settings API backed by active parish context', () => {
    const route = readFileSync(settingsRoutePath, 'utf8')

    expect(route).toContain('resolveActiveStaffParishContext')
    expect(route).toContain('resolveStaffWriteParishContext')
    expect(route).toContain('activeParishCookie(request)')
    expect(route).toContain('parishContext.activeParishId')
  })

  it('shows a visible display-only selected parish label on the Settings page', () => {
    const page = readFileSync(settingsPagePath, 'utf8')

    expect(page).toContain('loadedParishName')
    expect(page).toContain('setLoadedParishName(p.name)')
    expect(page).toContain('Settings are scoped to')
    expect(page).toContain("fetch('/api/parish/settings'")
  })

  it('keeps the loaded parish label separate from the editable parish name input', () => {
    const page = readFileSync(settingsPagePath, 'utf8')

    expect(page).toContain("const [parishName, setParishName] = useState('')")
    expect(page).toContain("const [loadedParishName, setLoadedParishName] = useState('')")
    expect(page).toContain('value={parishName}')
    expect(page).toContain('onChange={(e) => setParishName(e.target.value)}')
  })

  it('documents the non-production-safe scope and avoids unrelated surfaces', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production was not accessed',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'runtime authorization behavior was not changed',
      'no secrets were exposed',
      'Settings are scoped to',
      'does not promote production RLS',
    ]) {
      expect(evidence).toContain(expected)
    }

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY',
      'GOOGLE_CLIENT_SECRET',
      'OPENAI_API_KEY',
      'access_token=',
      'refresh_token=',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
