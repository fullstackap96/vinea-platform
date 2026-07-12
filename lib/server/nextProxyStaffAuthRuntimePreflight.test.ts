import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  NEXT_PROXY_STAFF_AUTH_RUNTIME_PREFLIGHT_VERSION,
  validateFutureNextProxyStaffAuthRuntimeSource,
} from './nextProxyStaffAuthRuntimePreflight'

const root = process.cwd()

function read(relativePath: string) {
  return readFileSync(join(root, relativePath), 'utf8')
}

const approvedFutureProxySourceSketch = `
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  isStaffEmailAllowlisted,
  normalizeStaffEmail,
  staffAccessNotConfiguredAllowsDev,
} from '@/lib/staffAuthorization'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } })
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, cookieOptions)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  const email = normalizeStaffEmail(user.email)
  let authorized = isStaffEmailAllowlisted(email)
  let staffLookupError = false

  if (!authorized && email) {
    try {
      const { data, error } = await supabase.rpc('current_staff_parish_ids')
      if (error) throw error
      const authorizedParishIds = normalizeAuthorizedParishIds(data)
      authorized = authorizedParishIds.length > 0
    } catch {
      staffLookupError = true
      authorized = false
    }
  }

  if (!authorized && staffAccessNotConfiguredAllowsDev()) {
    authorized = true
  }

  if (!authorized) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('staff', 'unauthorized')
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
`

describe('Next proxy staff auth runtime preflight', () => {
  it('accepts future proxy auth source only when safety gates appear before dashboard access is allowed', () => {
    const result = validateFutureNextProxyStaffAuthRuntimeSource(
      approvedFutureProxySourceSketch,
    )

    expect(result.ok).toBe(true)
    expect(result.version).toBe(
      NEXT_PROXY_STAFF_AUTH_RUNTIME_PREFLIGHT_VERSION,
    )
    expect(result.forbiddenRuntimeMarkersPresent).toEqual([])
    expect(result.gates.map((gate) => gate.id)).toEqual([
      'next_proxy_convention',
      'dashboard_matcher',
      'authenticated_user',
      'allowlist_preserved',
      'membership_staff_scope',
      'redirects_preserved',
      'development_fallback',
      'fail_closed',
    ])
    expect(result.gates.every((gate) => gate.ok)).toBe(true)
    expect(
      result.gates
        .filter((gate) => gate.id !== 'dashboard_matcher')
        .every((gate) => gate.markerIndex < result.firstDashboardAllowIndex),
    ).toBe(true)
  })

  it('accepts the implemented proxy source against every approved gate', () => {
    const result = validateFutureNextProxyStaffAuthRuntimeSource(read('proxy.ts'))

    expect(result.ok).toBe(true)
    expect(result.forbiddenRuntimeMarkersPresent).toEqual([])
    expect(result.gates.every((gate) => gate.ok)).toBe(true)
  })

  it('rejects primary-parish and service-role compatibility lookups in the future proxy auth source', () => {
    const result = validateFutureNextProxyStaffAuthRuntimeSource(`
      ${approvedFutureProxySourceSketch}
      const serviceRole = createSupabaseServiceRoleClient()
      const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
      const { data: parishId } = await supabase.rpc('primary_parish_id')
      await supabase.from('parishes').order('created_at', { ascending: true })
    `)

    expect(result.ok).toBe(false)
    expect(result.forbiddenRuntimeMarkersPresent).toEqual(
      expect.arrayContaining([
        'primary_parish_id',
        'createSupabaseServiceRoleClient',
        'SUPABASE_SERVICE_ROLE_KEY',
        'serviceRole',
        ".from('parishes')",
        ".order('created_at', { ascending: true })",
      ]),
    )
  })

  it('rejects future proxy source that allows dashboard access before membership scope and redirects are established', () => {
    const unsafeSource = approvedFutureProxySourceSketch
      .replace('const { data: { user } } = await supabase.auth.getUser()', 'return response\n  const { data: { user } } = await supabase.auth.getUser()')
      .replace("  return response\n}\n\nexport const config", "  return response\n}\n\nexport const config")

    const result = validateFutureNextProxyStaffAuthRuntimeSource(unsafeSource)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          'authenticated_user must appear before dashboard access is allowed',
        ),
        expect.stringContaining(
          'membership_staff_scope must appear before dashboard access is allowed',
        ),
        expect.stringContaining(
          'redirects_preserved must appear before dashboard access is allowed',
        ),
      ]),
    )
  })

  it('rejects future proxy source that omits development fallback or fail-closed behavior', () => {
    const unsafeSource = approvedFutureProxySourceSketch
      .replace(
        `  if (!authorized && staffAccessNotConfiguredAllowsDev()) {
    authorized = true
  }

`,
        '',
      )
      .replaceAll('staffLookupError', 'lookupWarning')
      .replaceAll('catch', 'finally')

    const result = validateFutureNextProxyStaffAuthRuntimeSource(unsafeSource)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          'development_fallback must appear before dashboard access is allowed',
        ),
        expect.stringContaining(
          'fail_closed must appear before dashboard access is allowed',
        ),
      ]),
    )
  })

  it('documents the source-level preflight boundary in the approval packet and QA template', () => {
    const approvalPacket = read(
      'docs/NEXT_PROXY_STAFF_AUTH_MULTI_PARISH_APPROVAL_PACKET_20260708.md',
    )
    const qaTemplate = read(
      'docs/NEXT_PROXY_STAFF_AUTH_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260708.md',
    )
    const preflightPlan = read(
      'docs/NEXT_PROXY_STAFF_AUTH_RUNTIME_PREFLIGHT_PLAN_20260708.md',
    )

    for (const required of [
      'Source-Level Preflight Tests',
      'lib/server/nextProxyStaffAuthRuntimePreflight.ts',
      'lib/server/nextProxyStaffAuthRuntimePreflight.test.ts',
      'Next.js 16 proxy convention',
      'dashboard-only matcher',
      'Supabase Auth user loading',
      'staff allowlist',
      'membership-aware staff scope',
      'no `primary_parish_id()`',
      'no service-role client',
      'safe unauthenticated and unauthorized redirects',
      'development fallback',
      'fail closed',
    ]) {
      expect(`${approvalPacket}\n${qaTemplate}\n${preflightPlan}`).toContain(
        required,
      )
    }
  })
})
