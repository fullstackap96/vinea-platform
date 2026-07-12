import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const routeMethodPattern = /export async function (GET|POST|PATCH|PUT|DELETE|HEAD|OPTIONS)/g
const mutationMethods = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

function collectRouteFiles(directory: string): string[] {
  if (!existsSync(directory)) return []
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    const stats = statSync(path)
    if (stats.isDirectory()) return collectRouteFiles(path)
    return entry === 'route.ts' ? [path] : []
  })
}

function mutationBlocks(source: string) {
  const methods = [...source.matchAll(routeMethodPattern)]
  return methods.flatMap((match, index) => {
    const method = match[1]
    if (!mutationMethods.has(method)) return []
    return [
      {
        method,
        source: source.slice(match.index, methods[index + 1]?.index ?? source.length),
      },
    ]
  })
}

describe('all API mutation same-origin regression guard', () => {
  it('keeps every side-effecting Route Handler behind origin rejection before privileged work', () => {
    let mutationCount = 0
    const findings = collectRouteFiles(join(process.cwd(), 'app', 'api')).flatMap((path) => {
      const routePath = relative(process.cwd(), path).replaceAll('\\', '/')
      return mutationBlocks(readFileSync(path, 'utf8')).flatMap((block) => {
        mutationCount += 1
        const originIndex = block.source.indexOf('rejectCrossOriginMutation(request)')
        const firstPrivilegedIndex = [
          'await context.params',
          'createSupabaseServiceRoleClient()',
          'requireStaffFromRequest(request)',
          '.auth.getUser()',
          'checkDurableRateLimit({',
          'readBoundedJsonBody(',
          'request.formData()',
        ]
          .map((marker) => block.source.indexOf(marker))
          .filter((index) => index >= 0)
          .sort((left, right) => left - right)[0]

        if (originIndex < 0) return [`${routePath} ${block.method}: missing origin guard`]
        if (firstPrivilegedIndex != null && originIndex > firstPrivilegedIndex) {
          return [`${routePath} ${block.method}: origin guard follows privileged work`]
        }
        return []
      })
    })

    expect(mutationCount).toBeGreaterThanOrEqual(42)
    expect(findings).toEqual([])
  })

  it('documents the first-party public and token-scoped boundary', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs', 'ALL_API_MUTATION_SAME_ORIGIN_BOUNDARY_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'ALL_API_MUTATION_SAME_ORIGIN_BOUNDARY_IMPLEMENTED_20260711',
      'public intake',
      'demo request',
      'request notification',
      'family-portal document upload',
      'before rate limiting, body or form parsing, token lookup, database access, storage, or provider work',
      'No production access',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
