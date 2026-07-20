import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(relativePath: string) {
  return readFileSync(join(root, relativePath), 'utf8')
}

describe('request access legacy fallback boundary', () => {
  it('keeps request detail oldest-parish fallback isolated behind explicit compatibility options', () => {
    const source = read('lib/server/requestDetailAccess.ts')
    const fallbackBlock = source.slice(
      source.indexOf('async function primaryParishId'),
      source.indexOf('function isExactMembershipActiveParish')
    )
    const resolverBlock = source.slice(
      source.indexOf('async function resolveRequestDetailAccessParishId'),
      source.indexOf('export async function loadStaffScopedRequestDetailAccess')
    )

    expect(fallbackBlock).toContain(".from('parishes')")
    expect(fallbackBlock).toContain(".order('created_at', { ascending: true })")
    expect(fallbackBlock).toContain('.limit(1)')
    expect(resolverBlock).toContain('if (activeParishId)')
    expect(resolverBlock).toContain('resolveActiveStaffParishContext')
    expect(resolverBlock).toContain('isExactMembershipActiveParish(context, activeParishId)')
    expect(resolverBlock).toContain('if (options.allowPrimaryParishFallback === true)')
    expect(resolverBlock).toContain('if (options.staffSupabase)')
    expect(resolverBlock).toContain(
      'resolveActiveStaffParishContext(options.staffSupabase)'
    )
    expect(resolverBlock).toContain('return context.ok ? context.activeParishId : null')
    expect(resolverBlock).toContain('return primaryParishId(admin)')
  })

  it('keeps request document oldest-parish fallback isolated behind explicit compatibility options', () => {
    const source = read('lib/server/requestDocumentAccess.ts')
    const fallbackBlock = source.slice(
      source.indexOf('export async function primaryParishId'),
      source.indexOf('function isExactMembershipActiveParish')
    )
    const resolverBlock = source.slice(
      source.indexOf('async function resolveDocumentAccessParishId'),
      source.indexOf('export async function loadStaffScopedRequestDocumentAccess')
    )

    expect(fallbackBlock).toContain(".from('parishes')")
    expect(fallbackBlock).toContain(".order('created_at', { ascending: true })")
    expect(fallbackBlock).toContain('.limit(1)')
    expect(resolverBlock).toContain('if (activeParishId)')
    expect(resolverBlock).toContain('resolveActiveStaffParishContext')
    expect(resolverBlock).toContain('isExactMembershipActiveParish(context, activeParishId)')
    expect(resolverBlock).toContain('if (options.allowPrimaryParishFallback === true)')
    expect(resolverBlock).toContain('if (options.staffSupabase)')
    expect(resolverBlock).toContain(
      'resolveActiveStaffParishContext(options.staffSupabase)'
    )
    expect(resolverBlock).toContain('return context.ok ? context.activeParishId : null')
    expect(resolverBlock).toContain('return primaryParishId(admin)')
  })

  it('keeps staff-facing request routes off direct oldest-parish lookups', () => {
    for (const routePath of [
      'app/api/requests/[id]/detail-access/route.ts',
      'app/api/requests/[id]/documents/route.ts',
      'app/api/requests/[id]/documents/[documentId]/route.ts',
      'app/api/requests/[id]/portal-token/route.ts',
    ]) {
      const source = read(routePath)

      expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
      expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
      expect(source).not.toContain(".from('parishes')")
      expect(source).not.toContain(".order('created_at', { ascending: true })")
      expect(source).not.toContain('.limit(1)')
    }
  })

  it('documents the request access legacy fallback boundary in status docs', () => {
    const doc = read('docs/REQUEST_ACCESS_LEGACY_FALLBACK_BOUNDARY_20260708.md')
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('# Request Access Legacy Fallback Boundary - 2026-07-08')
    expect(doc).toContain('`loadStaffScopedRequestDetailAccess`')
    expect(doc).toContain('`loadStaffScopedRequestDocumentAccess`')
    expect(doc).toContain('explicit compatibility path')
    expect(doc).toContain('does not change runtime behavior')
    expect(buildStatus).toContain('Request Access Legacy Fallback Boundary')
    expect(roadmap).toContain('Request Access Legacy Fallback Boundary')
    expect(ssot).toContain('Request Access Legacy Fallback Boundary')
  })

  it('documents membership-first cookie-free request access hardening', () => {
    const doc = read('docs/REQUEST_ACCESS_MEMBERSHIP_PRIMARY_FALLBACK_HARDENING_20260720.md')
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('# Request Access Membership-Primary Fallback Hardening')
    expect(doc).toContain('authenticated staff membership context')
    expect(doc).toContain('fails closed')
    expect(doc).toContain('No migration or RLS change')
    expect(buildStatus).toContain('membership-primary request access hardening')
    expect(roadmap).toContain('membership-primary request access hardening')
    expect(ssot).toContain('membership-primary request access hardening')
  })
})
