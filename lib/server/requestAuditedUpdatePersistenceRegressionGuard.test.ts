import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

type ReviewedRoute = {
  path: string
  confirmation: string
  completionMethod: '.maybeSingle()' | '.single()'
  auditMarker: string
}

const reviewedRoutes: readonly ReviewedRoute[] = [
  {
    path: 'app/api/requests/[id]/ai-summary/route.ts',
    confirmation: '!updatedRequest?.id',
    completionMethod: '.maybeSingle()',
    auditMarker: 'await writeAuditEvent',
  },
  {
    path: 'app/api/requests/[id]/checklist-items/[itemId]/route.ts',
    confirmation: '!updatedItem?.id',
    completionMethod: '.maybeSingle()',
    auditMarker: 'await writeAuditEvent',
  },
  {
    path: 'app/api/requests/[id]/confirmed-baptism-date/route.ts',
    confirmation: '!updatedRequest?.id',
    completionMethod: '.maybeSingle()',
    auditMarker: 'await writeAuditEvent',
  },
  {
    path: 'app/api/requests/[id]/confirmed-funeral-service/route.ts',
    confirmation: '!updatedDetail?.request_id',
    completionMethod: '.maybeSingle()',
    auditMarker: 'await writeAuditEvent',
  },
  {
    path: 'app/api/requests/[id]/confirmed-ocia-session/route.ts',
    confirmation: '!updatedDetail?.request_id',
    completionMethod: '.maybeSingle()',
    auditMarker: 'await writeAuditEvent',
  },
  {
    path: 'app/api/requests/[id]/confirmed-wedding-ceremony/route.ts',
    confirmation: '!updatedDetail?.request_id',
    completionMethod: '.maybeSingle()',
    auditMarker: 'await writeAuditEvent',
  },
  {
    path: 'app/api/requests/[id]/documents/[documentId]/route.ts',
    confirmation: '.single()',
    completionMethod: '.single()',
    auditMarker: 'await writeAuditEvent',
  },
  {
    path: 'app/api/requests/[id]/intake-triage/route.ts',
    confirmation: 'updateError || !updatedRequest?.id',
    completionMethod: '.maybeSingle()',
    auditMarker: 'await auditIntakeTriage({',
  },
  {
    path: 'app/api/requests/[id]/reply-draft/route.ts',
    confirmation: '!updatedRequest?.id',
    completionMethod: '.maybeSingle()',
    auditMarker: 'await writeAuditEvent',
  },
  {
    path: 'app/api/requests/[id]/staff-notes/route.ts',
    confirmation: '!updatedRequest?.id',
    completionMethod: '.maybeSingle()',
    auditMarker: 'await writeAuditEvent',
  },
  {
    path: 'app/api/requests/[id]/suggested-dates/route.ts',
    confirmation: '!updatedRequest?.id',
    completionMethod: '.maybeSingle()',
    auditMarker: 'await writeAuditEvent',
  },
] as const

const separatelyReviewedMultiStageRoutes = new Set([
  'app/api/requests/[id]/care-touchpoint/route.ts',
  'app/api/requests/[id]/communications/route.ts',
  'app/api/requests/[id]/mark-contacted/route.ts',
])

function collectRouteFiles(directory: string): string[] {
  if (!existsSync(directory)) return []

  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    const stats = statSync(path)
    if (stats.isDirectory()) return collectRouteFiles(path)
    return entry === 'route.ts' ? [path] : []
  })
}

function relativePath(path: string) {
  return relative(process.cwd(), path).replaceAll('\\', '/')
}

describe('audited request update persistence regression guard', () => {
  it('keeps the single-row audited update inventory explicit and complete', () => {
    const discovered = collectRouteFiles(join(process.cwd(), 'app', 'api', 'requests'))
      .map((path) => ({ path: relativePath(path), source: readFileSync(path, 'utf8') }))
      .filter(({ source }) => source.includes('.update(') && source.includes('writeAuditEvent'))
      .map(({ path }) => path)
      .filter((path) => !separatelyReviewedMultiStageRoutes.has(path))
      .sort()

    expect(discovered).toEqual(reviewedRoutes.map((route) => route.path).sort())
  })

  it.each(reviewedRoutes)(
    '$path confirms persistence before route-owned audit history',
    ({ path, confirmation, completionMethod, auditMarker }) => {
      const source = readFileSync(join(process.cwd(), path), 'utf8')
      const updateIndex = source.indexOf('.update(')
      const completionIndex = source.indexOf(completionMethod, updateIndex)
      const confirmationIndex = source.indexOf(confirmation, updateIndex)
      const auditIndex = source.indexOf(auditMarker, updateIndex)

      expect(updateIndex).toBeGreaterThan(-1)
      expect(source.indexOf('.select(', updateIndex)).toBeGreaterThan(updateIndex)
      expect(completionIndex).toBeGreaterThan(updateIndex)
      expect(confirmationIndex).toBeGreaterThanOrEqual(completionIndex)
      expect(auditIndex).toBeGreaterThan(confirmationIndex)
    },
  )

  it('documents scope, multi-stage exclusions, and production boundaries', () => {
    const evidence = readFileSync(
      join(
        process.cwd(),
        'docs',
        'REQUEST_AUDITED_UPDATE_PERSISTENCE_REGRESSION_BOUNDARY_20260711.md',
      ),
      'utf8',
    )

    for (const phrase of [
      'REQUEST_AUDITED_UPDATE_PERSISTENCE_REGRESSION_BOUNDARY_IMPLEMENTED_20260711',
      '11 single-row audited request mutation routes',
      'positive persistence confirmation',
      'care-touchpoint, communications, and mark-as-contacted',
      'does not replace route-specific authorization or validation tests',
      'No production access',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
