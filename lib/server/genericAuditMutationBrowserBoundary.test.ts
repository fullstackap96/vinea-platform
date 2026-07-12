import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

function collectSourceFiles(directory: string): string[] {
  if (!existsSync(directory)) return []
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    const stats = statSync(path)
    if (stats.isDirectory()) return collectSourceFiles(path)
    return entry.endsWith('.ts') || entry.endsWith('.tsx') ? [path] : []
  })
}

function relativePath(path: string) {
  return relative(process.cwd(), path).replaceAll('\\', '/')
}

describe('generic audit mutation browser boundary', () => {
  it('keeps browser components read-only toward the generic audit endpoint', () => {
    const findings = collectSourceFiles(join(process.cwd(), 'app')).flatMap((path) => {
      const source = readFileSync(path, 'utf8')
      if (!/^\s*['"]use client['"]/m.test(source) || !source.includes('/api/audit-events')) {
        return []
      }

      const postFetch = /fetch\([\s\S]{0,500}\/api\/audit-events[\s\S]{0,500}method:\s*['"]POST['"]/m
      return postFetch.test(source)
        ? [`${relativePath(path)} posts to the generic audit endpoint`]
        : []
    })

    expect(findings).toEqual([])
  })

  it('keeps request targets route-owned and non-request writes admin-only', () => {
    const source = readFileSync(join(process.cwd(), 'app', 'api', 'audit-events', 'route.ts'), 'utf8')
    const postStart = source.indexOf('export async function POST')
    const post = source.slice(postStart)
    const originIndex = post.indexOf('rejectCrossOriginMutation(request)')
    const authIndex = post.indexOf('requireStaffFromRequest(request)')
    const requestTargetDenialIndex = post.indexOf("if (targetType === 'request')")
    const scopeIndex = post.indexOf('resolveAuditEventsWriteParishId({')
    const adminIndex = post.indexOf('staffIsAdminForParish(admin,', scopeIndex)
    const adminDenialIndex = post.indexOf('if (!canWriteParishAuditEvent)', adminIndex)
    const writeIndex = post.indexOf('writeAuditEvent({', adminDenialIndex)

    expect(originIndex).toBeGreaterThan(-1)
    expect(authIndex).toBeGreaterThan(originIndex)
    expect(requestTargetDenialIndex).toBeGreaterThan(authIndex)
    expect(scopeIndex).toBeGreaterThan(requestTargetDenialIndex)
    expect(adminIndex).toBeGreaterThan(scopeIndex)
    expect(adminDenialIndex).toBeGreaterThan(adminIndex)
    expect(writeIndex).toBeGreaterThan(adminDenialIndex)
    expect(post).toContain("error: 'Invalid audit event.'")
    expect(post).toContain("error: 'Only parish admins can write non-request audit events.'")
  })

  it('documents the compatibility surface and explicit owner decision', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs', 'GENERIC_AUDIT_MUTATION_BROWSER_BOUNDARY_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'GENERIC_AUDIT_MUTATION_BROWSER_BOUNDARY_IMPLEMENTED_20260711',
      'no current Client Component posts',
      'request-target events remain route-owned',
      'selected-parish administrator',
      'owner approval before removal or narrowing',
      'No production access',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
