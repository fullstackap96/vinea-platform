import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const searchPagePath = join(process.cwd(), 'app', 'dashboard', 'search', 'page.tsx')
const searchResultsViewPath = join(
  process.cwd(),
  'app',
  'dashboard',
  '_components',
  'GlobalSearchResultsView.tsx'
)
const searchLoaderPath = join(process.cwd(), 'lib', 'server', 'loadGlobalSearch.ts')
const requestScopeCuePath = join(process.cwd(), 'lib', 'globalSearch', 'requestScopeCue.ts')
const evidencePath = join(
  process.cwd(),
  'docs',
  'GLOBAL_SEARCH_SELECTED_PARISH_SCOPE_UX_20260628.md'
)

describe('global search selected parish scope UX', () => {
  it('passes the active parish name from the server page into the search results view', () => {
    const page = readFileSync(searchPagePath, 'utf8')

    expect(page).toContain('loadActiveStaffParishSwitcherContext')
    expect(page).toContain('parishSwitcher.parishes.find')
    expect(page).toContain('parish.id === parishSwitcher.activeParishId')
    expect(page).toContain('activeParishName={activeParishName}')
  })

  it('keeps global search scoped through active parish context and shows a visible staff label', () => {
    const view = readFileSync(searchResultsViewPath, 'utf8')
    const loader = readFileSync(searchLoaderPath, 'utf8')

    expect(view).toContain('activeParishName')
    expect(view).toContain('Search is using selected parish context')
    expect(view).toContain('warningMessage')
    expect(view).toContain('buildGlobalSearchRequestScopeCue')
    expect(view).toContain('global-search-request-scope-heading')
    expect(view).toContain('placeholder="Search Vinea..."')
    expect(view).toContain('No results for "${query}".')
    expect(loader).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(loader).toContain('resolveActiveStaffParishContext')
    expect(loader).toContain("query = query.eq('parish_id', parishId)")
    expect(loader).toContain('Some search results may be missing')
    expect(loader).toContain('hadError')
  })

  it('explains request results follow linked parishioners without adding mutation paths', () => {
    const requestScopeCue = readFileSync(requestScopeCuePath, 'utf8')

    expect(requestScopeCue).toContain('Request search follows')
    expect(requestScopeCue).toContain('linked parishioners')
    expect(requestScopeCue).toContain('Switch parishes')
    expect(requestScopeCue).toContain('read-only')
    expect(requestScopeCue).toContain('does not link records')
    expect(requestScopeCue).toContain('override parish permissions')

    for (const forbidden of [
      '.from(',
      '.insert(',
      '.update(',
      '.upsert(',
      '.delete(',
      'createSignedUrl',
      'OPENAI_API_KEY',
      'sendEmail',
      'generateCertificate',
      'public claim',
    ]) {
      expect(requestScopeCue).not.toContain(forbidden)
    }
  })

  it('documents the non-production-safe scope and avoids unrelated surfaces', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production was not accessed',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar was not touched',
      'no secrets were exposed',
      'Search is using selected parish context',
      'does not promote production RLS',
    ]) {
      expect(evidence).toContain(expected)
    }

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY',
      'GOOGLE_CLIENT_SECRET',
      'OPENAI_API_KEY',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
