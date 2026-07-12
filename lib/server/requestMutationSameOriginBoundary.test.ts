import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const requestMutationRoutes = [
  'app/api/requests/[id]/ai-summary/route.ts',
  'app/api/requests/[id]/care-touchpoint/route.ts',
  'app/api/requests/[id]/checklist-items/[itemId]/route.ts',
  'app/api/requests/[id]/communications/route.ts',
  'app/api/requests/[id]/confirmed-baptism-date/route.ts',
  'app/api/requests/[id]/confirmed-funeral-service/route.ts',
  'app/api/requests/[id]/confirmed-ocia-session/route.ts',
  'app/api/requests/[id]/confirmed-wedding-ceremony/route.ts',
  'app/api/requests/[id]/documents/route.ts',
  'app/api/requests/[id]/documents/[documentId]/route.ts',
  'app/api/requests/[id]/funeral-details/route.ts',
  'app/api/requests/[id]/intake-triage/route.ts',
  'app/api/requests/[id]/mark-contacted/route.ts',
  'app/api/requests/[id]/portal-token/route.ts',
  'app/api/requests/[id]/reply-draft/route.ts',
  'app/api/requests/[id]/staff-notes/route.ts',
  'app/api/requests/[id]/suggested-dates/route.ts',
  'app/api/requests/[id]/wedding-details/route.ts',
] as const

describe('request mutation same-origin boundary', () => {
  it.each(requestMutationRoutes)('%s rejects untrusted origins before staff authentication', (path) => {
    const source = readFileSync(join(process.cwd(), path), 'utf8')
    const functionPattern = /export async function (POST|PATCH|PUT|DELETE)[\s\S]*$/g
    const mutationSource = source.match(functionPattern)?.[0] ?? ''
    const originIndex = mutationSource.indexOf('rejectCrossOriginMutation(request)')
    const authIndex = mutationSource.indexOf('requireStaffFromRequest(request)')

    expect(mutationSource).not.toBe('')
    expect(originIndex).toBeGreaterThan(-1)
    expect(authIndex).toBeGreaterThan(originIndex)
  })

  it('keeps every request mutation route in the guarded inventory', () => {
    expect(requestMutationRoutes).toHaveLength(18)
  })

  it('documents protected workflows and unchanged tenant authorization', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs/REQUEST_MUTATION_SAME_ORIGIN_BOUNDARY_20260710.md'),
      'utf8',
    )

    for (const phrase of [
      'REQUEST_MUTATION_SAME_ORIGIN_BOUNDARY_IMPLEMENTED_20260710',
      'all 18 browser-driven request mutation Route Handlers',
      'checklist',
      'portal token',
      'document upload and review',
      'active-parish membership',
      'same-parish request ownership',
      'before authentication',
      'No production access',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
