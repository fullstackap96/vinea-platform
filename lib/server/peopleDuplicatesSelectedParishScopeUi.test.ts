import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const pagePath = join(process.cwd(), 'app', 'dashboard', 'people', 'duplicates', 'page.tsx')
const clientPath = join(
  process.cwd(),
  'app',
  'dashboard',
  'people',
  'duplicates',
  'PeopleDuplicatesPageClient.tsx'
)
const routePath = join(process.cwd(), 'app', 'api', 'people', 'duplicates', 'route.ts')
const evidencePath = join(
  process.cwd(),
  'docs',
  'PEOPLE_DUPLICATES_SELECTED_PARISH_SCOPE_UX_20260629.md'
)

describe('people duplicates selected parish scope UX', () => {
  it('passes the validated active parish name from the server page into the duplicate review client', () => {
    const page = readFileSync(pagePath, 'utf8')

    expect(page).toContain('loadActiveStaffParishSwitcherContext')
    expect(page).toContain('const activeParishName = parishSwitcher.ok')
    expect(page).toContain('parish.id === parishSwitcher.activeParishId')
    expect(page).toContain(
      '<PeopleDuplicatesPageClient activeParishName={activeParishName} />'
    )
  })

  it('shows a visible staff-facing selected parish label before duplicate merge actions', () => {
    const client = readFileSync(clientPath, 'utf8')

    expect(client).toContain('activeParishName?: string | null')
    expect(client).toContain('activeParishName = null')
    expect(client).toContain('People duplicate review is scoped to')
    expect(client).toContain('{activeParishName}')
    expect(client.indexOf('People duplicate review is scoped to')).toBeLessThan(
      client.indexOf('Find duplicates')
    )
  })

  it('keeps duplicate review reads and merge writes scoped through existing active parish helpers', () => {
    const route = readFileSync(routePath, 'utf8')

    expect(route).toContain('resolveActiveStaffParishContext')
    expect(route).toContain('resolveStaffWriteParishContext')
    expect(route).toContain('activeParishCookie(request)')
    expect(route).toContain('allowPrimaryParishFallback: !requestedParishId')
    expect(route).toContain(
      'People duplicate merge used legacy parish context because active parish selection was not available.'
    )
  })

  it('documents the non-production-safe scope without claiming browser QA or runtime policy changes', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production was not accessed',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'duplicate people were not merged',
      'runtime authorization behavior was not changed',
      'People duplicate review is scoped to',
      'Browser QA has not yet been run',
    ]) {
      expect(evidence).toContain(expected)
    }

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'GOOGLE_CLIENT_SECRET',
      'OPENAI_API_KEY',
      'checks.schema: true',
      'Browser QA passed',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
