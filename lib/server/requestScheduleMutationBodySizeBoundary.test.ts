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

describe('request schedule mutation body size boundary', () => {
  it.each([
    ['suggested-dates', 'suggested_date_1: suggestedDate1'],
    ['confirmed-baptism-date', 'confirmed_baptism_date: confirmedBaptismDate'],
    ['confirmed-funeral-service', 'confirmed_service_at: confirmedServiceAt'],
    ['confirmed-wedding-ceremony', 'confirmed_ceremony_at: confirmedCeremonyAt'],
    ['confirmed-ocia-session', 'confirmed_session_at: confirmedSessionAt'],
  ])('bounds %s after auth and before request access or schedule writes', (routeName, update) => {
    const route = source(`app/api/requests/[id]/${routeName}/route.ts`)

    expect(route).toContain('const MAX_BODY_BYTES = 32 * 1024')
    expect(route).toContain('const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)')
    expect(route).toContain('Schedule update is too large.')
    expect(route).toContain('{ status: 413 }')
    expect(route).not.toContain('request.json()')

    expectBefore(route, 'const staff = await requireStaffFromRequest(request)', 'const parsedBody = await readBoundedJsonBody')
    expectBefore(route, 'const parsedBody = await readBoundedJsonBody', 'const admin = createSupabaseServiceRoleClient()')
    expectBefore(route, 'const access = await loadStaffScopedRequestDetailAccess', update)
  })

  it('documents unchanged ownership, request-type, and no-write behavior', () => {
    const doc = source('docs/REQUEST_SCHEDULE_MUTATION_BODY_SIZE_BOUNDARY_20260709.md')

    for (const required of [
      'REQUEST_SCHEDULE_MUTATION_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709',
      '`32 KiB`',
      'Staff authentication remains before bounded parsing',
      'Active-parish request ownership and request-type checks remain before writes',
      'Rejected bodies do not update suggested or confirmed dates',
      'does not contact Google Calendar',
    ]) {
      expect(doc).toContain(required)
    }
  })
})
