const REDACTIONS = [
  [/postgres(?:ql)?:\/\/[^\s"'<>]+/gi, '[redacted database url]'],
  [/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[redacted jwt]'],
  [/\b(?:sk|rk|pk|sess|sbp)[_-][A-Za-z0-9_-]{12,}\b/g, '[redacted token]'],
  [/\bBearer\s+[A-Za-z0-9._-]+\b/gi, 'Bearer [redacted token]'],
  [/https?:\/\/[^\s"'<>]+/gi, '[redacted url]'],
  [
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,
    '[redacted id]',
  ],
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted email]'],
]

export function sanitizeEvidenceError(error) {
  let message =
    error instanceof Error
      ? error.message || error.name || 'Evidence runner failed.'
      : String(error ?? 'Evidence runner failed.')

  for (const [pattern, replacement] of REDACTIONS) {
    message = message.replace(pattern, replacement)
  }

  return message.trim().slice(0, 500) || 'Evidence runner failed.'
}
