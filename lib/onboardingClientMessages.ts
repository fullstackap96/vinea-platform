const fallbackOnboardingLoadMessage =
  'Could not load parish setup. Please try again.'
const fallbackOnboardingSaveMessage =
  'Could not mark onboarding complete. Please try again.'

const allowedOnboardingLoadMessages = new Set([
  'Unauthorized',
  'This login is not authorized for parish staff access.',
  'Could not verify staff access.',
  'Could not verify parish access.',
  'Parish is not configured.',
  'You are not authorized to read parish settings for this parish.',
  'Parish not found',
  'Could not load parish setup.',
])

const allowedOnboardingSaveMessages = new Set([
  'Unauthorized',
  'This login is not authorized for parish staff access.',
  'Could not verify staff access.',
  'Could not verify parish access.',
  'Parish is not configured.',
  'Invalid JSON body',
  'Parish name is required',
  'Please enter a valid notification email, or leave it blank.',
  'Please enter a valid daily brief email, or leave it blank.',
  'Daily brief delivery needs either a daily brief email or a default notification email.',
  'Could not mark onboarding complete.',
])

function safeMessage(
  error: unknown,
  allowedMessages: Set<string>,
  fallback: string
): string {
  const message = typeof error === 'string' ? error.trim() : ''
  return allowedMessages.has(message) ? message : fallback
}

export function onboardingLoadErrorMessage(error: unknown): string {
  return safeMessage(error, allowedOnboardingLoadMessages, fallbackOnboardingLoadMessage)
}

export function onboardingSaveErrorMessage(error: unknown): string {
  return safeMessage(error, allowedOnboardingSaveMessages, fallbackOnboardingSaveMessage)
}
