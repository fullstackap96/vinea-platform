import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const routes = [
  ['email send', 'app/api/email/send/route.ts', 'authorizeStaffUser'],
  [
    'request communications',
    'app/api/requests/[id]/communications/route.ts',
    'requireStaffFromRequest',
  ],
  [
    'mark contacted',
    'app/api/requests/[id]/mark-contacted/route.ts',
    'requireStaffFromRequest',
  ],
  [
    'care touchpoint',
    'app/api/requests/[id]/care-touchpoint/route.ts',
    'requireStaffFromRequest',
  ],
] as const

describe('staff communication same-origin mutation boundary', () => {
  it.each(routes)('%s rejects cross-origin requests before authentication or body parsing', (_, path, authMarker) => {
    const source = readFileSync(join(process.cwd(), path), 'utf8')
    const routeStart = source.indexOf('export async function POST')
    const originIndex = source.indexOf('rejectCrossOriginMutation(request)', routeStart)
    const authIndex = source.indexOf(authMarker, originIndex)
    const parseIndex = source.indexOf('readBoundedJsonBody(request', originIndex)

    expect(routeStart).toBeGreaterThan(-1)
    expect(originIndex).toBeGreaterThan(routeStart)
    expect(authIndex).toBeGreaterThan(originIndex)
    if (parseIndex >= 0) expect(parseIndex).toBeGreaterThan(authIndex)
  })

  it('keeps communication PATCH protected while leaving read-only GET unchanged', () => {
    const source = readFileSync(
      join(process.cwd(), 'app/api/requests/[id]/communications/route.ts'),
      'utf8',
    )
    const getStart = source.indexOf('export async function GET')
    const postStart = source.indexOf('export async function POST')
    const patchStart = source.indexOf('export async function PATCH')

    expect(source.slice(getStart, postStart)).not.toContain('rejectCrossOriginMutation')
    expect(source.indexOf('rejectCrossOriginMutation(request)', patchStart)).toBeGreaterThan(
      patchStart,
    )
  })

  it('documents the fail-closed boundary and preserved behavior', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs/STAFF_COMMUNICATION_SAME_ORIGIN_MUTATION_BOUNDARY_20260710.md'),
      'utf8',
    )

    for (const phrase of [
      'STAFF_COMMUNICATION_SAME_ORIGIN_MUTATION_BOUNDARY_IMPLEMENTED_20260710',
      'before authentication',
      '`Origin`',
      '`Sec-Fetch-Site`',
      '`Invalid request.`',
      'active-parish membership',
      'same-parish request ownership',
      'No communication was sent',
      'No production access',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
