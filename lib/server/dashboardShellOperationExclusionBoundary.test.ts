import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const shellPath = join(process.cwd(), 'app', 'dashboard', 'DashboardLayoutClient.tsx')

describe('dashboard shell operation exclusion boundary', () => {
  it('prevents sign-out from starting during an active parish switch', () => {
    const source = readFileSync(shellPath, 'utf8')
    const logoutStart = source.indexOf('async function logout()')
    const logoutEnd = source.indexOf('function handleParishChange', logoutStart)
    const logout = source.slice(logoutStart, logoutEnd)

    expect(logout).toContain(
      'if (signOutInFlightRef.current || parishSwitchInFlightRef.current) return',
    )
    expect(logout.indexOf('parishSwitchInFlightRef.current')).toBeLessThan(
      logout.indexOf('supabase.auth.signOut'),
    )
  })

  it('prevents a parish switch from starting during sign-out', () => {
    const source = readFileSync(shellPath, 'utf8')
    const switchStart = source.indexOf('function handleParishChange(nextParishId: string)')
    const switchEnd = source.indexOf('\n  return (', switchStart)
    const parishSwitch = source.slice(switchStart, switchEnd)

    expect(parishSwitch).toContain('parishSwitchInFlightRef.current ||')
    expect(parishSwitch).toContain('signOutInFlightRef.current ||')
    expect(parishSwitch.indexOf('signOutInFlightRef.current')).toBeLessThan(
      parishSwitch.indexOf('setActiveStaffParish'),
    )
  })

  it('documents unchanged authorization and session boundaries', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs', 'DASHBOARD_SHELL_OPERATION_EXCLUSION_BOUNDARY_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'Dashboard Shell Operation Exclusion Boundary',
      'mutually exclusive',
      'membership-checked Server Action',
      'current-session-only sign-out',
      'No production access',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
