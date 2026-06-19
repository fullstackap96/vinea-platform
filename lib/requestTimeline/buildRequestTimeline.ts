import { formatRequestType } from '@/lib/formatRequestType'
import { type RequestScheduleRow } from '@/lib/requestConfirmedSchedule'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import { requestWaitingOnLabel } from '@/lib/requestWaitingOn'
import type { RequestTimelineEvent } from './types'

export type BuildRequestTimelineCommunication = {
  id: string
  contacted_at?: string | null
  created_at?: string | null
  method?: string | null
  notes?: string | null
}

export type BuildRequestTimelineNote = {
  id: string
  created_at: string
  body?: string | null
}

export type BuildRequestTimelineSacramentalRecord = {
  person_name?: string | null
  created_at: string
}

export type BuildRequestTimelineInput = {
  request: {
    created_at?: string | null
    request_type?: unknown
    status?: unknown
    updated_at?: string | null
    last_contacted_at?: string | null
    next_follow_up_date?: string | null
    waiting_on?: unknown
    waiting_on_changed_at?: string | null
  } | null
  scheduleRow: RequestScheduleRow
  communications: BuildRequestTimelineCommunication[]
  requestNotes: BuildRequestTimelineNote[]
  sacramentalRecord: BuildRequestTimelineSacramentalRecord | null
}

export function formatTimelineWhen(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(String(iso))
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function parseIso(value: unknown): string | null {
  if (value == null || String(value).trim() === '') return null
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function communicationOccurredAt(comm: BuildRequestTimelineCommunication): string | null {
  return parseIso(comm.contacted_at) ?? parseIso(comm.created_at)
}

export function isEmailSentCommunication(comm: BuildRequestTimelineCommunication): boolean {
  const notes = String(comm.notes ?? '').trim()
  const method = String(comm.method ?? '').toLowerCase()
  return method === 'email' && notes.toLowerCase().startsWith('email sent:')
}

export function communicationMethodLabel(method: unknown): string {
  const m = String(method ?? '').toLowerCase()
  if (m === 'phone') return 'Phone call'
  if (m === 'text') return 'Text message'
  if (m === 'in_person') return 'In person'
  if (m === 'voicemail') return 'Voicemail'
  if (m === 'email') return 'Email'
  if (m === 'other') return 'Other'
  return ''
}

function communicationDetail(comm: BuildRequestTimelineCommunication): string | undefined {
  if (isEmailSentCommunication(comm)) {
    const subject = String(comm.notes ?? '')
      .replace(/^Email sent:\s*/i, '')
      .trim()
    return subject || undefined
  }

  const methodLabel = communicationMethodLabel(comm.method)
  const notes = String(comm.notes ?? '').trim()
  if (methodLabel && notes) return `${methodLabel}: ${notes}`
  return methodLabel || notes || undefined
}

function compactText(value: unknown, maxLength = 140): string | undefined {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  if (!text) return undefined
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trimEnd()}...`
}

function calendarDateToIso(value: unknown): string | null {
  const raw = String(value ?? '').trim()
  if (!raw) return null
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (match) {
    return new Date(`${raw}T12:00:00.000`).toISOString()
  }
  return parseIso(raw)
}

function formatTimelineDateOnly(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(String(iso))
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function confirmedDateLabel(requestType: string): string {
  const t = requestType.toLowerCase()
  if (t === 'funeral') return 'Funeral service confirmed'
  if (t === 'wedding') return 'Wedding date confirmed'
  if (t === 'ocia') return 'OCIA session confirmed'
  return 'Baptism date confirmed'
}

function getConfirmedScheduleIso(scheduleRow: RequestScheduleRow): string | null {
  const requestType = requestTypeFromRow(scheduleRow)
  if (requestType === 'join_parish') return null

  let value: string | null | undefined
  if (requestType === 'funeral') {
    value = scheduleRow.funeral_detail?.confirmed_service_at
  } else if (requestType === 'wedding') {
    value = scheduleRow.wedding_detail?.confirmed_ceremony_at
  } else if (requestType === 'ocia') {
    value = scheduleRow.ocia_detail?.confirmed_session_at
  } else {
    value = scheduleRow.confirmed_baptism_date
  }

  return parseIso(value)
}

export function buildRequestTimeline(input: BuildRequestTimelineInput): RequestTimelineEvent[] {
  const events: RequestTimelineEvent[] = []

  const requestType = requestTypeFromRow({ request_type: input.request?.request_type })
  const requestTypeLabel = formatRequestType(requestType) || 'Request'
  const submittedAt = parseIso(input.request?.created_at)

  if (submittedAt) {
    events.push({
      key: 'submitted',
      kind: 'submitted',
      label: `${requestTypeLabel} request submitted`,
      occurredAt: submittedAt,
    })
  }

  for (const comm of input.communications) {
    const occurredAt = communicationOccurredAt(comm)
    if (!occurredAt) continue

    const emailSent = isEmailSentCommunication(comm)
    events.push({
      key: `communication-${comm.id}`,
      kind: emailSent ? 'email_sent' : 'communication_logged',
      label: emailSent ? 'Email sent' : 'Communication logged',
      detail: communicationDetail(comm),
      occurredAt,
    })
  }

  for (const note of input.requestNotes) {
    const occurredAt = parseIso(note.created_at)
    if (!occurredAt) continue

    events.push({
      key: `note-${note.id}`,
      kind: 'internal_note',
      label: 'Internal note added',
      detail: compactText(note.body),
      occurredAt,
    })
  }

  const waitingOnLabel = requestWaitingOnLabel(input.request?.waiting_on)
  const waitingOnChangedAt = parseIso(input.request?.waiting_on_changed_at)
  if (waitingOnLabel && waitingOnChangedAt) {
    events.push({
      key: 'waiting-on',
      kind: 'blocked',
      label: 'Request marked blocked',
      detail: `Waiting on ${waitingOnLabel}.`,
      occurredAt: waitingOnChangedAt,
    })
  }

  const nextFollowUpIso = calendarDateToIso(input.request?.next_follow_up_date)
  if (nextFollowUpIso) {
    events.push({
      key: 'next-follow-up',
      kind: 'follow_up_set',
      label: 'Next follow-up set',
      detail: formatTimelineDateOnly(nextFollowUpIso),
      occurredAt: nextFollowUpIso,
    })
  }

  const confirmedAt = getConfirmedScheduleIso(input.scheduleRow)
  if (confirmedAt) {
    events.push({
      key: 'confirmed-date',
      kind: 'confirmed_date',
      label: confirmedDateLabel(requestType),
      detail: formatTimelineWhen(confirmedAt),
      occurredAt: confirmedAt,
    })
  }

  if (input.sacramentalRecord) {
    const occurredAt = parseIso(input.sacramentalRecord.created_at)
    if (occurredAt) {
      const personName = String(input.sacramentalRecord.person_name ?? '').trim()
      events.push({
        key: 'sacramental-record',
        kind: 'sacramental_record',
        label: 'Sacramental record created',
        detail: personName ? `For ${personName}` : undefined,
        occurredAt,
      })
    }
  }

  if (String(input.request?.status ?? '').trim() === 'complete') {
    const occurredAt =
      parseIso(input.request?.updated_at) ??
      parseIso(input.sacramentalRecord?.created_at) ??
      getConfirmedScheduleIso(input.scheduleRow)
    if (occurredAt) {
      events.push({
        key: 'completed',
        kind: 'completed',
        label: 'Request marked complete',
        occurredAt,
      })
    }
  }

  events.sort((a, b) => {
    const timeDiff = new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    if (timeDiff !== 0) return timeDiff
    return a.key.localeCompare(b.key)
  })

  return events
}
