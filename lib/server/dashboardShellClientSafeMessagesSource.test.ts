import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('dashboard shell client safe-message boundary', () => {
  it('keeps initial and action parish-switcher messages behind the client allowlist', () => {
    const source = read('app/dashboard/DashboardLayoutClient.tsx')

    expect(source).toContain('dashboardParishSwitcherWarningMessage(parishSwitcher.warning)')
    expect(source).toContain(
      "dashboardShellClientErrorMessage('parishSwitcher', parishSwitcher.error)",
    )
    expect(source).toContain(
      "dashboardShellClientErrorMessage('parishSwitcher', result.error)",
    )
    expect(source).not.toContain('setSwitcherMessage(result.error)')
  })

  it('keeps Global Search errors and warnings behind safe client messages', () => {
    const source = read('app/dashboard/_components/DashboardGlobalSearch.tsx')

    expect(source).toContain(
      "dashboardShellClientErrorMessage('globalSearch', data.errorMessage)",
    )
    expect(source).toContain('dashboardGlobalSearchWarningMessage(data.warningMessage)')
    expect(source).not.toContain("setErrorMessage(data.errorMessage ?? '')")
    expect(source).not.toContain("setWarningMessage(data.warningMessage ?? '')")
  })

  it('keeps Notifications Center body errors behind a safe client message', () => {
    const source = read('app/dashboard/_components/DashboardNotificationsCenter.tsx')

    expect(source).toContain(
      "dashboardShellClientErrorMessage('notifications', json.errorMessage)",
    )
    expect(source).not.toContain("errorMessage: json.errorMessage ?? ''")
  })

  it('keeps logout failures safe and leaves the staff session visible for retry', () => {
    const source = read('app/dashboard/DashboardLayoutClient.tsx')
    const helper = read('lib/dashboardShellClientMessages.ts')

    expect(source).toContain("supabase.auth.signOut({ scope: 'local' })")
    expect(source).toContain('STAFF_SIGN_OUT_CONFIRMATION_TIMEOUT_MS = 15_000')
    expect(source).toContain('await withClientOperationDeadline(')
    expect(source).toContain("dashboardShellClientErrorMessage('logout', error)")
    expect(source).toContain("router.replace('/login')")
    expect(source.indexOf("router.replace('/login')")).toBeGreaterThan(
      source.indexOf("if (error)"),
    )
    expect(source).toContain('role="alert"')
    expect(source).toContain("isSigningOut ? 'Signing out...' : 'Logout'")
    expect(helper).toContain('Could not sign out. Check your connection and try again.')
    expect(helper).toContain(
      'Vinea could not confirm sign-out in time. Refresh this page before trying again.',
    )
    expect(source).not.toContain('setLogoutMessage(error.message)')
  })

  it('documents the shell client boundary without granting production approval', () => {
    const doc = read('docs/DASHBOARD_SHELL_CLIENT_SAFE_MESSAGES_20260710.md')
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('DASHBOARD_SHELL_CLIENT_SAFE_MESSAGES_IMPLEMENTED_20260710')
    expect(doc).toContain('Production-sensitive features approved by this boundary: `NO`')
    expect(buildStatus).toContain('Dashboard Shell Client Safe Messages - 2026-07-10')
    expect(roadmap).toContain('Dashboard Shell Client Safe Messages boundary')
    expect(sourceOfTruth).toContain('Dashboard Shell Client Safe Messages boundary')
  })

  it('documents current-session logout and safe post-login routing', () => {
    const doc = read('docs/STAFF_AUTH_SESSION_EXIT_BOUNDARY_20260710.md')

    for (const phrase of [
      'STAFF_AUTH_SESSION_EXIT_BOUNDARY_IMPLEMENTED_20260710',
      "`signOut({ scope: 'local' })`",
      '`safeDashboardHrefOrFallback(...)`',
      'redirects to `/login` only after',
      'No production access',
      'No migration or operational RLS change',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
