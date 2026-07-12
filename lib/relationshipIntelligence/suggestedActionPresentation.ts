import type { DashboardSuggestedAction } from './types'
import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'

function dashboardHref(path: string, fallback: string) {
  return safeDashboardHrefOrFallback(path, fallback)
}

export function recordPrefillHrefForRequest(requestId: unknown): string {
  const normalizedRequestId = String(requestId ?? '').trim()
  if (!normalizedRequestId) return '/dashboard/records'
  return dashboardHref(
    `/dashboard/records/new?requestId=${encodeURIComponent(normalizedRequestId)}`,
    '/dashboard/records'
  )
}

export function recordDetailHrefForSuggestedAction(recordId: unknown): string {
  const normalizedRecordId = String(recordId ?? '').trim()
  if (!normalizedRecordId) return '/dashboard/records'
  return dashboardHref(
    `/dashboard/records/${encodeURIComponent(normalizedRecordId)}`,
    '/dashboard/records'
  )
}

export function requestDetailHrefForSuggestedAction(requestId: unknown): string {
  const normalizedRequestId = String(requestId ?? '').trim()
  if (!normalizedRequestId) return '/dashboard/requests'
  return dashboardHref(
    `/dashboard/requests/${encodeURIComponent(normalizedRequestId)}`,
    '/dashboard/requests'
  )
}

export function suggestedActionHref(action: DashboardSuggestedAction): string {
  if (action.kind === 'record_creation') {
    return recordPrefillHrefForRequest(action.requestId)
  }
  if (action.kind === 'certificate') {
    return recordDetailHrefForSuggestedAction(action.recordId)
  }
  return requestDetailHrefForSuggestedAction(action.requestId)
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
