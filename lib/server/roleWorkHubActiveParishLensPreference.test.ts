import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

describe('Role Work Hub active-parish lens preference', () => {
  it('passes the validated active parish id into the Role Work Hub', () => {
    const source = readRepoFile('app/dashboard/DashboardPageCore.tsx')

    expect(source).toContain('<DashboardRoleWorkHub')
    expect(source).toContain('activeParishId={activeParishId}')
    expect(source).toContain('activeParishName={activeParishName}')
    expect(source).toContain('activeParishId is the server-validated parish scope trigger')
  })

  it('stores lens preferences locally with an active-parish-scoped key', () => {
    const source = readRepoFile('app/dashboard/DashboardRoleWorkHub.tsx')

    expect(source).toContain('activeParishId?: string | null')
    expect(source).toContain('ROLE_WORK_HUB_LENS_STORAGE_PREFIX')
    expect(source).toContain("activeParishId ?? 'legacy'")
    expect(source).toContain('window.localStorage.getItem(lensStorageKey)')
    expect(source).toContain('window.localStorage.setItem(lensStorageKey, lensId)')
    expect(source).toContain('isDashboardRoleLensId(storedLensId)')
    expect(source).toContain('roleHub.lenses.some((lens) => lens.id === storedLensId)')
    expect(source).toContain('handleLensSelect(lens.id)')
  })

  it('keeps the preference browser-local and avoids protected runtime surfaces', () => {
    const source = readRepoFile('app/dashboard/DashboardRoleWorkHub.tsx')

    expect(source).not.toContain('fetch(')
    expect(source).not.toContain('supabase')
    expect(source).not.toContain('/api/google')
    expect(source).not.toContain('/api/requests')
    expect(source).not.toContain('/api/communications')
  })

  it('documents the safe non-production guardrails and browser-QA follow-up', () => {
    const doc = readRepoFile('docs/ROLE_WORK_HUB_ACTIVE_PARISH_LENS_PREFERENCE_20260629.md')

    for (const expected of [
      'does not access production',
      'apply migrations',
      'change operational RLS',
      'touch Google Calendar routes or data',
      'mutate request or communication records',
      'call an API',
      'write to Supabase',
      'expose secrets',
      'active parish id',
      'Browser QA should still verify',
    ]) {
      expect(doc).toContain(expected)
    }
  })
})
