import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('safe error logging key redaction documentation', () => {
  it('documents the central sensitive-key redaction boundary', () => {
    const doc = readRepoFile('docs/SAFE_ERROR_LOGGING_KEY_REDACTION_20260707.md')
    const source = readRepoFile('lib/server/safeErrorLogging.ts')

    expect(doc).toContain('Safe Error Logging Key Redaction - 2026-07-07')
    expect(doc).toContain('redacts sensitive extra fields by key name')
    expect(doc).toContain('masks sensitive key/value payloads')
    expect(doc).toContain('collapse to generic `[redacted key]` markers')
    expect(doc).toContain('String extra fields with sensitive key names')
    expect(doc).toContain('Free-form text containing sensitive key/value pairs')
    expect(doc).toContain('[redacted key]=[redacted]')
    expect(doc).toContain('[redacted key]%3D[redacted]')
    expect(doc).toContain('"[redacted key]":"[redacted]"')
    expect(doc).toContain('Boolean and numeric evidence flags')
    expect(doc).toContain('hasActorEmail: true')
    expect(doc).toContain('[redacted by key]')
    expect(doc).toContain('does not alter route behavior')
    expect(doc).toContain('does not alter route behavior, staff authorization')
    expect(doc).toContain('operational RLS')
    expect(doc).toContain('public trust claims')

    for (const keyFamily of [
      'token',
      'secret',
      'password',
      'signed URL',
      'database URL',
      'service role',
      'anon key',
      'original filename',
      'storage path',
      'document content',
      'raw payload',
      'portal',
      'access token',
      'refresh token',
      'family portal token',
      'AWS signed URL signature',
      'raw AI prompt',
      'provider payload',
    ]) {
      expect(doc).toContain(keyFamily)
    }

    for (const marker of [
      'access[_-]?token',
      'refresh[_-]?token',
      'signed[_-]?url',
      'storage[_-]?path',
      'original[_-]?filename',
      'raw[_-]?prompt',
      'provider[_-]?payload',
      'x-amz-signature',
    ]) {
      expect(source).toContain(marker)
    }

    expect(source).toContain('SENSITIVE_EXTRA_KEY_PATTERN')
    expect(source).toContain("'[redacted by key]'")
    expect(source).toContain("'[redacted key]=[redacted]'")
    expect(source).toContain("'[redacted key]%3D[redacted]'")
    expect(source).toContain('console.error(redactSensitiveLogText(context)')
    expect(source).toContain('console.warn(redactSensitiveLogText(context)')
  })
})
