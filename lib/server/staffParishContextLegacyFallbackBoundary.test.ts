import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(relativePath: string) {
  return readFileSync(join(root, relativePath), 'utf8')
}

describe('staff parish context legacy fallback boundary', () => {
  it('keeps read context membership-first before primary parish compatibility fallback', () => {
    const source = read('lib/server/staffParishContext.ts')
    const resolverBlock = source.slice(
      source.indexOf('export async function resolveStaffParishContext'),
      source.indexOf('export const staffParishContextTestInternals')
    )

    expect(resolverBlock).toContain("supabase.rpc('current_staff_parish_ids')")
    expect(resolverBlock).toContain("source: 'membership'")
    expect(resolverBlock).toContain('return loadPrimaryParishFallback(')
    expect(resolverBlock.indexOf("supabase.rpc('current_staff_parish_ids')")).toBeLessThan(
      resolverBlock.indexOf('return loadPrimaryParishFallback(')
    )
    expect(resolverBlock).not.toContain("supabase.rpc('primary_parish_id')")
  })

  it('keeps write context fallback opt-in and membership authorization first', () => {
    const source = read('lib/server/staffWriteParishContext.ts')
    const publicResolverBlock = source.slice(
      source.indexOf('export async function resolveStaffWriteParishContext'),
      source.indexOf('export const staffWriteParishContextTestInternals')
    )
    const primaryMembershipBlock = source.slice(
      source.indexOf('async function resolvePrimaryMembershipParish'),
      source.indexOf('async function resolveRequestedMembershipParish')
    )
    const requestedMembershipBlock = source.slice(
      source.indexOf('async function resolveRequestedMembershipParish'),
      source.indexOf('/**\n * Resolves the parish id')
    )

    expect(publicResolverBlock).toContain('allowPrimaryParishFallback: options.allowPrimaryParishFallback === true')
    expect(publicResolverBlock).toContain('if (requestedParishId)')
    expect(publicResolverBlock).toContain('return resolveRequestedMembershipParish')
    expect(publicResolverBlock).toContain('return resolvePrimaryMembershipParish')
    expect(primaryMembershipBlock).toContain("supabase.rpc('current_staff_primary_parish_id')")
    expect(primaryMembershipBlock).toContain('if (options.allowPrimaryParishFallback)')
    expect(primaryMembershipBlock).toContain('return loadPrimaryParishFallback(')
    expect(requestedMembershipBlock).toContain("supabase.rpc('is_authorized_for_parish'")
    expect(requestedMembershipBlock).toContain('if (error && options.allowPrimaryParishFallback)')
    expect(requestedMembershipBlock).toContain('return loadPrimaryParishFallback(')
  })

  it('documents the staff parish context legacy fallback boundary', () => {
    const doc = read('docs/STAFF_PARISH_CONTEXT_LEGACY_FALLBACK_BOUNDARY_20260708.md')
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('# Staff Parish Context Legacy Fallback Boundary - 2026-07-08')
    expect(doc).toContain('`resolveStaffParishContext`')
    expect(doc).toContain('`resolveStaffWriteParishContext`')
    expect(doc).toContain('membership-first')
    expect(doc).toContain('explicit compatibility fallback')
    expect(doc).toContain('does not change runtime behavior')
    expect(buildStatus).toContain('Staff Parish Context Legacy Fallback Boundary')
    expect(roadmap).toContain('Staff Parish Context Legacy Fallback Boundary')
    expect(ssot).toContain('Staff Parish Context Legacy Fallback Boundary')
  })
})
