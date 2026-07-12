import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const docPath = 'docs/PUBLIC_INTAKE_ROUTING_ROUTE_SAFE_ERRORS_20260707.md'

describe('public intake routing route safe errors documentation', () => {
  it('documents the public intake routing route safe-error boundary', () => {
    const doc = readFileSync(join(repoRoot, docPath), 'utf8')

    expect(doc).toContain('# Public Intake Routing Route Safe Errors - 2026-07-07')
    expect(doc).toContain('`app/api/parish/public-intake-routing/route.ts`')
    expect(doc).toContain('shared safe server logging helper')
    expect(doc).toContain('raw `error.message`, `currentError.message`, or `updateError.message`')
    expect(doc).toContain('Expected validation, authorization, conflict, and DNS verification-not-yet messages')
    expect(doc).toContain('Runtime public intake routing remains intentionally unwired.')

    for (const boundary of [
      'access production',
      'apply migrations',
      'change operational RLS',
      'change Public Intake Routing validation rules',
      'change token hash storage',
      'change one-time token visibility',
      'wire runtime public intake routing',
      'run exports',
      'call AI',
      'make public trust claims',
    ]) {
      expect(doc).toContain(boundary)
    }
  })
})
