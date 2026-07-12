import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('request detail Google Calendar message boundary', () => {
  it('keeps conflict messages behind the curated Google Calendar staff-message helper', () => {
    const source = readRepoFile('app/dashboard/requests/[id]/page.tsx')
    const doc = readRepoFile('docs/GOOGLE_CALENDAR_USER_ERROR_REDACTION_20260707.md')
    const helper = readRepoFile('lib/googleCalendarUserErrors.ts')

    expect(source).toContain('googleCalendarConflictUserMessage')
    expect(source).toContain('userFacingGoogleCalendarErrorMessage')
    expect(source).not.toContain("String(payload?.message || 'There is already something scheduled at this time.')")

    expect(helper).toContain('googleCalendarConflictUserMessage')
    expect(helper).toContain('SAFE_GOOGLE_CALENDAR_USER_MESSAGES')

    expect(doc).toContain('Google Calendar User Error Redaction - 2026-07-07')
    expect(doc).toContain('conflict messages')
    expect(doc).toContain('request detail')
    expect(doc).toContain('not echo arbitrary API/provider text')
  })
})
