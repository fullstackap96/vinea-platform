const fallbackPublicIntakeMessage =
  'Could not submit your request. Please try again or contact the parish office.'

const allowedPublicIntakeMessages = new Set([
  'Could not submit request.',
  'Could not submit request. Please try again later.',
  'Too many submissions. Please try again later.',
  'Invalid request.',
  'Invalid request type.',
  'Please provide a name and valid email.',
  'Child name is required.',
  'Deceased name is required.',
  'Partner name is required.',
  'Please provide either date of birth or age.',
  'Public intake form is not available.',
])

export function publicIntakeClientErrorMessage(error: unknown): string {
  const message = typeof error === 'string' ? error.trim() : ''
  return allowedPublicIntakeMessages.has(message) ? message : fallbackPublicIntakeMessage
}
