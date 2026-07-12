import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const appApiRoot = join(process.cwd(), 'app', 'api')
const routeMethodPattern = /export async function (GET|POST|PATCH|PUT|DELETE|HEAD|OPTIONS)/g
const sideEffectPatterns = [
  /\.(?:insert|update|upsert|delete)\s*\(/,
  /\bsendBriefEmail\s*\(/,
  /\boauth2Client\.getToken\s*\(/,
] as const

const approvedSideEffectingGetRoutes = [
  'app/api/google/oauth/callback/route.ts',
  'app/api/parish/daily-brief/route.ts',
] as const

function listRouteFiles(directory: string): string[] {
  if (!existsSync(directory)) return []

  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    const stats = statSync(path)
    if (stats.isDirectory()) return listRouteFiles(path)
    return entry === 'route.ts' ? [path] : []
  })
}

function getBlock(source: string): string | null {
  const methods = [...source.matchAll(routeMethodPattern)]
  const getIndex = methods.findIndex((match) => match[1] === 'GET')
  if (getIndex < 0) return null

  const start = methods[getIndex].index
  const end = methods[getIndex + 1]?.index ?? source.length
  return source.slice(start, end)
}

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('side-effecting GET regression guard', () => {
  it('allows only the reviewed OAuth callback and bearer cron GET writers', () => {
    const discovered = listRouteFiles(appApiRoot)
      .flatMap((path) => {
        const block = getBlock(readFileSync(path, 'utf8'))
        return block && sideEffectPatterns.some((pattern) => pattern.test(block))
          ? [relative(process.cwd(), path).replaceAll('\\', '/')]
          : []
      })
      .sort()

    expect(discovered).toEqual([...approvedSideEffectingGetRoutes].sort())
  })

  it('keeps Google OAuth writes behind staff, signed-state, and exact parish membership checks', () => {
    const block = getBlock(source('app/api/google/oauth/callback/route.ts')) ?? ''
    const staffIndex = block.indexOf('requireStaffFromRequest(request)')
    const signedStateIndex = block.indexOf('verifySignedOAuthStateCookieWithMetadata(cookieRaw)')
    const timingSafeIndex = block.indexOf('timingSafeStateEquals(expectedState.state, stateParam)')
    const parishIndex = block.indexOf('resolveGoogleOAuthCallbackParishContext(')
    const tokenIndex = block.indexOf('oauth2Client.getToken(code)')
    const adminIndex = block.indexOf('createSupabaseServiceRoleClient()')
    const upsertIndex = block.indexOf(".from('parish_google_integrations').upsert(")

    expect(staffIndex).toBeGreaterThan(-1)
    expect(signedStateIndex).toBeGreaterThan(staffIndex)
    expect(timingSafeIndex).toBeGreaterThan(signedStateIndex)
    expect(parishIndex).toBeGreaterThan(timingSafeIndex)
    expect(tokenIndex).toBeGreaterThan(parishIndex)
    expect(adminIndex).toBeGreaterThan(tokenIndex)
    expect(upsertIndex).toBeGreaterThan(adminIndex)
    expect(block).not.toContain('rejectCrossOriginMutation(request)')
  })

  it('keeps Daily Brief provider and database writes behind bearer cron authorization', () => {
    const route = source('app/api/parish/daily-brief/route.ts')
    const block = getBlock(route) ?? ''
    const authorizationIndex = block.indexOf('cronAuthorized(request)')
    const adminIndex = block.indexOf('createSupabaseServiceRoleClient()')
    const loadIndex = block.indexOf('loadEnabledParishDailyBriefs(admin')
    const sendIndex = block.indexOf('sendBriefEmail({')
    const updateIndex = block.indexOf('recordDailyBriefState({')
    const stateHelperIndex = route.indexOf('async function recordDailyBriefState')
    const stateHelperEnd = route.indexOf('export async function POST', stateHelperIndex)
    const stateHelper = route.slice(stateHelperIndex, stateHelperEnd)

    expect(route).toContain("request.headers.get('authorization') === `Bearer ${secret}`")
    expect(authorizationIndex).toBeGreaterThan(-1)
    expect(adminIndex).toBeGreaterThan(authorizationIndex)
    expect(loadIndex).toBeGreaterThan(adminIndex)
    expect(sendIndex).toBeGreaterThan(loadIndex)
    expect(updateIndex).toBeGreaterThan(sendIndex)
    expect(stateHelper).toContain(".from('parishes')")
    expect(stateHelper).toContain(".select('id')")
    expect(stateHelper).toContain('.maybeSingle()')
    expect(stateHelper).toContain('!data?.id')
    expect(block).not.toContain('requireStaffFromRequest(request)')
    expect(block).not.toContain('rejectCrossOriginMutation(request)')
  })

  it('documents why the narrow GET exceptions remain and how rollback works', () => {
    const evidence = source('docs/SIDE_EFFECTING_GET_REGRESSION_BOUNDARY_20260711.md')

    for (const phrase of [
      'SIDE_EFFECTING_GET_REGRESSION_BOUNDARY_IMPLEMENTED_20260711',
      'Google OAuth callback',
      'bearer-authorized Daily Brief cron',
      'ordinary browser GET',
      'No production access',
      'provider call',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
