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
const settingsServerPagePath = join(process.cwd(), 'app', 'dashboard', 'settings', 'page.tsx')
const staffUsersRoutePath = join(process.cwd(), 'app', 'api', 'parish', 'staff-users', 'route.ts')
const evidencePath = join(
  process.cwd(),
  'docs',
  'STAFF_ACCESS_SELECTED_PARISH_SCOPE_UX_20260629.md'
)

describe('staff access selected parish scope UX', () => {
  it('shows a Staff Access selected parish label from the loaded active parish name', () => {
    const page = readFileSync(settingsPagePath, 'utf8')

    expect(page).toContain('loadedParishName')
    expect(page).toContain('Staff access is scoped to')
    expect(page).toContain('Staff login access')
    expect(page).toContain('fetch(\'/api/parish/staff-users\'')
  })

  it('reloads the client-loaded Settings panel when the server-validated active parish changes', () => {
    const page = readFileSync(settingsPagePath, 'utf8')
    const serverPage = readFileSync(settingsServerPagePath, 'utf8')

    expect(serverPage).toContain('loadActiveStaffParishSwitcherContext')
    expect(serverPage).toContain('activeParishId')
    expect(serverPage).toContain("key={activeParishId ?? 'legacy-parish-context'}")
    expect(serverPage).toContain('activeParishId={activeParishId}')
    expect(page).toContain('activeParishId = null')
    expect(page).toContain('[activeParishId, load]')
  })

  it('keeps staff access reads and writes scoped through existing active parish helpers', () => {
    const route = readFileSync(staffUsersRoutePath, 'utf8')

    expect(route).toContain('resolveActiveStaffParishContext')
    expect(route).toContain('resolveStaffWriteParishContext')
    expect(route).toContain('activeParishCookie(request)')
    expect(route).toContain('allowPrimaryParishFallback: !requestedParishId')
    expect(route).toContain('staffIsAdminForParish')
  })

  it('documents the safe non-production scope and remaining production RLS blocker', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production was not accessed',
      'No migrations were applied',
      'Operational RLS was not changed',
      'Runtime authorization behavior was not changed',
      'Google Calendar data was not touched',
      'Records were not mutated',
      'No secrets were exposed',
      'This does not promote production RLS',
      'Browser QA has now been completed in shared QA',
      'STAFF_ACCESS_SELECTED_PARISH_SCOPE_BROWSER_QA_20260629.md',
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
