import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('Google Calendar user error redaction documentation', () => {
  it('documents and preserves the staff-facing/provider-log redaction boundary', () => {
    const doc = readRepoFile('docs/GOOGLE_CALENDAR_USER_ERROR_REDACTION_20260707.md')
    const source = readRepoFile('lib/googleCalendarUserErrors.ts')

    expect(doc).toContain('Google Calendar User Error Redaction - 2026-07-07')
    expect(doc).toContain('useful reconnect guidance')
    expect(doc).toContain('generic staff-facing message')
    expect(doc).toContain('recursively redacts sensitive values')
    expect(doc).toContain('does not alter Google OAuth state')
    expect(doc).toContain('operational RLS')
    expect(doc).toContain('public trust claims')

    expect(source).toContain('sanitizeGoogleCalendarLogValue')
    expect(source).toContain('SAFE_GOOGLE_CALENDAR_USER_MESSAGES')
    expect(source).toContain('googleCalendarGenericUserMessage')
    expect(source).not.toContain("if (typeof error === 'string' && error.trim()) return error")
    expect(source).not.toContain('if (error instanceof Error && error.message.trim()) return error.message')
    expect(source).not.toContain('data,\\n      cause')
  })
})
