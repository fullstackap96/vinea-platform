import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const mutationMethodPattern = /export async function (POST|PATCH|PUT|DELETE)/g
const approvedAccessResolvers = [
  'loadStaffScopedRequestDetailAccess(',
  'loadStaffScopedRequestDocumentAccess(',
] as const
const privilegedSideEffectPatterns = [
  '.insert(',
  '.update(',
  '.upsert(',
  '.delete(',
  '.upload(',
  '.remove(',
  'createRequestPortalToken(',
] as const

function collectRouteFiles(directory: string): string[] {
  if (!existsSync(directory)) return []

  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    const stats = statSync(path)
    if (stats.isDirectory()) return collectRouteFiles(path)
    return entry === 'route.ts' ? [path] : []
  })
}

function mutationMethodBlocks(source: string) {
  const methods = [...source.matchAll(mutationMethodPattern)]
  return methods.map((match, index) => ({
    method: match[1],
    source: source.slice(match.index, methods[index + 1]?.index ?? source.length),
  }))
}

function firstIndex(source: string, patterns: readonly string[]): number {
  const indexes = patterns.map((pattern) => source.indexOf(pattern)).filter((index) => index >= 0)
  return indexes.length > 0 ? Math.min(...indexes) : -1
}

function relativePath(path: string) {
  return relative(process.cwd(), path).replaceAll('\\', '/')
}

describe('request privileged operation authorization-order regression guard', () => {
  it('keeps every directly authenticated request mutation behind approved request scope', () => {
    let reviewedMethodCount = 0
    const findings = collectRouteFiles(join(process.cwd(), 'app', 'api', 'requests')).flatMap(
      (path) =>
        mutationMethodBlocks(readFileSync(path, 'utf8')).flatMap((block) => {
          const authIndex = block.source.indexOf('requireStaffFromRequest(request)')
          const serviceClientIndex = block.source.indexOf('createSupabaseServiceRoleClient()')
          if (authIndex < 0 || serviceClientIndex < 0) return []

          reviewedMethodCount += 1
          const accessIndex = firstIndex(block.source, approvedAccessResolvers)
          const denialIndex = block.source.indexOf('if (!access)', accessIndex)
          const firstSideEffectIndex = firstIndex(block.source, privilegedSideEffectPatterns)
          const genericDenialIndex = block.source.indexOf("error: 'Request not found.'", denialIndex)
          const label = `${relativePath(path)} ${block.method}`
          const methodFindings: string[] = []

          if (authIndex >= serviceClientIndex) {
            methodFindings.push(`${label}: service client is not after staff authentication`)
          }
          if (accessIndex <= serviceClientIndex) {
            methodFindings.push(`${label}: approved request access is not after service client creation`)
          }
          if (denialIndex <= accessIndex) {
            methodFindings.push(`${label}: missing access denial after request scope resolution`)
          }
          if (genericDenialIndex <= denialIndex) {
            methodFindings.push(`${label}: request-scope denial is not generic`)
          }
          if (firstSideEffectIndex <= denialIndex) {
            methodFindings.push(`${label}: privileged side effect is not after request-scope denial`)
          }
          if (!block.source.slice(accessIndex).includes('access.requestId')) {
            methodFindings.push(`${label}: downstream work does not use the authorized request id`)
          }

          return methodFindings
        }),
    )

    expect(reviewedMethodCount).toBe(19)
    expect(findings).toEqual([])
  })

  it('keeps both approved resolvers fail-closed on exact parish membership and ownership', () => {
    const detailResolver = readFileSync(
      join(process.cwd(), 'lib', 'server', 'requestDetailAccess.ts'),
      'utf8',
    )
    const documentResolver = readFileSync(
      join(process.cwd(), 'lib', 'server', 'requestDocumentAccess.ts'),
      'utf8',
    )

    for (const source of [detailResolver, documentResolver]) {
      expect(source).toContain("context.source === 'membership'")
      expect(source).toContain('context.activeParishId === requestedParishId')
      expect(source).toContain('!context.ignoredRequestedParishReason')
      expect(source).toContain(".select('id, parishioner_id')")
      expect(source).toContain(".select('parish_id')")
      expect(source).toContain("String(parishioner?.parish_id ?? '') !== parishId")
    }
  })

  it('documents coverage, ordering, and the remaining route-specific boundary', () => {
    const evidence = readFileSync(
      join(
        process.cwd(),
        'docs',
        'REQUEST_PRIVILEGED_OPERATION_ORDER_REGRESSION_BOUNDARY_20260711.md',
      ),
      'utf8',
    )

    for (const phrase of [
      'REQUEST_PRIVILEGED_OPERATION_ORDER_REGRESSION_BOUNDARY_IMPLEMENTED_20260711',
      '19 privileged request-mutation methods',
      '`loadStaffScopedRequestDetailAccess`',
      '`loadStaffScopedRequestDocumentAccess`',
      'before the first privileged side effect',
      'does not replace route-specific validation',
      'No production access',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
