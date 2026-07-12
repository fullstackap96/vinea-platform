import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const shellPath = join(process.cwd(), 'app', 'dashboard', 'DashboardLayoutClient.tsx')

describe('dashboard logout single-flight boundary', () => {
  it('guards current-session sign-out synchronously and always releases the lock', () => {
    const source = readFileSync(shellPath, 'utf8')
    const logoutStart = source.indexOf('async function logout()')
    const logoutEnd = source.indexOf('function handleParishChange', logoutStart)
    const logoutSource = source.slice(logoutStart, logoutEnd)

    expect(logoutStart).toBeGreaterThan(-1)
    expect(source).toContain('const signOutInFlightRef = useRef(false)')
    expect(logoutSource).toContain(
      'if (signOutInFlightRef.current || parishSwitchInFlightRef.current) return',
    )
    expect(logoutSource).toContain('signOutInFlightRef.current = true')
    expect(logoutSource).toContain("supabase.auth.signOut({ scope: 'local' })")
    expect(logoutSource).toContain('finally {')
    expect(logoutSource).toContain('signOutInFlightRef.current = false')
  })

  it('gives both responsive sign-out controls disabled and busy semantics', () => {
    const source = readFileSync(shellPath, 'utf8')

    expect(source).toContain(
      'const logoutUnavailable = isSigningOut || parishContextPending || isSwitchingParish',
    )
    expect(source.match(/disabled=\{logoutUnavailable\}/g)).toHaveLength(2)
    expect(source.match(/aria-busy=\{isSigningOut\}/g)).toHaveLength(2)
    expect(source.match(/isSigningOut \? 'Signing out\.\.\.' : 'Logout'/g)).toHaveLength(2)
  })

  it('documents unchanged session and production boundaries', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs', 'DASHBOARD_LOGOUT_SINGLE_FLIGHT_BOUNDARY_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'Dashboard Logout Single-Flight Boundary',
      'current browser session',
      "`signOut({ scope: 'local' })`",
      '`Signing out...`',
      'safe retry guidance',
      'No production access',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
