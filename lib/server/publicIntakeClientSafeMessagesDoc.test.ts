import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const docPath = 'docs/PUBLIC_INTAKE_CLIENT_SAFE_MESSAGES_20260707.md'

describe('public intake client safe messages documentation', () => {
  it('documents the public form client-message boundary', () => {
    const doc = readFileSync(join(repoRoot, docPath), 'utf8')

    expect(doc).toContain('# Public Intake Client Safe Messages - 2026-07-07')
    expect(doc).toContain('`lib/publicIntakeClientMessages.ts`')
    expect(doc).toContain('`app/baptism-request/page.tsx`')
    expect(doc).toContain('`app/wedding-request/page.tsx`')
    expect(doc).toContain('`app/funeral-request/page.tsx`')
    expect(doc).toContain('`app/ocia-request/page.tsx`')
    expect(doc).toContain('`app/join-parish-request/page.tsx`')
    expect(doc).toContain('allowlisted public validation and rate-limit messages')
    expect(doc).toContain('raw Supabase/database, route, provider, token, storage, or exception details')

    for (const boundary of [
      'access production',
      'apply migrations',
      'change operational RLS',
      'enable runtime public intake routing',
      'send new communications',
      'run exports',
      'call AI',
      'access storage',
      'make public trust claims',
    ]) {
      expect(doc).toContain(boundary)
    }
  })
})
