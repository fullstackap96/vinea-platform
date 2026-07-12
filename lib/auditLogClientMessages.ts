const fallbackAuditLogMessage = 'Could not load audit log. Please try again.'

const allowedAuditLogMessages = new Set([
  'Unauthorized',
  'This login is not authorized for parish staff access.',
  'Could not verify staff access.',
  'Could not verify parish access.',
  'Parish is not configured.',
  'Only parish admins can view the full audit log.',
  'You are not authorized to read audit events for this parish.',
  'Request activity is not configured yet. Apply the audit-event migration to show activity history.',
  'Could not load audit events.',
])

export function auditLogClientErrorMessage(error: unknown): string {
  const message = typeof error === 'string' ? error.trim() : ''
  return allowedAuditLogMessages.has(message) ? message : fallbackAuditLogMessage
}
