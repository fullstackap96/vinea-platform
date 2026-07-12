import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('parish Google Calendar server safe errors', () => {
  it('uses redacted server logging when auth-error status updates fail', () => {
    const source = readRepoFile('lib/parishGoogleCalendarServer.ts')

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain(
      "logServerError('[google-calendar] auth-error status update failed', error"
    )
    expect(source).toContain("action: 'mark-auth-error'")
    expect(source).not.toContain(
      "console.error('markParishGoogleCalendarAuthError failed'"
    )
  })
})
