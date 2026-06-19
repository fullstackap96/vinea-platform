import { formatRequestType } from '@/lib/formatRequestType'
import { formatSacramentalRecordType } from '@/lib/formatSacramentalRecordType'
import { formatRequestStatus } from '@/lib/requestStatus'
import { isNextFollowUpDueToday, isNextFollowUpOverdue } from '@/lib/nextFollowUpDate'

export type CareTimelineEventKind =
  | 'request'
  | 'record'
  | 'communication'
  | 'household'
  | 'follow_up'

export type CareTimelineRequest = {
  id: string
  request_type: string
  status: string
  child_name?: string | null
  created_at: string
  last_contacted_at?: string | null
  next_follow_up_date?: string | null
  assigned_staff_name?: string | null
  assigned_priest_name?: string | null
  assigned_deacon_name?: string | null
}

export type CareTimelineRecord = {
  id: string
  record_type: string
  person_name?: string | null
  sacrament_date?: string | null
  created_at: string
}

export type CareTimelineCommunication = {
  id: string
  requestId: string
  requestLabel: string
  contacted_at: string
  method: string
  notes?: string | null
}

export type CareTimelineHousehold = {
  householdId: string
  householdName: string
  relationship: string
  isPrimaryContact: boolean
}

export type CareTimelineEvent = {
  key: string
  kind: CareTimelineEventKind
  label: string
  detail: string
  occurredAt: string
  href?: string
}

export type CareTimelineNextActionTone = 'urgent' | 'warning' | 'steady'

export type CareTimelineNextAction = {
  title: string
  detail: string
  href?: string
  label: string
  tone: CareTimelineNextActionTone
}

export type PersonCareTimeline = {
  events: CareTimelineEvent[]
  nextAction: CareTimelineNextAction
  counts: {
    requests: number
    openRequests: number
    records: number
    communications: number
    households: number
  }
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function parseIso(value: unknown): string | null {
  const raw = text(value)
  if (!raw) return null
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function compact(value: unknown, max = 150): string {
  const raw = text(value).replace(/\s+/g, ' ')
  if (!raw) return ''
  if (raw.length <= max) return raw
  return `${raw.slice(0, max - 1).trimEnd()}...`
}

function formatCommunicationMethod(value: unknown): string {
  const method = text(value).toLowerCase()
  if (method === 'phone') return 'Phone call'
  if (method === 'email') return 'Email'
  if (method === 'voicemail') return 'Voicemail'
  if (method === 'card') return 'Card'
  if (method === 'in_person') return 'In-person'
  return text(value) || 'Contact'
}

function isOpenRequest(request: CareTimelineRequest): boolean {
  return text(request.status) !== 'complete'
}

function personRequestTitle(request: CareTimelineRequest): string {
  const type = formatRequestType(request.request_type) || 'Request'
  const child = text(request.child_name)
  return child ? `${type} for ${child}` : `${type} request`
}

function assignmentLabel(request: CareTimelineRequest): string {
  const people = [
    text(request.assigned_staff_name),
    text(request.assigned_priest_name),
    text(request.assigned_deacon_name),
  ].filter(Boolean)
  return people.length > 0 ? `Owner: ${people.join(', ')}` : 'No owner assigned'
}

export function formatCareTimelineWhen(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function buildCareTimeline(input: {
  requests?: readonly CareTimelineRequest[]
  records?: readonly CareTimelineRecord[]
  communications?: readonly CareTimelineCommunication[]
  households?: readonly CareTimelineHousehold[]
}): CareTimelineEvent[] {
  const events: CareTimelineEvent[] = []

  for (const request of input.requests ?? []) {
    const occurredAt = parseIso(request.created_at)
    if (!occurredAt) continue
    const typeLabel = formatRequestType(request.request_type) || 'Request'
    const child = text(request.child_name)
    events.push({
      key: `request-${request.id}`,
      kind: 'request',
      label: child ? `${typeLabel} request for ${child}` : `${typeLabel} request`,
      detail: [formatRequestStatus(request.status), assignmentLabel(request)]
        .filter(Boolean)
        .join(' | '),
      occurredAt,
      href: `/dashboard/requests/${encodeURIComponent(request.id)}`,
    })

    const followUpAt = parseIso(request.next_follow_up_date)
    if (followUpAt && isOpenRequest(request)) {
      events.push({
        key: `request-follow-up-${request.id}`,
        kind: 'follow_up',
        label: 'Follow-up scheduled',
        detail: personRequestTitle(request),
        occurredAt: followUpAt,
        href: `/dashboard/requests/${encodeURIComponent(request.id)}#next-follow-up`,
      })
    }
  }

  for (const record of input.records ?? []) {
    const occurredAt = parseIso(record.sacrament_date) ?? parseIso(record.created_at)
    if (!occurredAt) continue
    const typeLabel = formatSacramentalRecordType(record.record_type) || 'Sacramental record'
    events.push({
      key: `record-${record.id}`,
      kind: 'record',
      label: `${typeLabel} recorded`,
      detail: text(record.person_name) || 'Register entry linked to this profile.',
      occurredAt,
      href: `/dashboard/records/${encodeURIComponent(record.id)}`,
    })
  }

  for (const communication of input.communications ?? []) {
    const occurredAt = parseIso(communication.contacted_at)
    if (!occurredAt) continue
    const method = formatCommunicationMethod(communication.method)
    events.push({
      key: `communication-${communication.id}`,
      kind: 'communication',
      label: `${method} touchpoint`,
      detail: compact(communication.notes) || communication.requestLabel,
      occurredAt,
      href: `/dashboard/requests/${encodeURIComponent(communication.requestId)}#communication-history`,
    })
  }

  for (const household of input.households ?? []) {
    events.push({
      key: `household-${household.householdId}`,
      kind: 'household',
      label: 'Household relationship',
      detail: `${household.householdName}${household.relationship ? ` | ${household.relationship}` : ''}${
        household.isPrimaryContact ? ' | Primary contact' : ''
      }`,
      occurredAt: new Date(0).toISOString(),
      href: `/dashboard/households/${encodeURIComponent(household.householdId)}`,
    })
  }

  events.sort((a, b) => {
    const diff = new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    if (diff !== 0) return diff
    return a.key.localeCompare(b.key)
  })

  return events
}

export function buildPersonCareTimeline(input: {
  requests?: readonly CareTimelineRequest[]
  records?: readonly CareTimelineRecord[]
  communications?: readonly CareTimelineCommunication[]
  households?: readonly CareTimelineHousehold[]
  now?: Date
}): PersonCareTimeline {
  const now = input.now ?? new Date()
  const requests = input.requests ?? []
  const records = input.records ?? []
  const communications = input.communications ?? []
  const households = input.households ?? []
  const openRequests = requests.filter(isOpenRequest)
  const firstContactNeeded = openRequests.find((request) => !text(request.last_contacted_at))
  const overdueFollowUp = openRequests.find((request) =>
    isNextFollowUpOverdue(request.next_follow_up_date, request.status, now)
  )
  const dueTodayFollowUp = openRequests.find((request) =>
    isNextFollowUpDueToday(request.next_follow_up_date, request.status, now)
  )
  const missingFollowUp = openRequests.find((request) => !text(request.next_follow_up_date))

  let nextAction: CareTimelineNextAction
  if (firstContactNeeded) {
    nextAction = {
      title: 'Log the first pastoral touchpoint',
      detail: `${personRequestTitle(firstContactNeeded)} has no first contact logged yet.`,
      href: `/dashboard/requests/${encodeURIComponent(firstContactNeeded.id)}#communication`,
      label: 'Log contact',
      tone: 'urgent',
    }
  } else if (overdueFollowUp) {
    nextAction = {
      title: 'Catch up on overdue follow-up',
      detail: `${personRequestTitle(overdueFollowUp)} has a follow-up date that has passed.`,
      href: `/dashboard/requests/${encodeURIComponent(overdueFollowUp.id)}#next-follow-up`,
      label: 'Update follow-up',
      tone: 'urgent',
    }
  } else if (dueTodayFollowUp) {
    nextAction = {
      title: 'Follow up today',
      detail: `${personRequestTitle(dueTodayFollowUp)} has a follow-up due today.`,
      href: `/dashboard/requests/${encodeURIComponent(dueTodayFollowUp.id)}#next-follow-up`,
      label: 'Open follow-up',
      tone: 'warning',
    }
  } else if (missingFollowUp) {
    nextAction = {
      title: 'Set the next care follow-up',
      detail: `${personRequestTitle(missingFollowUp)} is open but has no next follow-up date.`,
      href: `/dashboard/requests/${encodeURIComponent(missingFollowUp.id)}#next-follow-up`,
      label: 'Set follow-up',
      tone: 'warning',
    }
  } else if (households.length === 0) {
    nextAction = {
      title: 'Connect this person to a household',
      detail: 'Household context helps staff understand family relationships and care history.',
      href: '/dashboard/households',
      label: 'Review households',
      tone: 'steady',
    }
  } else {
    nextAction = {
      title: 'Care history is organized',
      detail: 'Requests, records, communications, and household context are linked here.',
      label: 'No urgent action',
      tone: 'steady',
    }
  }

  return {
    events: buildCareTimeline({ requests, records, communications, households }),
    nextAction,
    counts: {
      requests: requests.length,
      openRequests: openRequests.length,
      records: records.length,
      communications: communications.length,
      households: households.length,
    },
  }
}
