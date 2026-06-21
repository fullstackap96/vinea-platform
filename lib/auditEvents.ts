export type AuditEventRow = {
  id: string
  actor_email: string | null
  action: string
  target_type: string
  target_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function labelFromAction(action: string): string {
  const normalized = action.replaceAll('_', ' ').replaceAll('.', ' ')
  return normalized.replace(/\b\w/g, (c) => c.toUpperCase())
}

export function auditEventTitle(event: AuditEventRow): string {
  const metadata = event.metadata ?? {}
  switch (event.action) {
    case 'public_intake.created':
      return `New ${text(metadata.requestType) || 'request'} submitted`
    case 'parish_settings.updated':
      return 'Parish settings updated'
    case 'workflow_template_step.updated':
      return 'Workflow step updated'
    case 'staff_user.upserted':
      return `Staff access added for ${text(metadata.email) || 'a user'}`
    case 'staff_user.updated':
      return `Staff access updated for ${text(metadata.email) || 'a user'}`
    case 'request.assignment.updated':
      return 'Assignment updated'
    case 'request.follow_up.updated':
      return 'Follow-up date updated'
    case 'request.waiting_on.updated':
      return 'Blocking reason updated'
    case 'request.status.updated':
      return 'Status changed'
    case 'request.checklist.updated':
      return 'Checklist item updated'
    case 'request.workflow_step.updated':
      return 'Workflow step updated'
    case 'request.document.uploaded':
      return 'Document uploaded'
    case 'request.document.family_uploaded':
      return 'Family document uploaded'
    case 'request.document.reviewed':
      return 'Document reviewed'
    case 'request.portal_token.created':
      return 'Family portal link created'
    case 'request.note.created':
      return 'Internal note added'
    case 'request.intake.updated':
      return 'Intake details updated'
    case 'request.communication.logged':
      return 'Communication logged'
    case 'request.email.sent':
      return 'Email sent'
    case 'request.schedule.updated':
      return 'Confirmed schedule updated'
    case 'request.suggested_dates.updated':
      return 'Suggested dates updated'
    case 'request.staff_notes.updated':
      return 'Staff notes updated'
    case 'request.reply_draft.updated':
      return 'Reply draft updated'
    case 'request.ai_summary.updated':
      return 'AI summary saved'
    case 'request.playbook.applied':
      return 'Workflow playbook applied'
    case 'request.person.linked':
      return 'Request linked to person profile'
    default:
      return labelFromAction(event.action)
  }
}

export function auditEventDetail(event: AuditEventRow): string {
  const metadata = event.metadata ?? {}
  const from = text(metadata.from)
  const to = text(metadata.to)
  if (from || to) return `${from || 'Blank'} -> ${to || 'Blank'}`

  if (event.action === 'request.assignment.updated') {
    return [
      `Staff: ${text(metadata.assignedStaffName) || 'Unassigned'}`,
      `Priest: ${text(metadata.assignedPriestName) || 'Unassigned'}`,
      `Deacon: ${text(metadata.assignedDeaconName) || 'Unassigned'}`,
    ].join(' | ')
  }

  if (event.action === 'staff_user.updated') {
    return [
      `Role: ${text(metadata.previousRole) || 'unknown'} -> ${text(metadata.role) || 'unknown'}`,
      `Active: ${String(metadata.previousActive)} -> ${String(metadata.active)}`,
    ].join(' | ')
  }

  if (event.action === 'parish_settings.updated') {
    return [
      `Daily brief: ${String(metadata.dailyBriefEnabled)}`,
      `Onboarding complete: ${String(metadata.onboardingComplete)}`,
    ].join(' | ')
  }

  if (event.action === 'workflow_template_step.updated') {
    const next = metadata.next && typeof metadata.next === 'object' ? metadata.next as Record<string, unknown> : {}
    return [
      text(metadata.requestType) || 'Workflow',
      text(next.phase) || 'Step',
      text(next.title) || 'Updated',
    ].join(' | ')
  }

  const summary = text(metadata.summary)
  if (summary) return summary

  const label = text(metadata.label)
  if (label) return label

  return `${labelFromAction(event.target_type)}${event.target_id ? ` ${event.target_id}` : ''}`
}
