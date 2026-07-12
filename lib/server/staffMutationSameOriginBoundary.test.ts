import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const guardedStaffRoutes = [
  'app/api/ai/reply/route.ts',
  'app/api/ai/summary/route.ts',
  'app/api/audit-events/route.ts',
  'app/api/google/calendar-event/create/route.ts',
  'app/api/google/calendar-event/delete/route.ts',
  'app/api/google/calendar-event/update/route.ts',
  'app/api/households/duplicates/route.ts',
  'app/api/imports/route.ts',
  'app/api/mass-intentions/[id]/intake-triage/route.ts',
  'app/api/parish/daily-brief/route.ts',
  'app/api/parish/public-intake-routing/route.ts',
  'app/api/parish/settings/route.ts',
  'app/api/parish/staff-users/route.ts',
  'app/api/parish/workflow-templates/route.ts',
  'app/api/people/duplicates/route.ts',
  'app/api/records/[id]/certificate/route.ts',
] as const

const intentionallySeparateRoutes = [
  'app/api/demo-request/route.ts',
  'app/api/intake/route.ts',
  'app/api/request-notifications/route.ts',
  'app/api/family/request-portal/[token]/documents/route.ts',
] as const

function mutationFunctions(source: string): string[] {
  const starts = [...source.matchAll(/export async function (POST|PATCH|PUT|DELETE)/g)].map(
    (match) => match.index,
  )
  return starts.map((start, index) => source.slice(start, starts[index + 1] ?? source.length))
}

describe('remaining staff mutation same-origin boundary', () => {
  it.each(guardedStaffRoutes)('%s guards every mutation before authentication', (path) => {
    const source = readFileSync(join(process.cwd(), path), 'utf8')
    const functions = mutationFunctions(source)

    expect(functions.length).toBeGreaterThan(0)
    for (const functionSource of functions) {
      const originIndex = functionSource.indexOf('rejectCrossOriginMutation(request)')
      const staffAuthIndex = functionSource.indexOf('requireStaffFromRequest(request)')
      const userAuthIndex = functionSource.indexOf('.auth.getUser()')
      const authIndexes = [staffAuthIndex, userAuthIndex].filter((value) => value >= 0)

      expect(originIndex).toBeGreaterThan(-1)
      expect(authIndexes.length).toBeGreaterThan(0)
      expect(Math.min(...authIndexes)).toBeGreaterThan(originIndex)
    }
  })

  it('covers the complete reviewed staff cohort', () => {
    const mutationCount = guardedStaffRoutes.reduce((count, path) => {
      const source = readFileSync(join(process.cwd(), path), 'utf8')
      return count + mutationFunctions(source).length
    }, 0)

    expect(guardedStaffRoutes).toHaveLength(16)
    expect(mutationCount).toBe(18)
  })

  it('keeps public and token-scoped routes outside the staff-auth cohort but origin guarded', () => {
    for (const path of intentionallySeparateRoutes) {
      const source = readFileSync(join(process.cwd(), path), 'utf8')
      expect(source).toContain('rejectCrossOriginMutation(request)')
      expect(guardedStaffRoutes).not.toContain(path)
    }
  })

  it('documents the reviewed scope and exclusions', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs/STAFF_MUTATION_SAME_ORIGIN_BOUNDARY_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'STAFF_MUTATION_SAME_ORIGIN_BOUNDARY_IMPLEMENTED_20260711',
      '18 staff-only mutation methods',
      'AI generation',
      'Google Calendar event lifecycle',
      'duplicate merges',
      'parish administration',
      'Public and token-scoped mutation routes remain outside this staff-authenticated cohort',
      'all-API mutation boundary',
      'No provider call',
      'No production access',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
