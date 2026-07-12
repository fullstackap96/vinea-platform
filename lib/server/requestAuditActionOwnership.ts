export const SERVER_OWNED_REQUEST_AUDIT_ACTIONS = [
  'request.ai_summary.updated',
  'request.reply_draft.updated',
  'request.email.sent',
  'request.checklist.updated',
  'request.staff_notes.updated',
  'request.suggested_dates.updated',
  'request.intake.updated',
  'request.schedule.updated',
] as const

const serverOwnedRequestAuditActions = new Set<string>(SERVER_OWNED_REQUEST_AUDIT_ACTIONS)

export function isServerOwnedRequestAuditAction(action: string): boolean {
  return serverOwnedRequestAuditActions.has(action)
}
