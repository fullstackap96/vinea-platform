import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function source(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8')
}

function expectBefore(value: string, earlier: string, later: string): void {
  const earlierIndex = value.indexOf(earlier)
  const laterIndex = value.indexOf(later)

  expect(earlierIndex, `Missing earlier anchor: ${earlier}`).toBeGreaterThanOrEqual(0)
  expect(laterIndex, `Missing later anchor: ${later}`).toBeGreaterThanOrEqual(0)
  expect(earlierIndex, `Expected ${earlier} before ${later}`).toBeLessThan(laterIndex)
}

describe('Google Calendar event JSON body size boundary', () => {
  it.each([
    ['create', 'const insertRes = await calendar.events.insert'],
    ['update', 'const patchRes = await calendar.events.patch'],
    ['delete', 'await calendar.events.delete'],
  ])('keeps %s authorization and scope checks before bounded external work', (action, mutation) => {
    const route = source(`app/api/google/calendar-event/${action}/route.ts`)

    expect(route).toContain('const MAX_BODY_BYTES = 16 * 1024')
    expect(route).toContain('const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)')
    expect(route).toContain("{ status: parsedBody.reason === 'too_large' ? 413 : 400 }")
    expect(route).toContain("error: 'Invalid Google Calendar request.'")
    expect(route).not.toContain('request.json()')

    expectBefore(route, 'const staff = await requireStaffFromRequest(request)', 'const parsedBody = await readBoundedJsonBody')
    expectBefore(route, 'const parsedBody = await readBoundedJsonBody', 'const requestedParishId = activeParishCookie(request)')
    expectBefore(route, 'const requestedParishId = activeParishCookie(request)', mutation)
  })

  it('documents the no-mutation and selected-parish boundaries', () => {
    const doc = source('docs/GOOGLE_CALENDAR_EVENT_BODY_SIZE_BOUNDARY_20260709.md')

    for (const required of [
      'GOOGLE_CALENDAR_EVENT_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709',
      '`16 KiB`',
      'Staff authentication remains before bounded parsing',
      'Active-parish membership, request ownership, and selected-calendar checks remain unchanged',
      'No Google Calendar event was created, updated, or deleted during verification',
      'does not access production',
    ]) {
      expect(doc).toContain(required)
    }
  })
})
