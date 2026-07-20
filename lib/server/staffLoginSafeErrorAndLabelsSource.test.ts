import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('staff login safe errors and accessible labels', () => {
  it('uses curated login errors and keeps provider text out of the staff alert', () => {
    const page = readRepoFile('app/login/page.tsx')
    const helper = readRepoFile('lib/loginAuthMessages.ts')

    expect(page).toContain("import { safeStaffLoginErrorMessage } from '@/lib/loginAuthMessages'")
    expect(page).toContain('safeStaffLoginErrorMessage(error)')
    expect(page).not.toContain('setErrorMessage(error.message)')
    expect(page).not.toContain('setErrorMessage(error?.message')
    expect(page).toContain('catch (err)')
    expect(helper).toContain('staffLoginGenericErrorMessage')
    expect(helper).toContain('staffLoginRateLimitErrorMessage')
    expect(helper).toContain('staffLoginNetworkErrorMessage')
    expect(helper).not.toContain('return rawMessage')
  })

  it('keeps explicit labels connected to the login inputs', () => {
    const page = readRepoFile('app/login/page.tsx')

    expect(page).toContain('htmlFor="staff-email"')
    expect(page).toContain('id="staff-email"')
    expect(page).toContain('name="email"')
    expect(page).toContain('autoComplete="email"')
    expect(page).toContain('htmlFor="staff-password"')
    expect(page).toContain('id="staff-password"')
    expect(page).toContain('name="password"')
    expect(page).toContain('autoComplete="current-password"')
  })

  it('keeps the form usable when the optional existing-session probe fails', () => {
    const page = readRepoFile('app/login/page.tsx')

    expect(page).toContain('async function redirectIfAuthed()')
    expect(page).toContain('await supabase.auth.getUser()')
    expect(page).toContain('} catch {')
    expect(page).toContain('void redirectIfAuthed()')
    expect(page).toContain('aria-label="Staff sign in"')
    expect(page).toContain('aria-busy={loading}')
    expect(page).toContain('useEffect,')
    expect(page).toContain('useRef,')
    expect(page).toContain('useSyncExternalStore,')
    expect(page).toContain("} from 'react'")
    expect(page).toContain('const signInInFlightRef = useRef(false)')
    expect(page).toContain('if (signInInFlightRef.current) return')
    expect(page).toContain('signInInFlightRef.current = true')
    expect(page).toContain('signInInFlightRef.current = false')
    expect(page.indexOf('signInInFlightRef.current = true')).toBeLessThan(
      page.indexOf('supabase.auth.signInWithPassword({'),
    )
    expect(page).toContain('STAFF_SIGN_IN_CONFIRMATION_TIMEOUT_MS = 30_000')
    expect(page).toContain('await withClientOperationDeadline(')
    expect(page.indexOf('await withClientOperationDeadline(')).toBeLessThan(
      page.indexOf('supabase.auth.signInWithPassword({'),
    )
  })

  it('prevents credentials from falling back into a pre-hydration GET submission', () => {
    const page = readRepoFile('app/login/page.tsx')

    expect(page).toContain('const formReady = useSyncExternalStore(')
    expect(page).toContain('subscribeToHydration')
    expect(page).toContain('() => false,')
    expect(page).toContain('method="post"')
    expect(page).toContain('disabled={!formReady || loading}')
    expect(page).not.toContain('method="get"')
  })

  it('accepts only hardened dashboard destinations after sign-in', () => {
    const page = readRepoFile('app/login/page.tsx')

    expect(page).toContain("safeDashboardHrefOrFallback(searchParams.get('next'), '/dashboard')")
    expect(page).not.toContain("if (!raw.startsWith('/'))")
    expect(page).not.toContain('return raw')
  })
})
