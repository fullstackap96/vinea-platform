import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const routes = [
  {
    path: 'app/api/google/calendar-event/create/route.ts',
    providerMarker: 'const insertRes = await calendar.events.insert',
    partialGuidance: 'Event created in Google Calendar, but failed saving event info to request',
  },
  {
    path: 'app/api/google/calendar-event/update/route.ts',
    providerMarker: 'const patchRes = await calendar.events.patch',
    partialGuidance: 'Event updated in Google Calendar, but failed saving link to request',
  },
  {
    path: 'app/api/google/calendar-event/delete/route.ts',
    providerMarker: 'await calendar.events.delete',
    partialGuidance:
      'Removed event from Google (or it was already gone), but failed clearing fields in database',
  },
]

describe('Google Calendar request-link persistence boundary', () => {
  for (const route of routes) {
    it(`${route.path} confirms request persistence after the provider mutation`, () => {
      const source = read(route.path)
      const providerIndex = source.indexOf(route.providerMarker)
      const updateIndex = source.indexOf(
        'const { data: updatedRequest, error: updateErr }',
        providerIndex,
      )
      const confirmationIndex = source.indexOf('!updatedRequest?.id', updateIndex)
      const auditIndex = source.indexOf('await writeAuditEvent({', confirmationIndex)
      const successIndex = source.indexOf('return NextResponse.json({ ok: true', auditIndex)

      expect(providerIndex).toBeGreaterThanOrEqual(0)
      expect(updateIndex).toBeGreaterThan(providerIndex)
      expect(source.slice(updateIndex, confirmationIndex)).toMatch(
        /\.from\('requests'\)[\s\S]*?\.update\([\s\S]*?\.eq\('id', requestId\)[\s\S]*?\.select\('id'\)[\s\S]*?\.maybeSingle\(\)/,
      )
      expect(confirmationIndex).toBeGreaterThan(updateIndex)
      expect(source).toContain(route.partialGuidance)
      expect(auditIndex).toBeGreaterThan(confirmationIndex)
      expect(successIndex).toBeGreaterThan(auditIndex)
    })
  }

  it('documents the cross-system partial-success boundary without claiming rollback', () => {
    const doc = read('docs/GOOGLE_CALENDAR_REQUEST_LINK_PERSISTENCE_BOUNDARY_20260711.md')

    for (const phrase of [
      'create, update, and delete',
      'minimal request id',
      'existing partial-success guidance',
      'does not claim provider rollback',
      'selected active-parish ownership',
      'No Google Calendar call was made',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
