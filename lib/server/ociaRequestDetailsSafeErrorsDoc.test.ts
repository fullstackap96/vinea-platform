import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const docPath = 'docs/OCIA_REQUEST_DETAILS_SAFE_ERRORS_20260707.md'

describe('OCIA request details safe errors documentation', () => {
  it('documents the OCIA request details safe-error boundary', () => {
    const doc = readFileSync(join(process.cwd(), docPath), 'utf8')

    expect(doc).toContain('# OCIA Request Details Safe Errors - 2026-07-07')
    expect(doc).toContain('`lib/ensureOciaRequestDetails.ts`')
    expect(doc).toContain('stable staff-safe messages')
    expect(doc).toContain('Could not access the OCIA intake record. Please try again.')
    expect(doc).toContain('Could not prepare the OCIA intake record. Please try again.')

    for (const boundary of [
      'generate certificates',
      'make sacramental/canonical eligibility decisions',
      'alter selected active parish scope',
      'apply migrations',
      'change operational RLS',
      'enable production flags',
      'make public trust claims',
    ]) {
      expect(doc).toContain(boundary)
    }
  })
})
