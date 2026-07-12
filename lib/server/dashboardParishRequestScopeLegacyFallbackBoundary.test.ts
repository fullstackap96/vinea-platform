import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(relativePath: string) {
  return readFileSync(join(root, relativePath), 'utf8')
}

describe('dashboard request scope legacy fallback boundary', () => {
  it('keeps active parish scope ahead of membership and legacy primary-parish fallback', () => {
    const source = read('lib/dashboardParishRequestScope.ts')
    const scopeBlock = source.slice(
      source.indexOf('export async function fetchDashboardRequestParishionerScope'),
      source.length
    )

    expect(scopeBlock).toContain('let parishId = normalizeParishId(options.activeParishId)')
    expect(scopeBlock).toContain('if (!parishId)')
    expect(scopeBlock).toContain('const resolved = await fetchStaffScopedPrimaryParishId(supabase)')
    expect(scopeBlock).toContain('fetchParishionerIdsForParish(supabase, parishId)')
    expect(scopeBlock.indexOf('normalizeParishId(options.activeParishId)')).toBeLessThan(
      scopeBlock.indexOf('fetchStaffScopedPrimaryParishId(supabase)')
    )
    expect(scopeBlock.indexOf('fetchStaffScopedPrimaryParishId(supabase)')).toBeLessThan(
      scopeBlock.indexOf('fetchParishionerIdsForParish(supabase, parishId)')
    )
    expect(scopeBlock).not.toContain("supabase.rpc('primary_parish_id')")
  })

  it('keeps membership-primary resolution ahead of the explicit compatibility fallback helper', () => {
    const source = read('lib/dashboardParishRequestScope.ts')
    const staffScopedBlock = source.slice(
      source.indexOf('export async function fetchStaffScopedPrimaryParishId'),
      source.indexOf('/** `parishioners.id` values')
    )
    const fallbackBlock = source.slice(
      source.indexOf('export async function fetchPrimaryParishId'),
      source.indexOf('/**\n * Read-only staff-aware parish id')
    )

    expect(staffScopedBlock).toContain("supabase.rpc('current_staff_primary_parish_id')")
    expect(staffScopedBlock).toContain("source: 'membership'")
    expect(staffScopedBlock).toContain('const fallback = await fetchPrimaryParishId(supabase)')
    expect(staffScopedBlock).toContain("source: 'primary_parish_fallback'")
    expect(staffScopedBlock.indexOf("supabase.rpc('current_staff_primary_parish_id')")).toBeLessThan(
      staffScopedBlock.indexOf('fetchPrimaryParishId(supabase)')
    )
    expect(staffScopedBlock).not.toContain("supabase.rpc('primary_parish_id')")
    expect(fallbackBlock).toContain("supabase.rpc('primary_parish_id')")
  })

  it('documents the dashboard request scope legacy fallback boundary', () => {
    const doc = read('docs/DASHBOARD_REQUEST_SCOPE_LEGACY_FALLBACK_BOUNDARY_20260708.md')
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('# Dashboard Request Scope Legacy Fallback Boundary - 2026-07-08')
    expect(doc).toContain('active parish')
    expect(doc).toContain('membership-primary')
    expect(doc).toContain('explicit compatibility fallback')
    expect(doc).toContain('does not change runtime behavior')
    expect(buildStatus).toContain('Dashboard Request Scope Legacy Fallback Boundary')
    expect(roadmap).toContain('Dashboard Request Scope Legacy Fallback Boundary')
    expect(ssot).toContain('Dashboard Request Scope Legacy Fallback Boundary')
  })
})
