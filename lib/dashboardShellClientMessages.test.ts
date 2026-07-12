import { describe, expect, it } from 'vitest'
import {
  dashboardGlobalSearchWarningMessage,
  dashboardParishSwitcherWarningMessage,
  dashboardShellClientErrorMessage,
  type DashboardShellClientAction,
} from './dashboardShellClientMessages'

const actions: DashboardShellClientAction[] = [
  'parishSwitcher',
  'globalSearch',
  'notifications',
]

describe('dashboard shell client messages', () => {
  it('maps expired sessions to action-specific sign-in guidance', () => {
    expect(dashboardShellClientErrorMessage('parishSwitcher', 'Unauthorized')).toBe(
      'Your staff session is no longer active. Sign in and try again.',
    )
    expect(dashboardShellClientErrorMessage('globalSearch', 'Unauthorized')).toBe(
      'Please sign in again to search.',
    )
    expect(dashboardShellClientErrorMessage('notifications', 'Unauthorized')).toBe(
      'Please sign in again to view items.',
    )
  })

  it('preserves approved parish guidance but rejects arbitrary shell errors', () => {
    expect(
      dashboardShellClientErrorMessage(
        'parishSwitcher',
        'Requested parish is not authorized for this staff session.',
      ),
    ).toBe('Requested parish is not authorized for this staff session.')

    for (const action of actions) {
      const message = dashboardShellClientErrorMessage(
        action,
        'private family@example.test failed at request 132ca2b3-84a4-4b50-8625-0bb773d87d31',
      )
      expect(message).not.toMatch(/family@example|132ca2b3|postgres:|supabase\.co|Bearer|service_role/i)
    }
  })

  it('normalizes switcher and search warnings without rendering future raw text', () => {
    expect(dashboardParishSwitcherWarningMessage(null)).toBeNull()
    expect(
      dashboardParishSwitcherWarningMessage(
        'Requested parish is not authorized for this staff session.',
      ),
    ).toBe('Requested parish is not authorized for this staff session.')
    expect(dashboardParishSwitcherWarningMessage('private membership lookup detail')).toBe(
      'The saved parish selection could not be used. Vinea selected an authorized parish instead.',
    )

    expect(dashboardGlobalSearchWarningMessage('')).toBe('')
    expect(dashboardGlobalSearchWarningMessage('private query detail')).toBe(
      'Some search results may be missing. Please try again if you do not see what you expected.',
    )
  })
})
