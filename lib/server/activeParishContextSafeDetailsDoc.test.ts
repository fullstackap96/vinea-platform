import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('active parish context safe technical detail documentation', () => {
  it('documents and preserves redaction for active-parish context technical details', () => {
    const doc = readRepoFile('docs/ACTIVE_PARISH_CONTEXT_SAFE_DETAILS_20260707.md')
    const readContextSource = readRepoFile('lib/server/staffParishContext.ts')
    const writeContextSource = readRepoFile('lib/server/staffWriteParishContext.ts')

    expect(doc).toContain('Active Parish Context Safe Technical Details - 2026-07-07')
    expect(doc).toContain('technicalDetail')
    expect(doc).toContain('fallbackReason')
    expect(doc).toContain('shared sensitive-log redaction helper')
    expect(doc).toContain('does not alter staff authentication')
    expect(doc).toContain('operational RLS')
    expect(doc).toContain('public trust claims')

    for (const source of [readContextSource, writeContextSource]) {
      expect(source).toContain('redactSensitiveLogText')
      expect(source).toContain('function safeTechnicalDetail')
      expect(source).not.toContain('technicalDetail: error.message')
    }

    expect(readContextSource).not.toContain('fallbackReason: `Parish display rows were not loaded: ${parishError.message}`')
    expect(writeContextSource).not.toContain(': error.message)')
  })
})
