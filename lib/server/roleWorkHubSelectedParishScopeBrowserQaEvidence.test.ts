import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

describe('Role Work Hub selected-parish browser QA evidence', () => {
  it('records the shared-QA browser verification and safe guardrails', () => {
    const doc = readRepoFile('docs/ROLE_WORK_HUB_SELECTED_PARISH_SCOPE_BROWSER_QA_20260629.md')

    for (const expected of [
      'Completed against shared QA',
      'localhost:3001',
      'gnfomgsuottcuueasfvi',
      'checks.schema: true',
      'Role work hub is scoped to Vinea QA Google Calendar Parish A.',
      'Role work hub is scoped to Vinea QA Google Calendar Parish B.',
      'Page stayed on `/dashboard`',
      'Page did not show a not-found state',
      'Request and communication records were not mutated',
      'Google Calendar was not opened or mutated',
      'Production was not accessed',
      'Migrations/RLS were unchanged',
      'secretsPrinted',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('records the issue found and fixed during browser QA', () => {
    const doc = readRepoFile('docs/ROLE_WORK_HUB_SELECTED_PARISH_SCOPE_BROWSER_QA_20260629.md')
    const dashboardHome = readRepoFile('app/dashboard/page.tsx')

    expect(doc).toContain('Issue Found And Fixed')
    expect(doc).toContain('dashboard home page was passing the active parish id')
    expect(doc).toContain('but not the active parish display name')
    expect(dashboardHome).toContain('activeParishName={activeParishName}')
  })
})
