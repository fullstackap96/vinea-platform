import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const appApiRoot = join(process.cwd(), 'app', 'api')
const routeMethodPattern = /export async function (GET|POST|PATCH|PUT|DELETE|HEAD|OPTIONS)/g
const mutationMethods = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])
const directAuthenticationPatterns = [
  'requireStaffFromRequest(request)',
  '.auth.getUser()',
] as const

function listRouteFiles(directory: string): string[] {
  if (!existsSync(directory)) return []

  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    const stats = statSync(path)
    if (stats.isDirectory()) return listRouteFiles(path)
    return entry === 'route.ts' ? [path] : []
  })
}

function mutationBlocks(source: string) {
  const methods = [...source.matchAll(routeMethodPattern)]
  return methods.flatMap((match, index) => {
    const method = match[1]
    if (!mutationMethods.has(method)) return []
    const start = match.index
    const end = methods[index + 1]?.index ?? source.length
    return [{ method, source: source.slice(start, end) }]
  })
}

function directAuthIndex(source: string): number {
  const indexes = directAuthenticationPatterns
    .map((pattern) => source.indexOf(pattern))
    .filter((index) => index >= 0)
  return indexes.length > 0 ? Math.min(...indexes) : -1
}

describe('authenticated mutation same-origin regression guard', () => {
  it('discovers direct-auth mutation handlers and keeps origin rejection before authentication', () => {
    let authenticatedMutationCount = 0
    const findings = listRouteFiles(appApiRoot).flatMap((path) => {
      const relativePath = relative(process.cwd(), path).replaceAll('\\', '/')
      return mutationBlocks(readFileSync(path, 'utf8')).flatMap((block) => {
        const authIndex = directAuthIndex(block.source)
        if (authIndex < 0) return []

        authenticatedMutationCount += 1
        const originIndex = block.source.indexOf('rejectCrossOriginMutation(request)')
        return originIndex >= 0 && originIndex < authIndex
          ? []
          : [`${relativePath} ${block.method}: origin guard must precede direct authentication`]
      })
    })

    expect(authenticatedMutationCount).toBeGreaterThanOrEqual(38)
    expect(findings).toEqual([])
  })

  it('documents the automatic future-route boundary and its limits', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs/STAFF_MUTATION_SAME_ORIGIN_BOUNDARY_20260711.md'),
      'utf8',
    )

    expect(evidence).toContain('repository-wide discovery guard')
    expect(evidence).toContain('directly call `requireStaffFromRequest(request)` or `.auth.getUser()`')
    expect(evidence).toContain('does not replace route-specific authorization tests')
  })
})
