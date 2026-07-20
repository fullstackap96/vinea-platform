import { ClientOperationTimeoutError } from './clientOperationDeadline'

export const staffLoginGenericErrorMessage =
  'We could not sign you in. Check your email and password, then try again.'

export const staffLoginRateLimitErrorMessage =
  'Too many sign-in attempts. Please wait a few minutes, then try again.'

export const staffLoginNetworkErrorMessage =
  'Vinea could not reach the sign-in service. Check your connection, then try again.'

export const staffLoginEmailConfirmationMessage =
  'This account needs email confirmation before staff sign-in can continue. Ask a parish administrator for help if you are unsure.'

export const staffLoginTimeoutErrorMessage =
  'Vinea could not confirm sign-in in time. Refresh this page before trying again.'

export function safeStaffLoginErrorMessage(error: unknown): string {
  if (error instanceof ClientOperationTimeoutError) {
    return staffLoginTimeoutErrorMessage
  }

  const rawMessage =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: unknown }).message ?? '')
          : ''

  const message = rawMessage.toLowerCase()

  if (message.includes('rate limit') || message.includes('too many')) {
    return staffLoginRateLimitErrorMessage
  }

  if (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('fetch failed')
  ) {
    return staffLoginNetworkErrorMessage
  }

  if (message.includes('email not confirmed') || message.includes('confirm your email')) {
    return staffLoginEmailConfirmationMessage
  }

  return staffLoginGenericErrorMessage
}
