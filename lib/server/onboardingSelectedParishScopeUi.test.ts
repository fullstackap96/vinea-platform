import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const onboardingPagePath = join(
  process.cwd(),
  'app',
  'dashboard',
  'onboarding',
  'ParishOnboardingPage.tsx'
)
const onboardingCardPath = join(process.cwd(), 'app', 'dashboard', 'DashboardOnboardingCard.tsx')
const parishSettingsRoutePath = join(process.cwd(), 'app', 'api', 'parish', 'settings', 'route.ts')
const evidencePath = join(
  process.cwd(),
  'docs',
  'ONBOARDING_SELECTED_PARISH_SCOPE_UX_20260629.md'
)

describe('onboarding selected parish scope UX', () => {
  it('keeps onboarding parish data backed by the active-parish Settings API scope', () => {
    const route = readFileSync(parishSettingsRoutePath, 'utf8')
    const page = readFileSync(onboardingPagePath, 'utf8')
    const card = readFileSync(onboardingCardPath, 'utf8')

    expect(route).toContain('resolveActiveStaffParishContext')
    expect(route).toContain('activeParishCookie(request)')
    expect(route).toContain('parishContext.activeParishId')
    expect(page).toContain("fetch('/api/parish/settings'")
    expect(card).toContain("fetch('/api/parish/settings'")
  })

  it('shows visible display-only selected parish labels on onboarding surfaces', () => {
    const page = readFileSync(onboardingPagePath, 'utf8')
    const card = readFileSync(onboardingCardPath, 'utf8')

    expect(page).toContain('activeParishName')
    expect(page).toContain('setActiveParishName(nextParish.name)')
    expect(page).toContain('Onboarding is scoped to {activeParishName}.')
    expect(card).toContain('activeParishName')
    expect(card).toContain('setActiveParishName(nextParish.name)')
    expect(card).toContain('Setup is scoped to {activeParishName}.')
  })

  it('clears stale display labels before settings reloads', () => {
    const page = readFileSync(onboardingPagePath, 'utf8')
    const card = readFileSync(onboardingCardPath, 'utf8')

    expect(page).toContain("setActiveParishName('')")
    expect(card).toContain("setActiveParishName('')")
  })

  it('documents the non-production-safe scope and avoids sensitive values', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production was not accessed',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'runtime authorization behavior was not changed',
      'no secrets were exposed',
      'Onboarding is scoped to',
      'Setup is scoped to',
      'does not promote production RLS',
    ]) {
      expect(evidence).toContain(expected)
    }

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'GOOGLE_CLIENT_SECRET',
      'OPENAI_API_KEY',
      'access_token',
      'refresh_token',
      'X-Amz-Signature',
      'token=',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
