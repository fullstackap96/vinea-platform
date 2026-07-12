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

describe('AI route JSON body size boundary', () => {
  it.each([
    [
      'summary',
      'const staff = await requireStaffFromRequest(request)',
      'const gate = getAiSummarySafetyRuntimeGate()',
      'await openai.responses.create',
    ],
    [
      'reply',
      'const staff = await authorizeStaffUser(user)',
      'const gate = getAiReplySafetyRuntimeGate()',
      'await openai.responses.create',
    ],
  ])('bounds %s after staff auth and before safety gates or OpenAI', (routeName, auth, gate, provider) => {
    const route = source(`app/api/ai/${routeName}/route.ts`)

    expect(route).toContain('const MAX_BODY_BYTES = 256 * 1024')
    expect(route).toContain('const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)')
    expect(route).toContain("'AI request is too large.'")
    expect(route).toContain("'Invalid request.'")
    expect(route).not.toContain('request.json()')

    expectBefore(route, auth, 'const parsedBody = await readBoundedJsonBody')
    expectBefore(route, 'const parsedBody = await readBoundedJsonBody', gate)
    expectBefore(route, gate, provider)
  })

  it('documents unchanged AI safety-chain and production boundaries', () => {
    const doc = source('docs/AI_ROUTE_BODY_SIZE_BOUNDARY_20260709.md')

    for (const required of [
      'AI_ROUTE_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709',
      '`256 KiB`',
      'Authentication remains before body parsing',
      'All summary/reply safety-chain gates remain after bounded parsing and before OpenAI',
      'Valid flag-off legacy behavior remains unchanged',
      'does not call OpenAI during verification',
      'does not enable production AI flags',
    ]) {
      expect(doc).toContain(required)
    }
  })
})
