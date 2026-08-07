import { ClientOperationTimeoutError } from './clientOperationDeadline'

export type DashboardShellClientAction =
  | 'parishSwitcher'
  | 'globalSearch'
  | 'notifications'
  | 'logout'

const failureMessages: Record<DashboardShellClientAction, string> = {
  parishSwitcher: 'Could not change the selected parish. Please refresh and try again.',
  globalSearch: 'Search is temporarily unavailable.',
  notifications: 'Could not load items needing attention.',
  logout: 'Could not sign out. Check your connection and try again.',
}

const logoutTimeoutMessage =
  'Vinea could not confirm sign-out in time. Refresh this page before trying again.'

const signInMessages: Record<DashboardShellClientAction, string> = {
  parishSwitcher: 'Your staff session is no longer active. Sign in and try again.',
  globalSearch: 'Please sign in again to search.',
  notifications: 'Please sign in again to view items.',
  logout: 'Your staff session is no longer active. Return to sign in.',
}

const allowedParishSwitcherMessages = new Set([
  'Could not resolve parish context.',
  'Parish is not configured.',
  'Could not load parish context.',
  'Requested parish is not authorized for this staff session.',
])

export function dashboardShellClientErrorMessage(
  action: DashboardShellClientAction,
  error: unknown,
): string {
  if (action === 'logout' && error instanceof ClientOperationTimeoutError) {
    return logoutTimeoutMessage
  }

  const message = typeof error === 'string' ? error.trim() : ''
  if (message === 'Unauthorized') return signInMessages[action]

  if (action === 'parishSwitcher' && allowedParishSwitcherMessages.has(message)) {
    return message
  }

  return failureMessages[action]
}

export function dashboardParishSwitcherWarningMessage(warning: unknown): string | null {
  const message = typeof warning === 'string' ? warning.trim() : ''
  if (!message) return null
  if (message === 'Requested parish is not authorized for this staff session.') {
    return message
  }

  return 'The saved parish selection could not be used. Vinea selected an authorized parish instead.'
}

export function dashboardGlobalSearchWarningMessage(warning: unknown): string {
  const message = typeof warning === 'string' ? warning.trim() : ''
  if (!message) return ''

  return 'Some search results may be missing. Please try again if you do not see what you expected.'
}
