import { evaluateIntakeQuality, type IntakeQualityResult } from '@/lib/intakeQuality'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'

export type IntakeTriageStatus = 'urgent_pastoral_contact' | 'needs_review' | 'ready_to_start'

export type IntakeTriageActionKey =
  | 'assign_owner'
  | 'make_first_contact'
  | 'review_intake'
  | 'set_follow_up'
  | 'link_person'
  | 'open_command_card'

export type IntakeTriageResult = {
  status: IntakeTriageStatus
  label: string
  headline: string
  summary: string
  suggestedOwner: string
  suggestedAction: string
  actionKey: IntakeTriageActionKey
  actionSectionId: string
  missingDetails: string[]
  quality: IntakeQualityResult
}

export type IntakeTriageRequest = Parameters<typeof evaluateIntakeQuality>[0] & {
  status?: unknown
  created_at?: unknown
  assigned_staff_name?: unknown
  assigned_priest_name?: unknown
  assigned_deacon_name?: unknown
  last_contacted_at?: unknown
  next_follow_up_date?: unknown
  person_id?: unknown
}

const DAY_MS = 24 * 60 * 60 * 1000

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function isBlank(value: unknown): boolean {
  return text(value).length === 0
}

function daysSince(value: unknown, now: Date): number | null {
  const raw = text(value)
  if (!raw) return null
  const time = new Date(raw).getTime()
  if (Number.isNaN(time)) return null
  return Math.max(0, Math.floor((now.getTime() - time) / DAY_MS))
}

function hasAnyOwner(request: IntakeTriageRequest): boolean {
  return !(
    isBlank(request.assigned_staff_name) &&
    isBlank(request.assigned_priest_name) &&
    isBlank(request.assigned_deacon_name)
  )
}

function suggestedOwner(requestType: string): string {
  if (requestType === 'funeral') return 'Priest or funeral coordinator'
  if (requestType === 'wedding') return 'Wedding coordinator'
  if (requestType === 'ocia') return 'OCIA coordinator'
  if (requestType === 'baptism') return 'Baptism coordinator'
  return 'Parish office staff'
}

function urgentContactWindowDays(requestType: string): number {
  if (requestType === 'funeral') return 1
  if (requestType === 'ocia') return 3
  return 4
}

export function evaluateIntakeTriage(
  request: IntakeTriageRequest,
  options?: { now?: Date }
): IntakeTriageResult {
  const now = options?.now ?? new Date()
  const requestType = requestTypeFromRow(request)
  const quality = evaluateIntakeQuality(request, { now })
  const complete = text(request.status) === 'complete'
  const ageDays = daysSince(request.created_at, now)
  const ownerMissing = !hasAnyOwner(request)
  const contactMissing = isBlank(request.last_contacted_at)
  const followUpMissing = isBlank(request.next_follow_up_date) && !complete
  const personLinkMissing = isBlank(request.person_id)
  const urgentWindow = urgentContactWindowDays(requestType)
  const contactPastoralUrgent =
    !complete &&
    contactMissing &&
    ageDays !== null &&
    ageDays >= urgentWindow &&
    (requestType === 'funeral' || requestType === 'ocia')

  const missingDetails = [
    ...quality.issues.map((issue) => issue.label),
    ownerMissing ? 'Assign a clear staff owner.' : '',
    contactMissing ? 'Log the first family contact.' : '',
    followUpMissing ? 'Set the next follow-up date.' : '',
    personLinkMissing ? 'Link this request to the right person record when possible.' : '',
  ].filter(Boolean)

  if (contactPastoralUrgent) {
    return {
      status: 'urgent_pastoral_contact',
      label: 'Urgent contact',
      headline:
        requestType === 'funeral'
          ? 'Funeral family needs prompt pastoral contact.'
          : 'OCIA inquiry needs timely first contact.',
      summary: 'Start with a call or email, then assign ownership and protect the next follow-up.',
      suggestedOwner: suggestedOwner(requestType),
      suggestedAction: 'Contact the family first',
      actionKey: 'make_first_contact',
      actionSectionId: 'communication',
      missingDetails: missingDetails.slice(0, 5),
      quality,
    }
  }

  if (quality.status === 'needs_confirmation') {
    return {
      status: 'needs_review',
      label: 'Needs review',
      headline: 'Review intake details before staff moves this forward.',
      summary: quality.summary,
      suggestedOwner: suggestedOwner(requestType),
      suggestedAction: 'Review intake details',
      actionKey: 'review_intake',
      actionSectionId: quality.issues[0]?.sectionId ?? 'request-details',
      missingDetails: missingDetails.slice(0, 5),
      quality,
    }
  }

  if (ownerMissing) {
    return {
      status: 'needs_review',
      label: 'Needs owner',
      headline: 'Intake is usable, but ownership is not assigned yet.',
      summary: 'Assign a staff owner so the family has a clear point person.',
      suggestedOwner: suggestedOwner(requestType),
      suggestedAction: 'Assign owner',
      actionKey: 'assign_owner',
      actionSectionId: 'assignment',
      missingDetails: missingDetails.slice(0, 5),
      quality,
    }
  }

  if (contactMissing) {
    return {
      status: 'needs_review',
      label: 'First contact',
      headline: 'Intake is ready for first contact.',
      summary: 'Log the first call, email, or in-person touchpoint with the family.',
      suggestedOwner: suggestedOwner(requestType),
      suggestedAction: 'Log first contact',
      actionKey: 'make_first_contact',
      actionSectionId: 'communication',
      missingDetails: missingDetails.slice(0, 5),
      quality,
    }
  }

  if (followUpMissing) {
    return {
      status: 'needs_review',
      label: 'Set follow-up',
      headline: 'Set the next follow-up date before this leaves intake.',
      summary: 'A follow-up date keeps the request from disappearing after first contact.',
      suggestedOwner: suggestedOwner(requestType),
      suggestedAction: 'Set follow-up',
      actionKey: 'set_follow_up',
      actionSectionId: 'next-follow-up',
      missingDetails: missingDetails.slice(0, 5),
      quality,
    }
  }

  return {
    status: 'ready_to_start',
    label: 'Ready',
    headline: 'This request is ready to work.',
    summary: 'Contact, ownership, and intake details look ready for the normal workflow.',
    suggestedOwner: suggestedOwner(requestType),
    suggestedAction: 'Open command card',
    actionKey: 'open_command_card',
    actionSectionId: 'next-step',
    missingDetails: missingDetails.slice(0, 5),
    quality,
  }
}
