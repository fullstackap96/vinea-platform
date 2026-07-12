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
const routePath = join(process.cwd(), 'app', 'api', 'parish', 'public-intake-routing', 'route.ts')
const evidencePath = join(
  process.cwd(),
  'docs',
  'PUBLIC_INTAKE_ROUTING_SELECTED_PARISH_SCOPE_UX_20260629.md'
)

describe('public intake routing selected parish scope UX', () => {
  it('shows a display-only selected parish label inside the Public intake routing card', () => {
    const page = readFileSync(settingsPagePath, 'utf8')

    expect(page).toContain('loadedParishName')
    expect(page).toContain('setLoadedParishName(p.name)')
    expect(page).toContain('Public intake routing is scoped to')
    expect(page).toContain('{loadedParishName}')
    expect(page).toContain('Prepared, not live')
  })

  it('keeps the public intake routing API backed by active parish and write-safety helpers', () => {
    const route = readFileSync(routePath, 'utf8')

    expect(route).toContain('resolveActiveStaffParishContext')
    expect(route).toContain('resolveStaffWriteParishContext')
    expect(route).toContain('activeParishCookie(request)')
    expect(route).toContain('parishContext.activeParishId')
    expect(route).toContain('allowPrimaryParishFallback: !requestedParishId')
  })

  it('documents the safe non-runtime scope and follow-up browser QA', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production was not accessed',
      'No migrations were applied',
      'Operational RLS was not changed',
      'Runtime public intake routing was not enabled',
      'Public intake forms were not changed',
      'Google Calendar data was not touched',
      'Public intake routing records were not mutated',
      'No secrets were exposed',
      'Public intake routing is scoped to',
      'Prepared, not live',
      'Run shared-QA browser verification',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('does not record credentials, database URLs, tokens, or runtime enablement claims', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'GOOGLE_CLIENT_SECRET',
      'OPENAI_API_KEY',
      'access_token=',
      'refresh_token=',
      'Runtime public intake routing was enabled',
      'Production public intake routing was enabled',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
