import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('request detail client safe messages documentation', () => {
  it('documents the client-message boundary and no-go scope', () => {
    const doc = readRepoFile('docs/REQUEST_DETAIL_CLIENT_SAFE_MESSAGES_20260707.md')

    expect(doc).toContain('# Request Detail Client Safe Messages - 2026-07-07')
    expect(doc).toContain('`lib/requestDetailClientMessages.ts`')
    expect(doc).toContain('request access check and request activity loader')
    expect(doc).toContain('Request access verification fallback')
    expect(doc).toContain('Google Calendar create/update/delete generic failure text')
    expect(doc).toContain('preserving the existing OAuth reconnect guidance')

    for (const boundary of [
      'does not alter staff authentication',
      'request authorization',
      'selected active parish scope',
      'AI gates',
      'email delivery behavior',
      'Google Calendar event behavior',
      'production flags',
      'migrations',
      'operational RLS',
      'public trust-center claims',
    ]) {
      expect(doc).toContain(boundary)
    }
  })
})
