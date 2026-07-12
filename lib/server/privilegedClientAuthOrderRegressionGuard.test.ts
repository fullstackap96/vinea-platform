import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const routeMethodPattern = /export async function (GET|POST|PATCH|PUT|DELETE|HEAD|OPTIONS)/g
const directAuthenticationPatterns = [
  'requireStaffFromRequest(request)',
  '.auth.getUser()',
] as const
const serviceClientCall = 'createSupabaseServiceRoleClient()'

function collectFiles(directory: string, predicate: (name: string) => boolean): string[] {
  if (!existsSync(directory)) return []

  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    const stats = statSync(path)
    if (stats.isDirectory()) return collectFiles(path, predicate)
    return predicate(entry) ? [path] : []
  })
}

function routeMethodBlocks(source: string) {
  const methods = [...source.matchAll(routeMethodPattern)]
  return methods.map((match, index) => ({
    method: match[1],
    source: source.slice(match.index, methods[index + 1]?.index ?? source.length),
  }))
}

function directAuthIndex(source: string): number {
  const indexes = directAuthenticationPatterns
    .map((pattern) => source.indexOf(pattern))
    .filter((index) => index >= 0)
  return indexes.length > 0 ? Math.min(...indexes) : -1
}

function relativePath(path: string) {
  return relative(process.cwd(), path).replaceAll('\\', '/')
}

describe('privileged Supabase client authentication-order regression guard', () => {
  it('keeps service-role construction after direct staff authentication in Route Handlers', () => {
    let reviewedMethodCount = 0
    const findings = collectFiles(join(process.cwd(), 'app', 'api'), (name) => name === 'route.ts')
      .flatMap((path) =>
        routeMethodBlocks(readFileSync(path, 'utf8')).flatMap((block) => {
          const serviceIndex = block.source.indexOf(serviceClientCall)
          const authIndex = directAuthIndex(block.source)
          if (serviceIndex < 0 || authIndex < 0) return []

          reviewedMethodCount += 1
          return authIndex < serviceIndex
            ? []
            : [`${relativePath(path)} ${block.method}: service role constructed before staff auth`]
        }),
      )

    expect(reviewedMethodCount).toBeGreaterThanOrEqual(52)
    expect(findings).toEqual([])
  })

  it('forbids module-scope service-role construction in API Route Handlers', () => {
    const moduleScopeConstruction = /^const\s+\w+\s*=\s*createSupabaseServiceRoleClient\(\)/m
    const findings = collectFiles(join(process.cwd(), 'app', 'api'), (name) => name === 'route.ts')
      .filter((path) => moduleScopeConstruction.test(readFileSync(path, 'utf8')))
      .map(relativePath)

    expect(findings).toEqual([])
  })

  it('keeps the service-role helper out of client components and explicitly server-only', () => {
    const clientFindings = collectFiles(
      join(process.cwd(), 'app'),
      (name) => name.endsWith('.ts') || name.endsWith('.tsx'),
    )
      .filter((path) => {
        const source = readFileSync(path, 'utf8')
        const isClient = /^\s*['"]use client['"]/m.test(source)
        return (
          isClient &&
          (source.includes('@/lib/supabaseServiceServer') || source.includes(serviceClientCall))
        )
      })
      .map(relativePath)

    const helper = readFileSync(join(process.cwd(), 'lib', 'supabaseServiceServer.ts'), 'utf8')
    expect(helper).toContain("import 'server-only'")
    expect(clientFindings).toEqual([])
  })

  it('documents the guard scope and delegated-authorization boundary', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs/PRIVILEGED_CLIENT_AUTH_ORDER_REGRESSION_BOUNDARY_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'PRIVILEGED_CLIENT_AUTH_ORDER_REGRESSION_BOUNDARY_IMPLEMENTED_20260711',
      '52 directly authenticated handler methods',
      'module-scope construction',
      '`server-only`',
      'does not replace active-parish',
      'No production access',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
