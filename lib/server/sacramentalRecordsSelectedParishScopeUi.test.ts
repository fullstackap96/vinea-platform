import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const recordsLoaderPath = join(process.cwd(), 'lib', 'server', 'loadSacramentalRecordsList.ts')
const recordsViewPath = join(process.cwd(), 'app', 'dashboard', 'records', 'RecordsListView.tsx')
const evidencePath = join(
  process.cwd(),
  'docs',
  'SACRAMENTAL_RECORDS_SELECTED_PARISH_SCOPE_UX_20260628.md'
)

describe('sacramental records selected parish scope UX', () => {
  it('derives the active parish name from the same context used by the Records loader', () => {
    const loader = readFileSync(recordsLoaderPath, 'utf8')

    expect(loader).toContain('resolveActiveStaffParishContext')
    expect(loader).toContain('parishContext.parishes.find')
    expect(loader).toContain('parish.id === parishContext.activeParishId')
    expect(loader).toContain("query = query.eq('parish_id', parishId)")
    expect(loader).toContain('activeParishName')
    expect(loader).toContain("userMessageForDashboardQueryError('sacramental records', error)")
    expect(loader).not.toContain("errorMessage: error.message || 'Could not load sacramental records.'")
  })

  it('shows a visible staff-facing selected parish label on the Sacramental Records page', () => {
    const view = readFileSync(recordsViewPath, 'utf8')

    expect(view).toContain('activeParishName')
    expect(view).toContain('Sacramental records are scoped to')
  })

  it('documents the non-production-safe scope and avoids unrelated surfaces', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production was not accessed',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar was not touched',
      'no secrets were exposed',
      'Sacramental records are scoped to',
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
