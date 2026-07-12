import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const importsRoutePath = join(process.cwd(), 'app', 'api', 'imports', 'route.ts')
const importsPagePath = join(
  process.cwd(),
  'app',
  'dashboard',
  'imports',
  'DashboardImportsPageClient.tsx'
)
const evidencePath = join(
  process.cwd(),
  'docs',
  'IMPORTS_SELECTED_PARISH_SCOPE_UX_20260629.md'
)

describe('imports selected parish scope UX', () => {
  it('keeps import history scoped through active parish context and exposes only the display name', () => {
    const route = readFileSync(importsRoutePath, 'utf8')

    expect(route).toContain('resolveImportReadParishId(staff.supabase, requestedParishId)')
    expect(route).toContain(".eq('parish_id', parishId)")
    expect(route).toContain('activeParishName: parishContext.activeParish.name ?? null')
    expect(route).not.toContain('parishContext.parishes')
    expect(route).not.toContain('parishIds:')
  })

  it('shows a visible selected parish label on the Data Import page', () => {
    const page = readFileSync(importsPagePath, 'utf8')

    expect(page).toContain('activeParishName')
    expect(page).toContain("setActiveParishName(String(data.activeParishName ?? '').trim())")
    expect(page).toContain('Imports are scoped to')
    expect(page).toContain('/api/imports')
  })

  it('clears the display label when import history fails to load', () => {
    const page = readFileSync(importsPagePath, 'utf8')

    expect(page).toContain("setActiveParishName('')")
    expect(page).toContain('if (!isLatestLoad() ||')
    expect(page).toContain('historyLoadAbortRef.current?.abort()')
  })

  it('documents the non-production-safe scope and avoids sensitive values', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production was not accessed',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'runtime authorization behavior was not changed',
      'no secrets were exposed',
      'Imports are scoped to',
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
