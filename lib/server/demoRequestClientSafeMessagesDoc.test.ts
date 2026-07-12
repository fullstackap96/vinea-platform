import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const docPath = 'docs/DEMO_REQUEST_CLIENT_SAFE_MESSAGES_20260707.md'

describe('demo request client safe messages documentation', () => {
  it('documents the landing demo form client-message boundary', () => {
    const doc = readFileSync(join(repoRoot, docPath), 'utf8')

    expect(doc).toContain('# Demo Request Client Safe Messages - 2026-07-07')
    expect(doc).toContain('`lib/demoRequestClientMessages.ts`')
    expect(doc).toContain('`app/_components/landing/ScheduleDemoForm.tsx`')
    expect(doc).toContain('allowlisted public validation and availability messages')
    expect(doc).toContain('raw provider, route, database, token, email, or exception details')

    for (const boundary of [
      'access production',
      'apply migrations',
      'change operational RLS',
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
