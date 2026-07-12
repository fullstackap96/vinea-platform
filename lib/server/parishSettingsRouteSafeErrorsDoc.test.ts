import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const docPath = 'docs/PARISH_SETTINGS_ROUTE_SAFE_ERRORS_20260707.md'

describe('parish settings route safe errors documentation', () => {
  it('documents the Parish Settings API safe-error boundary', () => {
    const doc = readFileSync(join(repoRoot, docPath), 'utf8')

    expect(doc).toContain('# Parish Settings Route Safe Errors - 2026-07-07')
    expect(doc).toContain('`app/api/parish/settings/route.ts`')
    expect(doc).toContain('shared safe server logging helper')
    expect(doc).toContain('raw `parishErr.message`, `updateErr.message`, or unexpected exception messages')
    expect(doc).toContain('Expected staff messages remain unchanged')

    for (const safeMessage of [
      'Could not load parish settings.',
      'Could not update parish settings.',
      'Parish not found.',
    ]) {
      expect(doc).toContain(safeMessage)
    }

    for (const boundary of [
      'access production',
      'apply migrations',
      'change operational RLS',
      'change active-parish or membership authorization',
      'change parish settings validation rules',
      'change parish settings save semantics',
      'change Daily Brief behavior',
      'change Staff Access behavior',
      'change Workflow Templates behavior',
      'change Public Intake Routing behavior',
      'run exports',
      'call AI',
      'make public trust claims',
    ]) {
      expect(doc).toContain(boundary)
    }
  })
})
