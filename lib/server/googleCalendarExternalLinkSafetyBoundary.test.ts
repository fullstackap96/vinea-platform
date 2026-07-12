import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('Google Calendar external link safety boundary', () => {
  it('keeps saved and conflict event links behind the HTTPS Google-host validator', () => {
    const source = read(
      'app/dashboard/requests/[id]/_components/GoogleCalendarSection.tsx',
    )

    expect(source).toContain('const safeEventLink = safeGoogleCalendarEventHref(eventLink)')
    expect(source).toContain(
      'const safeConflictHref = safeGoogleCalendarEventHref(c.htmlLink)',
    )
    expect(source).toContain('href={safeEventLink}')
    expect(source).toContain('href={safeConflictHref}')
    expect(source).toContain('rel="noopener noreferrer"')
    expect(source).not.toContain('href={eventLink}')
    expect(source).not.toContain('href={c.htmlLink}')
    expect(source).not.toContain("key={`${c.htmlLink")
  })

  it('documents the external-link boundary without granting production approval', () => {
    const doc = read('docs/GOOGLE_CALENDAR_EXTERNAL_LINK_SAFETY_BOUNDARY_20260710.md')
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('GOOGLE_CALENDAR_EXTERNAL_LINK_SAFETY_IMPLEMENTED_20260710')
    expect(doc).toContain('Production-sensitive features approved by this boundary: `NO`')
    expect(buildStatus).toContain('Google Calendar External Link Safety - 2026-07-10')
    expect(roadmap).toContain('Google Calendar External Link Safety boundary')
    expect(sourceOfTruth).toContain('Google Calendar External Link Safety boundary')
  })
})
