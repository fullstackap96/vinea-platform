export const NEXT_PROXY_STAFF_AUTH_RUNTIME_PREFLIGHT_VERSION =
  '2026-07-08-next-proxy-staff-auth-runtime-preflight-v1'

export type NextProxyStaffAuthRuntimeGateId =
  | 'next_proxy_convention'
  | 'dashboard_matcher'
  | 'authenticated_user'
  | 'allowlist_preserved'
  | 'membership_staff_scope'
  | 'redirects_preserved'
  | 'development_fallback'
  | 'fail_closed'

export type NextProxyStaffAuthRuntimeGateResult = {
  readonly id: NextProxyStaffAuthRuntimeGateId
  readonly ok: boolean
  readonly matchedMarker: string | null
  readonly markerIndex: number
}

export type NextProxyStaffAuthRuntimePreflightResult = {
  readonly ok: boolean
  readonly version: typeof NEXT_PROXY_STAFF_AUTH_RUNTIME_PREFLIGHT_VERSION
  readonly firstDashboardAllowIndex: number
  readonly gates: readonly NextProxyStaffAuthRuntimeGateResult[]
  readonly forbiddenRuntimeMarkersPresent: readonly string[]
  readonly errors: readonly string[]
}

type NextProxyStaffAuthRuntimeGate = {
  readonly id: NextProxyStaffAuthRuntimeGateId
  readonly description: string
  readonly markers: readonly string[]
  readonly mustAppearBeforeDashboardAllow?: boolean
}

const FUTURE_NEXT_PROXY_STAFF_AUTH_GATES: readonly NextProxyStaffAuthRuntimeGate[] =
  [
    {
      id: 'next_proxy_convention',
      description:
        'Future staff auth hardening must keep the Next.js 16 proxy convention.',
      markers: [
        'export async function proxy(request: NextRequest)',
        "from 'next/server'",
        'NextResponse',
      ],
      mustAppearBeforeDashboardAllow: true,
    },
    {
      id: 'dashboard_matcher',
      description:
        'Future staff auth hardening must keep the dashboard-only matcher.',
      markers: ["matcher: ['/dashboard/:path*']"],
      mustAppearBeforeDashboardAllow: false,
    },
    {
      id: 'authenticated_user',
      description:
        'Future staff auth hardening must load Supabase Auth user context before allowing dashboard access.',
      markers: ['supabase.auth.getUser()', 'if (!user)', "pathname = '/login'"],
      mustAppearBeforeDashboardAllow: true,
    },
    {
      id: 'allowlist_preserved',
      description:
        'Future staff auth hardening must preserve the configured staff allowlist behavior.',
      markers: [
        'normalizeStaffEmail',
        'isStaffEmailAllowlisted(email)',
        'authorized = isStaffEmailAllowlisted(email)',
      ],
      mustAppearBeforeDashboardAllow: true,
    },
    {
      id: 'membership_staff_scope',
      description:
        'Future staff auth hardening must use the authenticated active-membership RPC instead of a primary parish lookup.',
      markers: [
        "supabase.rpc('current_staff_parish_ids')",
        'normalizeAuthorizedParishIds(data)',
        'authorizedParishIds',
        'authorized = authorizedParishIds.length > 0',
      ],
      mustAppearBeforeDashboardAllow: true,
    },
    {
      id: 'redirects_preserved',
      description:
        'Future staff auth hardening must preserve safe unauthenticated and unauthorized redirects.',
      markers: [
        'loginUrl.searchParams.set(',
        "'next',",
        "searchParams.set('staff', 'unauthorized')",
        "pathname = '/login'",
      ],
      mustAppearBeforeDashboardAllow: true,
    },
    {
      id: 'development_fallback',
      description:
        'Future staff auth hardening must preserve the existing non-production development fallback boundary.',
      markers: ['staffAccessNotConfiguredAllowsDev()', 'authorized = true'],
      mustAppearBeforeDashboardAllow: true,
    },
    {
      id: 'fail_closed',
      description:
        'Future staff auth hardening must fail closed when the staff or membership lookup errors.',
      markers: ['catch', 'authorized = false', 'staffLookupError'],
      mustAppearBeforeDashboardAllow: true,
    },
  ]

const DASHBOARD_ALLOW_MARKERS = [
  'return response',
  'return NextResponse.next(',
] as const

const FORBIDDEN_RUNTIME_MARKERS = [
  'primary_parish_id',
  'createSupabaseServiceRoleClient',
  'SUPABASE_SERVICE_ROLE_KEY',
  'service_role',
  'serviceRole',
  ".from('parishes')",
  '.from("parishes")',
  ".order('created_at', { ascending: true })",
  '.order("created_at", { ascending: true })',
  'console.log(user',
  'console.log(email',
  'console.log(request.cookies',
] as const

function firstIndexOfAny(source: string, markers: readonly string[]): {
  marker: string | null
  index: number
} {
  let best: { marker: string | null; index: number } = { marker: null, index: -1 }

  for (const marker of markers) {
    const index = source.indexOf(marker)
    if (index >= 0 && (best.index === -1 || index < best.index)) {
      best = { marker, index }
    }
  }

  return best
}

function allMarkersBeforeIndex(
  source: string,
  markers: readonly string[],
  boundaryIndex: number,
) {
  return markers.every((marker) => {
    const index = source.indexOf(marker)
    return boundaryIndex >= 0 && index >= 0 && index < boundaryIndex
  })
}

export function validateFutureNextProxyStaffAuthRuntimeSource(
  source: string,
): NextProxyStaffAuthRuntimePreflightResult {
  const dashboardAllowIndex = firstIndexOfAny(
    source,
    DASHBOARD_ALLOW_MARKERS,
  ).index
  const errors: string[] = []

  if (dashboardAllowIndex < 0) {
    errors.push(
      `Missing dashboard allow anchor. Expected one of: ${DASHBOARD_ALLOW_MARKERS.join(
        ', ',
      )}.`,
    )
  }

  const gates = FUTURE_NEXT_PROXY_STAFF_AUTH_GATES.map(
    (gate): NextProxyStaffAuthRuntimeGateResult => {
      const match = firstIndexOfAny(source, gate.markers)
      const ok =
        gate.mustAppearBeforeDashboardAllow === false
          ? gate.markers.every((marker) => source.includes(marker))
          : allMarkersBeforeIndex(source, gate.markers, dashboardAllowIndex)

      if (!ok) {
        const orderExpectation =
          gate.mustAppearBeforeDashboardAllow === false
            ? 'must be present in the future proxy source'
            : 'must appear before dashboard access is allowed'
        errors.push(
          `${gate.id} ${orderExpectation}. Expected all of: ${gate.markers.join(
            ', ',
          )}.`,
        )
      }

      return {
        id: gate.id,
        ok,
        matchedMarker: match.marker,
        markerIndex: match.index,
      }
    },
  )

  const forbiddenRuntimeMarkersPresent = FORBIDDEN_RUNTIME_MARKERS.filter(
    (marker) => source.includes(marker),
  )

  if (forbiddenRuntimeMarkersPresent.length > 0) {
    errors.push(
      `Future Next proxy staff auth source contains forbidden runtime markers: ${forbiddenRuntimeMarkersPresent.join(
        ', ',
      )}.`,
    )
  }

  return {
    ok: errors.length === 0,
    version: NEXT_PROXY_STAFF_AUTH_RUNTIME_PREFLIGHT_VERSION,
    firstDashboardAllowIndex: dashboardAllowIndex,
    gates,
    forbiddenRuntimeMarkersPresent,
    errors,
  }
}
