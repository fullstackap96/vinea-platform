import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function source(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8')
}

function handler(route: string, method: 'POST' | 'PATCH'): string {
  const start = route.indexOf(`export async function ${method}`)
  expect(start).toBeGreaterThanOrEqual(0)
  const next = route.indexOf('\nexport async function ', start + 1)
  return route.slice(start, next < 0 ? undefined : next)
}

function expectBefore(value: string, earlier: string, later: string): void {
  const earlierIndex = value.indexOf(earlier)
  const laterIndex = value.indexOf(later)
  expect(earlierIndex, `Missing earlier anchor: ${earlier}`).toBeGreaterThanOrEqual(0)
  expect(laterIndex, `Missing later anchor: ${later}`).toBeGreaterThanOrEqual(0)
  expect(earlierIndex, `Expected ${earlier} before ${later}`).toBeLessThan(laterIndex)
}

describe('public intake routing body size boundary', () => {
  const route = source('app/api/parish/public-intake-routing/route.ts')

  it.each(['POST', 'PATCH'] as const)(
    'bounds %s after staff auth and before parish/domain/token work',
    (method) => {
      const block = handler(route, method)

      expect(route).toContain('const MAX_BODY_BYTES = 32 * 1024')
      expect(block).toContain('const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)')
      expect(block).toContain('Public intake routing update is too large.')
      expect(block).not.toContain('request.json()')

      expectBefore(block, 'const staff = await requireStaffFromRequest(request)', 'const parsedBody = await readBoundedJsonBody')
      expectBefore(block, 'const parsedBody = await readBoundedJsonBody', 'const admin = createSupabaseServiceRoleClient()')
      expectBefore(block, 'const parsedBody = await readBoundedJsonBody', 'resolvePublicIntakeRoutingWriteParishId(')
      expectBefore(block, 'resolvePublicIntakeRoutingWriteParishId(', ".from('parish_public_intake_")
      expectBefore(block, ".from('parish_public_intake_", 'await writeAuditEvent({')
    },
  )

  it('keeps raw token creation and DNS verification after accepted scope only', () => {
    const post = handler(route, 'POST')
    const patch = handler(route, 'PATCH')

    expectBefore(post, 'resolvePublicIntakeRoutingWriteParishId(', 'generateRawPublicIntakeToken()')
    expectBefore(post, 'resolvePublicIntakeRoutingWriteParishId(', 'domainVerificationChallenge(')
    expectBefore(patch, 'resolvePublicIntakeRoutingWriteParishId(', 'verifyDomainDnsTxt(')
  })

  it('documents the disabled runtime-routing and rejected-body boundary', () => {
    const doc = source('docs/PUBLIC_INTAKE_ROUTING_ADMIN_BODY_SIZE_BOUNDARY_20260709.md')

    for (const required of [
      'PUBLIC_INTAKE_ROUTING_ADMIN_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709',
      '`32 KiB`',
      'Staff authentication remains before bounded parsing',
      'Rejected bodies do not resolve active-parish write scope',
      'Rejected bodies do not generate or hash tokens',
      'Rejected bodies do not perform DNS verification',
      'Runtime public intake routing remains disabled by default and unchanged',
    ]) {
      expect(doc).toContain(required)
    }
  })
})
