import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const docPath = 'docs/RECORD_CERTIFICATE_ROUTE_SAFE_ERRORS_20260707.md'

describe('record certificate route safe errors documentation', () => {
  it('documents the baptism certificate route safe-error boundary', () => {
    const doc = readFileSync(join(repoRoot, docPath), 'utf8')

    expect(doc).toContain('# Record Certificate Route Safe Errors - 2026-07-07')
    expect(doc).toContain('`app/api/records/[id]/certificate/route.ts`')
    expect(doc).toContain('shared safe server logging helper')
    expect(doc).toContain('raw `rowErr.message`, `eventErr.message`, or unexpected exception messages')
    expect(doc).toContain('Expected staff messages remain unchanged')

    for (const safeMessage of [
      'Could not load sacramental record.',
      'Could not log certificate generation.',
      'Could not generate certificate.',
    ]) {
      expect(doc).toContain(safeMessage)
    }

    for (const boundary of [
      'access production',
      'apply migrations',
      'change operational RLS',
      'change staff authentication',
      'broaden certificate eligibility',
      'generate certificates automatically',
      'add correction or notation behavior',
      'mutate sacramental records beyond the existing `certificate_generated` event',
      'run exports',
      'call AI',
      'make public trust claims',
    ]) {
      expect(doc).toContain(boundary)
    }
  })
})
