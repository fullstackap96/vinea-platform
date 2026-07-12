const fallbackDemoRequestMessage =
  'Unable to submit demo request. Please try again or email us directly.'

const allowedDemoRequestMessages = new Set([
  'Please enter your name.',
  'Please enter your parish name.',
  'Please enter a valid email address.',
  'Demo request is too large.',
  'Demo requests are temporarily unavailable. Please email us directly.',
])

export function demoRequestClientErrorMessage(error: unknown): string {
  const message = typeof error === 'string' ? error.trim() : ''
  return allowedDemoRequestMessages.has(message) ? message : fallbackDemoRequestMessage
}
