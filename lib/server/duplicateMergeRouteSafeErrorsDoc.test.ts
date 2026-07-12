import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const docPath = 'docs/DUPLICATE_MERGE_ROUTE_SAFE_ERRORS_20260707.md'

describe('duplicate merge route safe errors documentation', () => {
  it('documents the people and household duplicate merge safe-error boundary', () => {
    const doc = readFileSync(join(repoRoot, docPath), 'utf8')

    expect(doc).toContain('# Duplicate Merge Route Safe Errors - 2026-07-07')
    expect(doc).toContain('`app/api/people/duplicates/route.ts`')
    expect(doc).toContain('`app/api/households/duplicates/route.ts`')
    expect(doc).toContain('shared safe server logging helper')
    expect(doc).toContain('raw Supabase/database `.message` values')
    expect(doc).toContain('Expected staff messages remain unchanged')

    for (const safeMessage of [
      'Could not load duplicate review.',
      'Could not merge these people.',
      'Could not load household review.',
      'Could not merge these households.',
    ]) {
      expect(doc).toContain(safeMessage)
    }

    for (const boundary of [
      'access production',
      'apply migrations',
      'change operational RLS',
      'change active-parish or membership authorization',
      'change duplicate candidate detection',
      'change merge semantics',
      'mutate records beyond the existing staff-triggered duplicate merge routes',
      'run exports',
      'call AI',
      'make public trust claims',
    ]) {
      expect(doc).toContain(boundary)
    }
  })
})
