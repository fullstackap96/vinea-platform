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

describe('request text mutation body size boundary', () => {
  it.each([
    ['staff-notes', 'Staff notes are too large.', 'staff_notes: staffNotes'],
    ['ai-summary', 'AI summary is too large.', 'ai_summary: aiSummary'],
    ['reply-draft', 'Reply draft is too large.', 'reply_draft: replyDraft'],
  ])('bounds %s after auth and before request access or update', (routeName, error, update) => {
    const route = source(`app/api/requests/[id]/${routeName}/route.ts`)

    expect(route).toContain('const MAX_BODY_BYTES = 256 * 1024')
    expect(route).toContain('const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)')
    expect(route).toContain(error)
    expect(route).toContain('{ status: 413 }')
    expect(route).not.toContain('request.json()')

    expectBefore(route, 'const staff = await requireStaffFromRequest(request)', 'const parsedBody = await readBoundedJsonBody')
    expectBefore(route, 'const parsedBody = await readBoundedJsonBody', 'const admin = createSupabaseServiceRoleClient()')
    expectBefore(route, 'const access = await loadStaffScopedRequestDetailAccess', update)
  })

  it('documents unchanged ownership and no-write rejection behavior', () => {
    const doc = source('docs/REQUEST_TEXT_MUTATION_BODY_SIZE_BOUNDARY_20260709.md')

    for (const required of [
      'REQUEST_TEXT_MUTATION_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709',
      '`256 KiB`',
      'Staff authentication remains before bounded parsing',
      'Active-parish request ownership remains before database updates',
      'Rejected bodies do not update staff notes, saved AI summaries, or reply drafts',
      'does not call AI or send communications',
    ]) {
      expect(doc).toContain(required)
    }
  })
})
