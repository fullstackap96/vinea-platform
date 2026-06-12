import type { DashboardSuggestedAction } from './types'

export function suggestedActionHref(action: DashboardSuggestedAction): string {
  if (action.kind === 'record_creation') {
    return `/dashboard/records/new?requestId=${encodeURIComponent(action.requestId)}`
  }
  if (action.kind === 'certificate') {
    return `/dashboard/records/${action.recordId}`
  }
  return `/dashboard/requests/${action.requestId}`
}

export function plainSuggestedActionLabel(action: DashboardSuggestedAction): string {
  if (action.kind === 'record_creation') {
    return action.label.replace(/create register entry/gi, 'Create sacramental record')
  }
  if (action.kind === 'certificate') {
    return action.label
  }
  const reason = action.reason
    .replace(/exact email match/gi, 'same email on file')
    .replace(/exact phone match/gi, 'same phone on file')
    .replace(/exact full name match/gi, 'same name on file')
    .replace(/same intake contact \(parishioner_id\)/gi, 'same intake contact')
  return `Link ${action.personDisplayName} — ${reason}`
}

export function notificationLabelForSuggestedAction(action: DashboardSuggestedAction): {
  label: string
  context: string
} {
  if (action.kind === 'record_creation') {
    return {
      label: 'Create sacramental record',
      context: plainSuggestedActionLabel(action),
    }
  }
  if (action.kind === 'certificate') {
    return {
      label: 'Prepare baptism certificate',
      context: action.personName,
    }
  }
  return {
    label: 'Possible person match found',
    context: `Review match for ${action.personDisplayName}`,
  }
}
