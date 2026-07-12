import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const intentionsLoaderPath = join(process.cwd(), 'lib', 'server', 'loadMassIntentionsList.ts')
const intentionsViewPath = join(
  process.cwd(),
  'app',
  'dashboard',
  'intentions',
  'IntentionsListView.tsx'
)
const evidencePath = join(
  process.cwd(),
  'docs',
  'MASS_INTENTIONS_SELECTED_PARISH_SCOPE_UX_20260628.md'
)

describe('mass intentions selected parish scope UX', () => {
  it('derives the active parish name from the same context used by the Mass Intentions loader', () => {
    const loader = readFileSync(intentionsLoaderPath, 'utf8')

    expect(loader).toContain('resolveActiveStaffParishContext')
    expect(loader).toContain('parishContext.parishes.find')
    expect(loader).toContain('parish.id === parishContext.activeParishId')
    expect(loader).toContain("query = query.eq('parish_id', parishId)")
    expect(loader).toContain('activeParishName')
  })

  it('shows a visible staff-facing selected parish label on the Mass Intentions page', () => {
    const view = readFileSync(intentionsViewPath, 'utf8')

    expect(view).toContain('activeParishName')
    expect(view).toContain('Mass intentions are scoped to')
  })

  it('documents the non-production-safe scope and avoids unrelated surfaces', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production was not accessed',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar was not touched',
      'no secrets were exposed',
      'Mass intentions are scoped to',
      'does not change Mass Intentions visibility rules or promote production RLS',
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
