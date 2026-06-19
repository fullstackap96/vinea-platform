import { formatRequestType } from '@/lib/formatRequestType'
import { formatSacramentalRecordType } from '@/lib/formatSacramentalRecordType'
import { formatRequestStatus } from '@/lib/requestStatus'

export type CareTimelineEventKind = 'request' | 'record' | 'communication' | 'household'

export type CareTimelineRequest = {
  id: string
  request_type: string
  status: string
  child_name?: string | null
  created_at: string
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
      label: `${typeLabel} request`,
      detail: [formatRequestStatus(request.status), child ? `Child: ${child}` : '']
        .filter(Boolean)
        .join(' | '),
      occurredAt,
      href: `/dashboard/requests/${encodeURIComponent(request.id)}`,
    })
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
    const method = text(communication.method) || 'Contact'
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
