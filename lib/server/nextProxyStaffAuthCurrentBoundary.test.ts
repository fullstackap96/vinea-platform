import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(relativePath: string) {
  return readFileSync(join(root, relativePath), 'utf8')
}

describe('Next proxy membership-aware staff auth boundary', () => {
  it('protects dashboard access with authenticated active-membership scope', () => {
    const source = read('proxy.ts')

    expect(source).toContain('export async function proxy(request: NextRequest)')
    expect(source).toContain("matcher: ['/dashboard/:path*']")
    expect(source).toContain('supabase.auth.getUser()')
    expect(source).toContain('if (!user)')
    expect(source).toContain("loginUrl.pathname = '/login'")
    expect(source).toContain("loginUrl.searchParams.set(\n      'next'")
    expect(source).toContain('normalizeStaffEmail(user.email)')
    expect(source).toContain('isStaffEmailAllowlisted(email)')
    expect(source).toContain("supabase.rpc('current_staff_parish_ids')")
    expect(source).toContain('normalizeAuthorizedParishIds(data)')
    expect(source).toContain('authorized = authorizedParishIds.length > 0')
    expect(source).toContain('staffLookupError = true')
    expect(source).not.toContain("supabase.rpc('primary_parish_id')")
    expect(source).toContain('staffAccessNotConfiguredAllowsDev()')
    expect(source).toContain("loginUrl.searchParams.set('staff', 'unauthorized')")
  })

  it('keeps the proxy service-role-free', () => {
    const source = read('proxy.ts')

    expect(source).toContain('createServerClient')
    expect(source).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    expect(source).not.toContain('createSupabaseServiceRoleClient')
    expect(source).not.toContain('SUPABASE_SERVICE_ROLE_KEY')
    expect(source).not.toContain('service_role')
    expect(source).not.toContain('serviceRole')
  })

  it('records the implemented technical boundary and preserves production rollout gating', () => {
    const evidence = read(
      'docs/NEXT_PROXY_STAFF_AUTH_TECHNICAL_APPROVAL_20260711.md',
    )

    expect(evidence).toContain('NEXT_PROXY_MEMBERSHIP_AUTH_IMPLEMENTED_AND_VERIFIED')
    expect(evidence).toContain('current_staff_parish_ids()')
    expect(evidence).toContain('No service-role client')
    expect(evidence).toContain('Production rollout remains gated')
  })

  it('records sanitized shared-QA browser evidence without lifting the production gate', () => {
    const evidence = read(
      'docs/NEXT_PROXY_STAFF_AUTH_NONPRODUCTION_QA_EVIDENCE_20260711.md',
    )

    expect(evidence).toContain(
      'NEXT_PROXY_STAFF_AUTH_NONPRODUCTION_QA_EVIDENCE_20260711',
    )
    expect(evidence).toContain('`checks.schema: true`')
    expect(evidence).toContain('| Parish B scope | PASS |')
    expect(evidence).toContain('Production rollout: `NO-GO`')
    expect(evidence).toContain('Raw credentials, tokens, cookies, database URLs, or raw IDs in this evidence | ABSENT')
    expect(evidence).not.toMatch(/postgres(?:ql)?:\/\//i)
    expect(evidence).not.toMatch(/eyJ[A-Za-z0-9_-]{20,}/)
  })
})
