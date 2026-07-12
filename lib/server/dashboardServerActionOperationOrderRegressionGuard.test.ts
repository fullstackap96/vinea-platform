import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const exportedActionPattern = /export async function ([A-Za-z0-9_]+)/g
const scopeMarkers = [
  'loadRequestActionAccess(',
  'resolveStaffWriteParishContext(',
  'resolveHouseholdWriteContext(',
  'resolveSacramentalRecordWriteContext(',
] as const
const sideEffectMarkers = [
  '.insert(',
  '.update(',
  '.upsert(',
  '.delete(',
  'clearOtherPrimaryContacts(',
  'linkRequestToPersonId(',
] as const

function actionFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    const stats = statSync(path)
    if (stats.isDirectory()) return actionFiles(path)
    return entry === 'actions.ts' ? [path] : []
  })
}

function exportedActionBlocks(source: string) {
  const actions = [...source.matchAll(exportedActionPattern)]
  return actions.map((match, index) => ({
    name: match[1],
    source: source.slice(match.index, actions[index + 1]?.index ?? source.length),
  }))
}

function firstIndex(source: string, markers: readonly string[], start = 0): number {
  const indexes = markers
    .map((marker) => source.indexOf(marker, start))
    .filter((index) => index >= 0)
  return indexes.length > 0 ? Math.min(...indexes) : -1
}

function relativePath(path: string) {
  return relative(process.cwd(), path).replaceAll('\\', '/')
}

describe('dashboard Server Action operation-order regression guard', () => {
  it('keeps every discovered operational mutation behind user auth and parish scope', () => {
    let reviewedActionCount = 0
    const findings = actionFiles(join(process.cwd(), 'app', 'dashboard')).flatMap((path) =>
      exportedActionBlocks(readFileSync(path, 'utf8')).flatMap((action) => {
        const sideEffectIndex = firstIndex(action.source, sideEffectMarkers)
        if (sideEffectIndex < 0) return []

        reviewedActionCount += 1
        const authIndex = action.source.indexOf('supabase.auth.getUser()')
        const authDenialIndex = action.source.indexOf('if (userError || !user)', authIndex)
        const scopeIndex = firstIndex(action.source, scopeMarkers, authDenialIndex)
        const accessDenialIndexes = [
          action.source.indexOf('if (!access)', scopeIndex),
          action.source.indexOf('if (!parishContext.ok)', scopeIndex),
        ].filter((index) => index >= 0)
        const scopeDenialIndex =
          accessDenialIndexes.length > 0 ? Math.min(...accessDenialIndexes) : -1
        const label = `${relativePath(path)} ${action.name}`
        const actionFindings: string[] = []

        if (authIndex < 0 || authDenialIndex <= authIndex) {
          actionFindings.push(`${label}: missing fail-closed authenticated user boundary`)
        }
        if (scopeIndex <= authDenialIndex) {
          actionFindings.push(`${label}: parish/request scope is not after authentication`)
        }
        if (scopeDenialIndex <= scopeIndex) {
          actionFindings.push(`${label}: missing fail-closed scope denial`)
        }
        if (sideEffectIndex <= scopeDenialIndex) {
          actionFindings.push(`${label}: first operational side effect is not after scope denial`)
        }

        return actionFindings
      }),
    )

    expect(reviewedActionCount).toBe(21)
    expect(findings).toEqual([])
  })

  it('keeps the Household primary-contact ownership lookup before clearing', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'dashboard', 'households', 'actions.ts'),
      'utf8',
    )
    const action = exportedActionBlocks(source).find(
      (candidate) => candidate.name === 'updateHouseholdMember',
    )?.source ?? ''
    const ownershipIndex = action.indexOf(
      'const { data: memberRow, error: memberLookupError }',
    )
    const ownershipDenialIndex = action.indexOf('if (!memberRow?.id)', ownershipIndex)
    const clearIndex = action.indexOf('clearOtherPrimaryContacts(', ownershipDenialIndex)
    const updateIndex = action.indexOf('.update(normalized.payload)', clearIndex)

    expect(ownershipIndex).toBeGreaterThan(-1)
    expect(ownershipDenialIndex).toBeGreaterThan(ownershipIndex)
    expect(clearIndex).toBeGreaterThan(ownershipDenialIndex)
    expect(updateIndex).toBeGreaterThan(clearIndex)
  })

  it('documents action coverage and route-handler separation', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs', 'DASHBOARD_SERVER_ACTION_OPERATION_ORDER_BOUNDARY_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'DASHBOARD_SERVER_ACTION_OPERATION_ORDER_BOUNDARY_IMPLEMENTED_20260711',
      '21 operational Server Actions',
      'authenticated user',
      'active-parish or request-ownership scope',
      'before the first operational side effect',
      'Household primary-contact',
      'No production access',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
