import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const routeMethodPattern = /export async function (GET|POST|PATCH|PUT|DELETE|HEAD|OPTIONS)/g
const mutationMethods = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

type RouteSpec = {
  path: string
  method: 'POST' | 'PATCH'
  scopeMarker: string
  denialMarker: string
  sideEffectMarker: string
  additionalAuthorizationMarker?: string
  additionalDenialMarker?: string
}

const routeSpecs: RouteSpec[] = [
  {
    path: 'app/api/audit-events/route.ts',
    method: 'POST',
    scopeMarker: 'resolveAuditEventsWriteParishId({',
    denialMarker: 'if (!parishContext.ok)',
    additionalAuthorizationMarker: 'staffIsAdminForParish(admin,',
    additionalDenialMarker: 'if (!canWriteParishAuditEvent)',
    sideEffectMarker: 'writeAuditEvent({',
  },
  {
    path: 'app/api/email/send/route.ts',
    method: 'POST',
    scopeMarker: 'loadStaffScopedRequestDetailAccess(admin, requestId',
    denialMarker: 'if (!access)',
    sideEffectMarker: 'resend.emails.send({',
  },
  {
    path: 'app/api/households/duplicates/route.ts',
    method: 'POST',
    scopeMarker: 'duplicateWriteParishId(staff.supabase, activeParishCookie(request))',
    denialMarker: 'if (!parishScope.ok)',
    sideEffectMarker: '.update(normalized.payload)',
  },
  {
    path: 'app/api/imports/route.ts',
    method: 'POST',
    scopeMarker: 'resolveImportWriteParishId(staff.supabase, requestedParishId)',
    denialMarker: 'if (!parishContext.ok)',
    sideEffectMarker: '.insert(insertRows)',
  },
  {
    path: 'app/api/mass-intentions/[id]/intake-triage/route.ts',
    method: 'POST',
    scopeMarker: 'resolveStaffWriteParishContext(staff.supabase,',
    denialMarker: 'if (!parishContext.ok)',
    sideEffectMarker: '.update(payload)',
  },
  {
    path: 'app/api/parish/daily-brief/route.ts',
    method: 'POST',
    scopeMarker: 'resolveDailyBriefManualSendParishContext(',
    denialMarker: 'if (!parishContext.ok)',
    sideEffectMarker: 'sendBriefEmail({',
  },
  {
    path: 'app/api/parish/public-intake-routing/route.ts',
    method: 'POST',
    scopeMarker: 'resolvePublicIntakeRoutingWriteParishId(',
    denialMarker: 'if (!parishContext.ok)',
    sideEffectMarker: '.insert({',
  },
  {
    path: 'app/api/parish/public-intake-routing/route.ts',
    method: 'PATCH',
    scopeMarker: 'resolvePublicIntakeRoutingWriteParishId(',
    denialMarker: 'if (!parishContext.ok)',
    sideEffectMarker: '.update({',
  },
  {
    path: 'app/api/parish/settings/route.ts',
    method: 'PATCH',
    scopeMarker: 'resolveStaffWriteParishContext(staffAuth.supabase,',
    denialMarker: 'if (!parishContext.ok)',
    sideEffectMarker: '.update({',
  },
  {
    path: 'app/api/parish/staff-users/route.ts',
    method: 'POST',
    scopeMarker: 'resolveStaffWriteParishContext(staff.supabase,',
    denialMarker: 'if (!parishContext.ok)',
    additionalAuthorizationMarker: 'staffIsAdminForParish(admin,',
    additionalDenialMarker: 'if (!canManage)',
    sideEffectMarker: '.upsert(',
  },
  {
    path: 'app/api/parish/staff-users/route.ts',
    method: 'PATCH',
    scopeMarker: 'resolveStaffWriteParishContext(staff.supabase,',
    denialMarker: 'if (!parishContext.ok)',
    additionalAuthorizationMarker: 'staffIsAdminForParish(admin,',
    additionalDenialMarker: 'if (!canManage)',
    sideEffectMarker: '.update({ role, active, updated_at:',
  },
  {
    path: 'app/api/parish/workflow-templates/route.ts',
    method: 'PATCH',
    scopeMarker: 'resolveStaffWriteParishContext(staff.supabase,',
    denialMarker: 'if (!parishContext.ok)',
    sideEffectMarker: '.update({',
  },
  {
    path: 'app/api/people/duplicates/route.ts',
    method: 'POST',
    scopeMarker: 'duplicateWriteParishId(staff.supabase, activeParishCookie(request))',
    denialMarker: 'if (!parishScope.ok)',
    sideEffectMarker: '.update({ parishioner_id: null })',
  },
]

function collectRouteFiles(directory: string): string[] {
  if (!existsSync(directory)) return []
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    const stats = statSync(path)
    if (stats.isDirectory()) return collectRouteFiles(path)
    return entry === 'route.ts' ? [path] : []
  })
}

function routeMethodBlocks(source: string) {
  const methods = [...source.matchAll(routeMethodPattern)]
  return methods.map((match, index) => ({
    method: match[1],
    source: source.slice(match.index, methods[index + 1]?.index ?? source.length),
  }))
}

function relativePath(path: string) {
  return relative(process.cwd(), path).replaceAll('\\', '/')
}

function specKey(path: string, method: string) {
  return `${path}#${method}`
}

describe('staff tenant operation-order regression guard', () => {
  it('keeps the discovered non-request privileged mutation inventory complete', () => {
    const discovered = collectRouteFiles(join(process.cwd(), 'app', 'api')).flatMap((path) => {
      const relativeRoute = relativePath(path)
      if (relativeRoute.startsWith('app/api/requests/')) return []

      return routeMethodBlocks(readFileSync(path, 'utf8'))
        .filter(
          (block) =>
            mutationMethods.has(block.method) &&
            block.source.includes('createSupabaseServiceRoleClient()') &&
            (block.source.includes('requireStaffFromRequest(request)') ||
              block.source.includes('.auth.getUser()')),
        )
        .map((block) => specKey(relativeRoute, block.method))
    })

    expect(discovered.sort()).toEqual(
      routeSpecs.map((spec) => specKey(spec.path, spec.method)).sort(),
    )
  })

  it.each(routeSpecs)('$path $method authorizes tenant scope before its first side effect', (spec) => {
    const source = readFileSync(join(process.cwd(), spec.path), 'utf8')
    const block = routeMethodBlocks(source).find((candidate) => candidate.method === spec.method)?.source
    expect(block).toBeDefined()

    const methodSource = block ?? ''
    const authIndexes = [
      methodSource.indexOf('requireStaffFromRequest(request)'),
      methodSource.indexOf('.auth.getUser()'),
    ].filter((index) => index >= 0)
    const authIndex = authIndexes.length > 0 ? Math.min(...authIndexes) : -1
    const scopeIndex = methodSource.indexOf(spec.scopeMarker)
    const denialIndex = methodSource.indexOf(spec.denialMarker, scopeIndex)
    const sideEffectIndex = methodSource.indexOf(spec.sideEffectMarker, denialIndex)

    expect(authIndex).toBeGreaterThan(-1)
    expect(scopeIndex).toBeGreaterThan(authIndex)
    expect(denialIndex).toBeGreaterThan(scopeIndex)
    expect(sideEffectIndex).toBeGreaterThan(denialIndex)

    if (spec.additionalAuthorizationMarker && spec.additionalDenialMarker) {
      const authorizationIndex = methodSource.indexOf(
        spec.additionalAuthorizationMarker,
        denialIndex,
      )
      const additionalDenialIndex = methodSource.indexOf(
        spec.additionalDenialMarker,
        authorizationIndex,
      )
      expect(authorizationIndex).toBeGreaterThan(denialIndex)
      expect(additionalDenialIndex).toBeGreaterThan(authorizationIndex)
      expect(sideEffectIndex).toBeGreaterThan(additionalDenialIndex)
    }
  })

  it('documents the protected cohort and route-specific limitations', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs', 'STAFF_TENANT_OPERATION_ORDER_REGRESSION_BOUNDARY_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'STAFF_TENANT_OPERATION_ORDER_REGRESSION_BOUNDARY_IMPLEMENTED_20260711',
      '13 non-request privileged staff mutation methods',
      'exact tenant scope',
      'parish-admin authorization',
      'before the first provider or database side effect',
      'does not replace route-specific validation',
      'No production access',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
