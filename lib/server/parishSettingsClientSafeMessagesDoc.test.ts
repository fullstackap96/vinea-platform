import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const docPath = 'docs/PARISH_SETTINGS_CLIENT_SAFE_MESSAGES_20260707.md'

describe('parish settings client safe messages documentation', () => {
  it('documents the Parish Settings admin client-message boundary', () => {
    const doc = readFileSync(join(repoRoot, docPath), 'utf8')

    expect(doc).toContain('# Parish Settings Client Safe Messages - 2026-07-07')
    expect(doc).toContain('`lib/parishSettingsClientMessages.ts`')
    expect(doc).toContain('`app/dashboard/settings/ParishSettingsPage.tsx`')
    expect(doc).toContain(
      'main Settings, Daily Brief, Staff Access, Recent Activity, and Public Intake Routing'
    )
    expect(doc).toContain('parish settings load/save and manual Daily Brief send')
    expect(doc).toContain('Public Intake Routing metadata/domain/token admin subsections')
    expect(doc).toContain('expected DNS verification-not-yet guidance')
    expect(doc).toContain('one-time token visibility')
    expect(doc).toContain('Runtime public intake routing remains intentionally unwired.')
    expect(doc).toContain('raw Supabase/database, token, route, raw id, or exception details')

    for (const boundary of [
      'access production',
      'apply migrations',
      'change operational RLS',
      'change parish settings save semantics',
      'change staff access semantics',
      'change public-intake-routing API semantics',
      'mutate records beyond existing parish settings, staff access, and public-intake-routing admin saves',
      'run exports',
      'call AI',
      'make public trust claims',
    ]) {
      expect(doc).toContain(boundary)
    }
  })
})
