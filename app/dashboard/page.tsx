'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Activity, Calendar, Mail, Phone, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Metrics from './Metrics'
import { RequestLinksSection } from './RequestLinksSection'
import {
  FieldLabel,
  LabelValueGrid,
  LabelValueRow,
} from './requests/[id]/_components/LabelValueGrid'
import { RequestTypeBadge } from '@/app/_components/RequestTypeBadge'
import {
  isMissingConfirmedSchedule,
  missingConfirmedScheduleCopy,
} from '@/lib/requestConfirmedSchedule'
import { primaryButtonMd, primaryButtonSm, secondaryButtonMd, secondaryButtonSm } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import { FormattedDateTimeOrMissing, maybeMissingValue } from '@/lib/missingValue'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { chipBase } from '@/lib/chipStyles'
import { assignmentDisplayLabel } from '@/lib/requestAssignment'
import {
  getStatusLabel,
  requestStatusRankForSort,
  REQUEST_STATUS_VALUES,
} from '@/lib/requestStatus'
import { RequestStatusBadgeWithTooltip } from '@/lib/RequestStatusBadgeWithTooltip'
import {
  followUpSortPriority,
  formatNextFollowUpDateCompact,
  isNextFollowUpDueToday,
  isNextFollowUpOverdue,
  parseFollowUpCalendarDate,
} from '@/lib/nextFollowUpDate'
import { needsAttentionEligible, sortNeedsAttentionRequests } from '@/lib/needsAttention'
import { dashboardOverdueFollowUpCardClasses } from '@/lib/dashboardOverdueCardStyle'
import {
  dashboardCardHoverPolish,
  dashboardRequestLinkCardP4,
  dashboardRequestLinkCardP5,
} from '@/lib/cardStyles'
import {
  labelSacramentalBackground,
  labelSeeking,
} from '@/lib/ociaIntakeOptions'

const FOLLOWUP_STALE_MS = 7 * 24 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

const FOLLOWUP_QUEUE_CONTACT_NOTES = 'Marked as contacted from Follow-Up Queue'

function followUpEmailSubject(request: any) {
  if (request.request_type === 'funeral') {
    const d = String(request.funeral_detail?.deceased_name ?? '').trim()
    return `Following up: Funeral for ${d || 'your loved one'}`
  }
  if (request.request_type === 'wedding') {
    const a = String(request.wedding_detail?.partner_one_name ?? '').trim()
    const b = String(request.wedding_detail?.partner_two_name ?? '').trim()
    const couple = [a, b].filter(Boolean).join(' & ')
    return `Following up: Wedding for ${couple || 'your wedding'}`
  }
  if (request.request_type === 'ocia') {
    const n = String(request.parishioner?.full_name ?? '').trim()
    return `Following up: OCIA inquiry — ${n || 'your inquiry'}`
  }
  const child = String(request.child_name ?? '').trim()
  return `Following up: Baptism for ${child || 'your family'}`
}

export default function DashboardPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<
    'created_desc' | 'created_asc' | 'confirmed_baptism_date' | 'last_contacted' | 'status'
  >('created_desc')

  const [followUpDraftingId, setFollowUpDraftingId] = useState<string | null>(null)
  const [followUpMarkingId, setFollowUpMarkingId] = useState<string | null>(null)
  const [followUpSendingId, setFollowUpSendingId] = useState<string | null>(null)
  const [followUpRowMessages, setFollowUpRowMessages] = useState<Record<string, string>>({})
  const [selectedFollowUpIds, setSelectedFollowUpIds] = useState<Set<string>>(
    () => new Set()
  )
  const [followUpBatchBusy, setFollowUpBatchBusy] = useState<null | 'draft' | 'mark'>(
    null
  )
  const [followUpBatchMessage, setFollowUpBatchMessage] = useState('')

  function toTime(value: any) {
    if (!value) return null
    const d = new Date(String(value))
    const t = d.getTime()
    return Number.isNaN(t) ? null : t
  }

  function wholeDaysSinceTimestamp(ts: number) {
    return Math.floor((Date.now() - ts) / DAY_MS)
  }

  function normalize(value: any) {
    return String(value || '').toLowerCase().trim()
  }

  function sortWithNullsLast(list: any[]) {
    const copy = [...list]
    copy.sort((a, b) => {
      if (sortBy === 'created_desc' || sortBy === 'created_asc') {
        const fp =
          followUpSortPriority(a.next_follow_up_date, a.status) -
          followUpSortPriority(b.next_follow_up_date, b.status)
        if (fp !== 0) return fp
        const at = toTime(a.created_at) ?? 0
        const bt = toTime(b.created_at) ?? 0
        return sortBy === 'created_desc' ? bt - at : at - bt
      }

      if (sortBy === 'confirmed_baptism_date') {
        const at = toTime(a.confirmed_baptism_date)
        const bt = toTime(b.confirmed_baptism_date)
        if (at === null && bt === null) return 0
        if (at === null) return 1
        if (bt === null) return -1
        return at - bt
      }

      if (sortBy === 'last_contacted') {
        const at = toTime(a.last_contacted_at)
        const bt = toTime(b.last_contacted_at)
        if (at === null && bt === null) return 0
        if (at === null) return 1
        if (bt === null) return -1
        return at - bt
      }

      // status
      const ar = requestStatusRankForSort(a.status)
      const br = requestStatusRankForSort(b.status)
      if (ar !== br) return ar - br
      // stable-ish fallback
      const at = toTime(a.created_at) ?? 0
      const bt = toTime(b.created_at) ?? 0
      return bt - at
    })
    return copy
  }

  /** Shared with list badges and Follow-Up Queue membership. */
  function getAttentionState(request: any) {
    const needsConfirmed = isMissingConfirmedSchedule(request)
    const lastContactedTime = toTime(request.last_contacted_at)
    const needsContact =
      lastContactedTime === null || Date.now() - lastContactedTime >= FOLLOWUP_STALE_MS
    const checklistIncomplete = Boolean(request.checklist_incomplete)
    return { needsConfirmed, needsContact, checklistIncomplete }
  }

  function inFollowUpQueue(request: any) {
    if (request.status === 'complete') return false
    const { needsConfirmed, needsContact, checklistIncomplete } = getAttentionState(request)
    return needsContact || needsConfirmed || checklistIncomplete
  }

  function buildFollowUpContext(request: any) {
    const { needsConfirmed, needsContact, checklistIncomplete } = getAttentionState(request)
    const lines: string[] = []
    if (needsContact) {
      lines.push(
        '- Follow-up is needed: the family has not been contacted recently (never contacted, or last contact was more than 7 days ago).'
      )
    }
    if (needsConfirmed) {
      lines.push(missingConfirmedScheduleCopy(request.request_type).followUpContextLine)
    }
    if (checklistIncomplete) {
      lines.push('- Parish checklist items for this request are not all complete.')
    }
    return lines.join('\n')
  }

  function renderRequestDetailLines(request: any) {
    const rt = String(request.request_type || 'baptism')
    const isFuneral = rt === 'funeral'
    const isWedding = rt === 'wedding'
    const isOcia = rt === 'ocia'
    return (
      <LabelValueGrid>
        <LabelValueRow
          label={<FieldLabel icon={User}>Contact</FieldLabel>}
          value={maybeMissingValue(String(request.parishioner?.full_name ?? '').trim() || '—')}
        />
        <LabelValueRow
          label={<FieldLabel icon={Mail}>Email</FieldLabel>}
          value={maybeMissingValue(String(request.parishioner?.email ?? '').trim() || '—')}
        />
        <LabelValueRow
          label="Staff"
          value={maybeMissingValue(assignmentDisplayLabel(request.assigned_staff_name))}
        />
        <LabelValueRow
          label="Priest"
          value={maybeMissingValue(assignmentDisplayLabel(request.assigned_priest_name))}
        />
        <LabelValueRow
          label="Deacon"
          value={maybeMissingValue(assignmentDisplayLabel(request.assigned_deacon_name))}
        />
        {isFuneral ? (
          <>
            <LabelValueRow
              label="Deceased"
              value={maybeMissingValue(String(request.funeral_detail?.deceased_name ?? '').trim() || '—')}
            />
            <LabelValueRow
              label={<FieldLabel icon={Calendar}>Confirmed service</FieldLabel>}
              value={<FormattedDateTimeOrMissing value={request.funeral_detail?.confirmed_service_at} />}
            />
          </>
        ) : isWedding ? (
          <>
            <LabelValueRow
              label="Partners"
              value={maybeMissingValue(
                [request.wedding_detail?.partner_one_name, request.wedding_detail?.partner_two_name]
                  .filter(Boolean)
                  .join(' & ') || '—'
              )}
            />
            <LabelValueRow
              label={<FieldLabel icon={Calendar}>Confirmed ceremony</FieldLabel>}
              value={<FormattedDateTimeOrMissing value={request.wedding_detail?.confirmed_ceremony_at} />}
            />
            <LabelValueRow
              label={<FieldLabel icon={Calendar}>Proposed date</FieldLabel>}
              value={maybeMissingValue(
                request.wedding_detail?.proposed_wedding_date
                  ? String(request.wedding_detail.proposed_wedding_date)
                  : '—'
              )}
            />
          </>
        ) : isOcia ? (
          <>
            <LabelValueRow
              label="Seeking"
              value={maybeMissingValue(labelSeeking(request.ocia_detail?.seeking))}
            />
            <LabelValueRow
              label="Sacramental background"
              value={maybeMissingValue(
                labelSacramentalBackground(request.ocia_detail?.sacramental_background)
              )}
            />
            <LabelValueRow
              label="Parishioner status"
              value={maybeMissingValue(String(request.ocia_detail?.parishioner_status ?? '').trim() || '—')}
            />
            <LabelValueRow
              label={<FieldLabel icon={Calendar}>Confirmed OCIA meeting</FieldLabel>}
              value={<FormattedDateTimeOrMissing value={request.ocia_detail?.confirmed_session_at} />}
            />
          </>
        ) : (
          <>
            <LabelValueRow
              label="Child"
              value={maybeMissingValue(String(request.child_name ?? '').trim() || '—')}
            />
            <LabelValueRow
              label={<FieldLabel icon={Calendar}>Confirmed date</FieldLabel>}
              value={<FormattedDateTimeOrMissing value={request.confirmed_baptism_date} />}
            />
            <LabelValueRow
              label={<FieldLabel icon={Calendar}>Preferred dates</FieldLabel>}
              value={maybeMissingValue(String(request.preferred_dates ?? '').trim() || '—')}
            />
          </>
        )}
        <LabelValueRow
          label={<FieldLabel icon={Activity}>Status</FieldLabel>}
          value={
            <span className="inline-flex flex-wrap items-center gap-2">
              <RequestStatusBadgeWithTooltip status={request.status} />
            </span>
          }
        />
        {parseFollowUpCalendarDate(request.next_follow_up_date) ? (
          <LabelValueRow
            label={<FieldLabel icon={Calendar}>Follow-up</FieldLabel>}
            value={
              <span className="flex flex-wrap items-center gap-2">
                {isNextFollowUpOverdue(request.next_follow_up_date, request.status) && (
                  <span
                    className={`${chipBase} bg-red-50 text-red-900 border border-red-200`}
                  >
                    Overdue
                  </span>
                )}
                {isNextFollowUpDueToday(request.next_follow_up_date, request.status) &&
                  !isNextFollowUpOverdue(
                    request.next_follow_up_date,
                    request.status
                  ) && (
                    <span
                      className={`${chipBase} bg-amber-50 text-amber-900 border border-amber-200`}
                    >
                      Due today
                    </span>
                  )}
                <span>{formatNextFollowUpDateCompact(request.next_follow_up_date)}</span>
              </span>
            }
          />
        ) : (
          <LabelValueRow
            label={<FieldLabel icon={Calendar}>Follow-up</FieldLabel>}
            value={maybeMissingValue('Not set')}
          />
        )}
        <LabelValueRow
          label={<FieldLabel icon={Calendar}>Last contacted</FieldLabel>}
          value={<FormattedDateTimeOrMissing value={request.last_contacted_at} />}
        />
        <LabelValueRow label="Request ID" value={String(request.id)} />
      </LabelValueGrid>
    )
  }

  function renderRequestSummary(request: any) {
    const { needsConfirmed, needsContact, checklistIncomplete } = getAttentionState(request)
    const isNew = request.status === 'new'

    const badges: Array<{ key: string; label: string; className: string }> = []
    if (isNew)
      badges.push({
        key: 'new',
        label: getStatusLabel('new'),
        className: 'bg-blue-50 text-blue-900 border border-blue-200',
      })
    if (needsConfirmed)
      badges.push({
        key: 'no_confirmed',
        label: missingConfirmedScheduleCopy(request.request_type).badge,
        className: 'bg-orange-50 text-orange-900 border border-orange-200',
      })
    if (needsContact)
      badges.push({
        key: 'needs_contact',
        label: 'Needs contact',
        className: 'bg-red-50 text-red-900 border border-red-200',
      })
    if (checklistIncomplete)
      badges.push({
        key: 'checklist',
        label: 'Checklist incomplete',
        className: 'bg-amber-50 text-amber-900 border border-amber-200',
      })
    if (isNextFollowUpOverdue(request.next_follow_up_date, request.status)) {
      badges.push({
        key: 'follow_up_overdue',
        label: 'Follow-up overdue',
        className: 'bg-red-50 text-red-900 border border-red-200',
      })
    } else if (
      isNextFollowUpDueToday(request.next_follow_up_date, request.status)
    ) {
      badges.push({
        key: 'follow_up_today',
        label: 'Follow-up due today',
        className: 'bg-amber-50 text-amber-900 border border-amber-200',
      })
    }

    return (
      <>
        <div className="mb-2">
          <RequestTypeBadge requestType={request.request_type} />
        </div>
        {badges.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-2">
            {badges.map((b) => (
              <span
                key={b.key}
                className={`${chipBase} ${b.className}`}
              >
                {b.label}
              </span>
            ))}
          </div>
        )}
        {renderRequestDetailLines(request)}
      </>
    )
  }

  /** Short highlight lines for Follow-Up Queue cards (scan-friendly). */
  function followUpQueueHighlightLines(request: any): string[] {
    const { needsConfirmed, needsContact, checklistIncomplete } = getAttentionState(request)
    const lines: string[] = []
    if (needsContact) {
      const last = toTime(request.last_contacted_at)
      if (last === null) {
        lines.push('Never contacted')
      } else {
        const days = wholeDaysSinceTimestamp(last)
        lines.push(days <= 0 ? 'Last touch: today' : `${days}d since last contact`)
      }
    }
    if (needsConfirmed) {
      lines.push(missingConfirmedScheduleCopy(request.request_type).badge)
    }
    if (checklistIncomplete) {
      const n = Number(request.checklist_incomplete_count ?? 0)
      lines.push(n === 1 ? '1 checklist item open' : `${n} checklist items open`)
    }
    if (isNextFollowUpOverdue(request.next_follow_up_date, request.status)) {
      lines.push('Follow-up overdue')
    } else if (
      isNextFollowUpDueToday(request.next_follow_up_date, request.status)
    ) {
      lines.push('Follow-up due today')
    }
    return lines
  }

  function renderNeedsAttentionCard(request: any) {
    const id = String(request.id)
    const name = String(request.parishioner?.full_name ?? '').trim() || '—'
    const priestLabel = assignmentDisplayLabel(request.assigned_priest_name)
    const deaconLabel = assignmentDisplayLabel(request.assigned_deacon_name)
    const overdue = isNextFollowUpOverdue(request.next_follow_up_date, request.status)
    const dueToday = isNextFollowUpDueToday(request.next_follow_up_date, request.status)
    const hasFollowUpDate = Boolean(parseFollowUpCalendarDate(request.next_follow_up_date))
    const dateLabel = hasFollowUpDate
      ? formatNextFollowUpDateCompact(request.next_follow_up_date)
      : 'Not set'

    return (
      <Link
        key={id}
        href={`/dashboard/requests/${id}`}
        className={`${dashboardRequestLinkCardP5} ${
          overdue ? dashboardOverdueFollowUpCardClasses : ''
        }`.trim()}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <RequestTypeBadge requestType={request.request_type} />
            </div>
            <p className="text-lg font-semibold text-gray-900 break-words">
              {maybeMissingValue(name)}
            </p>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm text-gray-500">Status</span>
              <RequestStatusBadgeWithTooltip status={request.status} />
            </p>
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
              <span className="text-gray-500">Staff</span>
              <span className="font-medium text-gray-800">
                {maybeMissingValue(assignmentDisplayLabel(request.assigned_staff_name))}
              </span>
            </p>
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
              <span className="text-gray-500">Priest</span>
              <span className="font-medium text-gray-800">{maybeMissingValue(priestLabel)}</span>
            </p>
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
              <span className="text-gray-500">Deacon</span>
              <span className="font-medium text-gray-800">{maybeMissingValue(deaconLabel)}</span>
            </p>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm">
              <span className="shrink-0 text-gray-500">Follow-up</span>
              <span className="inline-flex flex-wrap items-center gap-2">
                {overdue ? (
                  <span
                    className={`${chipBase} bg-red-50 text-red-900 border border-red-200`}
                  >
                    Overdue
                  </span>
                ) : null}
                {dueToday && !overdue ? (
                  <span
                    className={`${chipBase} bg-amber-50 text-amber-900 border border-amber-200`}
                  >
                    Due today
                  </span>
                ) : null}
                <span className="font-medium text-gray-800">{maybeMissingValue(dateLabel)}</span>
              </span>
            </p>
          </div>
          <div className="shrink-0 w-full sm:w-auto sm:pt-0.5">
            <span className={`${secondaryButtonMd} w-full sm:w-auto`}>Open Request</span>
          </div>
        </div>
      </Link>
    )
  }

  function dashboardRequestLink(request: any) {
    const followUpOverdue = isNextFollowUpOverdue(
      request.next_follow_up_date,
      request.status
    )
    return (
      <Link
        key={request.id}
        href={`/dashboard/requests/${request.id}`}
        className={`${dashboardRequestLinkCardP4} ${
          followUpOverdue ? dashboardOverdueFollowUpCardClasses : ''
        }`.trim()}
      >
        {renderRequestSummary(request)}
      </Link>
    )
  }

  function setFollowUpRowMessage(requestId: string, message: string) {
    setFollowUpRowMessages((prev) => {
      const next = { ...prev }
      if (!message) delete next[requestId]
      else next[requestId] = message
      return next
    })
  }

  function toggleFollowUpSelection(requestId: string) {
    setSelectedFollowUpIds((prev) => {
      const next = new Set(prev)
      if (next.has(requestId)) next.delete(requestId)
      else next.add(requestId)
      return next
    })
  }

  async function runDraftFollowUpCore(
    request: any
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const id = String(request.id)
    try {
      const requestType = String(request.request_type || 'baptism')
      const payload: Record<string, unknown> = {
        requestType,
        fullName: request.parishioner?.full_name ?? '',
        email: request.parishioner?.email ?? '',
        notes: request.notes ?? '',
        intent: 'followup',
        followUpContext: buildFollowUpContext(request),
      }
      if (requestType === 'funeral') {
        const fd = request.funeral_detail
        payload.deceasedName = fd?.deceased_name ?? ''
        payload.dateOfDeath = fd?.date_of_death ?? ''
        payload.funeralHome = fd?.funeral_home_or_location ?? ''
        payload.preferredServiceNotes = fd?.preferred_service_notes ?? ''
      } else if (requestType === 'wedding') {
        const wd = request.wedding_detail
        payload.partnerOneName = wd?.partner_one_name ?? ''
        payload.partnerTwoName = wd?.partner_two_name ?? ''
        payload.proposedWeddingDate = wd?.proposed_wedding_date ?? ''
        payload.ceremonyNotes = wd?.ceremony_notes ?? ''
      } else if (requestType === 'ocia') {
        const od = request.ocia_detail
        payload.phone = request.parishioner?.phone ?? ''
        payload.dateOfBirth = od?.date_of_birth ?? ''
        payload.ageOrDobNote = od?.age_or_dob_note ?? ''
        payload.sacramentalBackground = od?.sacramental_background ?? ''
        payload.seeking = od?.seeking ?? ''
        payload.parishionerStatus = od?.parishioner_status ?? ''
        payload.preferredContactMethod = od?.preferred_contact_method ?? ''
        payload.availability = od?.availability ?? ''
      } else {
        payload.childName = request.child_name ?? ''
        payload.preferredDates = request.preferred_dates ?? ''
      }

      const res = await fetch('/api/ai/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorText = await res.text()
        return { ok: false, error: errorText }
      }

      const data = await res.json()
      const replyText = data.reply || 'No reply returned.'
      if (typeof replyText !== 'string' || !replyText.trim()) {
        return { ok: false, error: 'Empty response.' }
      }

      const { error: updateErr } = await supabase
        .from('requests')
        .update({ reply_draft: replyText })
        .eq('id', id)

      if (updateErr) {
        return { ok: false, error: updateErr.message }
      }

      return { ok: true }
    } catch (error: any) {
      return { ok: false, error: error?.message || 'Unknown error' }
    }
  }

  async function runMarkFollowUpAsContactedCore(
    request: any,
    contactedAtIso: string
  ): Promise<
    | { ok: true }
    | { ok: false; error: string; historyInserted?: boolean }
  > {
    const id = String(request.id)
    try {
      const insertRes = await supabase.from('request_communications').insert({
        request_id: id,
        contacted_at: contactedAtIso,
        method: 'email',
        notes: FOLLOWUP_QUEUE_CONTACT_NOTES,
      })

      if (insertRes.error) {
        return { ok: false, error: insertRes.error.message }
      }

      const updateRes = await supabase
        .from('requests')
        .update({
          last_contacted_at: contactedAtIso,
          last_contact_method: 'email',
          communication_notes: FOLLOWUP_QUEUE_CONTACT_NOTES,
        })
        .eq('id', id)

      if (updateRes.error) {
        return {
          ok: false,
          error: updateRes.error.message,
          historyInserted: true,
        }
      }

      return { ok: true }
    } catch (error: any) {
      return { ok: false, error: error?.message || 'Unknown error' }
    }
  }

  async function draftFollowUpEmail(request: any) {
    const id = String(request.id)
    setFollowUpDraftingId(id)
    setFollowUpRowMessage(id, '')
    try {
      const result = await runDraftFollowUpCore(request)
      if (!result.ok) {
        setFollowUpRowMessage(id, `Draft failed: ${result.error}`)
        return
      }

      setFollowUpRowMessage(
        id,
        'Follow-up draft saved. You can send from the queue or open the full request.'
      )
      await loadRequests(true)
    } catch (error: any) {
      setFollowUpRowMessage(id, `Draft failed: ${error?.message || 'Unknown error'}`)
    } finally {
      setFollowUpDraftingId(null)
    }
  }

  async function sendFollowUpEmail(request: any) {
    const id = String(request.id)
    const to = String(request.parishioner?.email || '').trim()
    const subject = followUpEmailSubject(request)
    const text = String(request.reply_draft || '').trim()

    if (!to) {
      setFollowUpRowMessage(id, 'Send failed: recipient email is missing.')
      return
    }
    if (!text) {
      setFollowUpRowMessage(id, 'Send failed: generate a follow-up draft first.')
      return
    }

    setFollowUpSendingId(id)
    setFollowUpRowMessage(id, '')
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ to, subject, text }),
      })

      const payload = await res.json().catch(() => ({} as any))
      if (!res.ok || !payload?.ok) {
        const err = payload?.error || `Send failed (${res.status})`
        setFollowUpRowMessage(id, String(err))
        return
      }

      const contactedAtIso = new Date().toISOString()
      const summary = `Email sent: ${subject}`

      const insertRes = await supabase.from('request_communications').insert({
        request_id: id,
        contacted_at: contactedAtIso,
        method: 'email',
        notes: summary,
      })

      if (insertRes.error) {
        setFollowUpRowMessage(
          id,
          `Email sent, but failed logging communication: ${insertRes.error.message}`
        )
        await loadRequests(true)
        return
      }

      const updateRes = await supabase
        .from('requests')
        .update({
          last_contacted_at: contactedAtIso,
          last_contact_method: 'email',
          communication_notes: summary,
        })
        .eq('id', id)

      if (updateRes.error) {
        setFollowUpRowMessage(
          id,
          `Email sent and logged, but failed updating summary fields: ${updateRes.error.message}`
        )
        await loadRequests(true)
        return
      }

      setFollowUpRowMessage(id, 'Follow-up email sent successfully.')
      await loadRequests(true)
    } catch (error: any) {
      setFollowUpRowMessage(id, `Send failed: ${error?.message || 'Unknown error'}`)
    } finally {
      setFollowUpSendingId(null)
    }
  }

  async function markFollowUpAsContacted(request: any) {
    const id = String(request.id)
    setFollowUpMarkingId(id)
    setFollowUpRowMessage(id, '')
    try {
      const contactedAtIso = new Date().toISOString()
      const result = await runMarkFollowUpAsContactedCore(request, contactedAtIso)

      if (!result.ok) {
        if (result.historyInserted) {
          setFollowUpRowMessage(
            id,
            `Logged history, but failed updating request: ${result.error}`
          )
          await loadRequests(true)
        } else {
          setFollowUpRowMessage(
            id,
            `Could not log communication: ${result.error}`
          )
        }
        return
      }

      setFollowUpRowMessage(id, 'Marked as contacted.')
      await loadRequests(true)
    } catch (error: any) {
      setFollowUpRowMessage(id, `Error: ${error?.message || 'Unknown error'}`)
    } finally {
      setFollowUpMarkingId(null)
    }
  }

  function followUpQueueRow(request: any) {
    const id = String(request.id)
    const followUpGlobalBusy =
      followUpBatchBusy !== null ||
      followUpDraftingId !== null ||
      followUpMarkingId !== null ||
      followUpSendingId !== null

    const selectionLocked = loading || followUpGlobalBusy

    const hasDraft = Boolean(String(request.reply_draft || '').trim())
    const hasRecipient = Boolean(String(request.parishioner?.email || '').trim())
    const sendDisabled =
      loading ||
      followUpGlobalBusy ||
      !hasDraft ||
      !hasRecipient

    const followUpOverdue = isNextFollowUpOverdue(
      request.next_follow_up_date,
      request.status
    )

    const displayName =
      String(request.parishioner?.full_name ?? '').trim() || '—'
    const email = String(request.parishioner?.email ?? '').trim()
    const phone = String(request.parishioner?.phone ?? '').trim()
    const staff = assignmentDisplayLabel(request.assigned_staff_name)
    const priest = assignmentDisplayLabel(request.assigned_priest_name)
    const deacon = assignmentDisplayLabel(request.assigned_deacon_name)
    const highlightLines = followUpQueueHighlightLines(request)
    const emailSubject = followUpEmailSubject(request)

    return (
      <div
        key={id}
        className={`rounded-xl border border-gray-200 p-3 shadow-sm ${dashboardCardHoverPolish} ${
          followUpOverdue ? dashboardOverdueFollowUpCardClasses : 'bg-white'
        }`}
      >
        <div className="flex gap-3 items-start">
          <label className="flex items-center gap-2 pt-1 shrink-0 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={selectedFollowUpIds.has(id)}
              disabled={selectionLocked}
              onChange={() => toggleFollowUpSelection(id)}
              className="rounded border-gray-400"
            />
            <span className="sr-only">Select for batch actions</span>
          </label>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="space-y-1">
                  <p className="text-base font-bold text-gray-900 break-words">
                    {maybeMissingValue(displayName)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <RequestTypeBadge requestType={request.request_type} />
                    <RequestStatusBadgeWithTooltip status={request.status} />
                  </div>
                </div>

                {highlightLines.length > 0 ? (
                  <div className="rounded-md bg-gray-50 px-2.5 py-1.5">
                    <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Highlights
                    </p>
                    <ul className="space-y-0.5" aria-label="Queue highlights">
                      {highlightLines.map((line, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-gray-700">
                          <span className="shrink-0 text-gray-300" aria-hidden>
                            ·
                          </span>
                          <span className="min-w-0 leading-snug">{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                  <div>
                    <p className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                      <User className="h-4 w-4 shrink-0 text-brand" aria-hidden />
                      Contact
                    </p>
                    <div className="space-y-0.5">
                      {email ? (
                        <p className="flex gap-1.5 break-all text-sm font-medium text-gray-800">
                          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                          <span className="min-w-0">{email}</span>
                        </p>
                      ) : (
                        <p className="text-xs">{maybeMissingValue('No email on file')}</p>
                      )}
                      {phone ? (
                        <p className="flex gap-1.5 text-xs text-gray-600">
                          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                          <span className="min-w-0">{phone}</span>
                        </p>
                      ) : null}
                      <p className="text-xs text-gray-600">
                        <span className="text-gray-500">Staff</span>{' '}
                        <span className="font-medium text-gray-800">
                          {maybeMissingValue(staff)}
                        </span>
                        {' · '}
                        <span className="text-gray-500">Priest</span>{' '}
                        <span className="font-medium text-gray-800">
                          {maybeMissingValue(priest)}
                        </span>
                        {' · '}
                        <span className="text-gray-500">Deacon</span>{' '}
                        <span className="font-medium text-gray-800">
                          {maybeMissingValue(deacon)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                      Email subject
                    </p>
                    <p
                      className="line-clamp-2 text-sm font-medium leading-snug text-gray-800"
                      title={emailSubject}
                    >
                      {emailSubject}
                    </p>
                  </div>
                </div>

                {followUpRowMessages[id] ? (
                  <InlineFormMessage message={followUpRowMessages[id]} className="!mt-0" />
                ) : null}
              </div>

              <div className="shrink-0 sm:w-[18rem]">
                <div className="space-y-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                    Actions
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      disabled={loading || followUpGlobalBusy}
                      onClick={() => draftFollowUpEmail(request)}
                      className={`${primaryButtonMd} w-full justify-center`}
                    >
                      {followUpDraftingId === id ? 'Drafting...' : 'Draft follow-up email'}
                    </button>
                    <button
                      type="button"
                      disabled={sendDisabled}
                      onClick={() => sendFollowUpEmail(request)}
                      className={`${primaryButtonMd} w-full justify-center`}
                    >
                      {followUpSendingId === id ? 'Sending...' : 'Send follow-up email'}
                    </button>
                    <button
                      type="button"
                      disabled={loading || followUpGlobalBusy}
                      onClick={() => markFollowUpAsContacted(request)}
                      className={`${secondaryButtonMd} w-full justify-center`}
                    >
                      {followUpMarkingId === id ? 'Saving...' : 'Mark as Contacted'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {hasDraft ? 'Draft ready to send' : maybeMissingValue('No draft saved yet')}
                  </p>
                  <Link
                    href={`/dashboard/requests/${id}`}
                    className="inline-block text-xs font-medium text-blue-800 underline decoration-blue-800/80 underline-offset-2 hover:text-blue-950"
                  >
                    Open full request
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  async function loadRequests(silent = false) {
    if (!silent) setLoading(true)

    const { data, error } = await supabase
      .from('requests')
      .select(`
        id,
        request_type,
        status,
        child_name,
        preferred_dates,
        notes,
        reply_draft,
        created_at,
        parishioner_id,
        confirmed_baptism_date,
        last_contacted_at,
        assigned_staff_name,
        assigned_priest_name,
        assigned_deacon_name,
        next_follow_up_date
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading requests:', error)
      if (!silent) setLoading(false)
      return
    }

    if (!data) {
      setRequests([])
      if (!silent) setLoading(false)
      return
    }

    const requestRows = data || []

    const parishionerIds = requestRows
      .map((request) => request.parishioner_id)
      .filter(Boolean)

    const { data: parishionersData } = await supabase
      .from('parishioners')
      .select('id, full_name, email, phone')
      .in('id', parishionerIds)

    const requestIds = requestRows.map((r) => r.id).filter(Boolean)
    let checklistIncompleteCountByRequestId = new Map<string, number>()
    if (requestIds.length > 0) {
      const { data: checklistData, error: checklistError } = await supabase
        .from('checklist_items')
        .select('request_id, is_complete')
        .in('request_id', requestIds)

      if (checklistError) {
        console.error('Error loading checklist items:', checklistError)
      } else {
        checklistIncompleteCountByRequestId = new Map<string, number>()
        for (const item of checklistData || []) {
          const reqId = String(item.request_id)
          if (item.is_complete === false) {
            checklistIncompleteCountByRequestId.set(
              reqId,
              (checklistIncompleteCountByRequestId.get(reqId) ?? 0) + 1
            )
          }
        }
      }
    }

    const mergedRequests = requestRows.map((request) => {
      const matchingParishioner = parishionersData?.find(
        (p) => p.id === request.parishioner_id
      )

      const checklistIncompleteCount =
        checklistIncompleteCountByRequestId.get(String(request.id)) ?? 0

      return {
        ...request,
        parishioner: matchingParishioner || null,
        checklist_incomplete: checklistIncompleteCount > 0,
        checklist_incomplete_count: checklistIncompleteCount,
      }
    })

    const funeralIds = mergedRequests
      .filter((r) => r.request_type === 'funeral')
      .map((r) => String(r.id))

    let funeralById = new Map<string, Record<string, unknown>>()
    if (funeralIds.length > 0) {
      const { data: funeralRows } = await supabase
        .from('funeral_request_details')
        .select('*')
        .in('request_id', funeralIds)

      for (const row of funeralRows || []) {
        funeralById.set(String(row.request_id), row as Record<string, unknown>)
      }
    }

    const withFuneral = mergedRequests.map((r) => ({
      ...r,
      funeral_detail:
        r.request_type === 'funeral'
          ? funeralById.get(String(r.id)) ?? null
          : null,
    }))

    const weddingIds = withFuneral
      .filter((r) => r.request_type === 'wedding')
      .map((r) => String(r.id))

    let weddingById = new Map<string, Record<string, unknown>>()
    if (weddingIds.length > 0) {
      const { data: weddingRows } = await supabase
        .from('wedding_request_details')
        .select('*')
        .in('request_id', weddingIds)

      for (const row of weddingRows || []) {
        weddingById.set(String(row.request_id), row as Record<string, unknown>)
      }
    }

    const withWedding = withFuneral.map((r) => ({
      ...r,
      wedding_detail:
        r.request_type === 'wedding'
          ? weddingById.get(String(r.id)) ?? null
          : null,
    }))

    const ociaIds = withWedding
      .filter((r) => r.request_type === 'ocia')
      .map((r) => String(r.id))

    let ociaById = new Map<string, Record<string, unknown>>()
    if (ociaIds.length > 0) {
      const { data: ociaRows } = await supabase
        .from('ocia_request_details')
        .select('*')
        .in('request_id', ociaIds)

      for (const row of ociaRows || []) {
        ociaById.set(String(row.request_id), row as Record<string, unknown>)
      }
    }

    const withDetails = withWedding.map((r) => ({
      ...r,
      ocia_detail:
        r.request_type === 'ocia' ? ociaById.get(String(r.id)) ?? null : null,
    }))

    setRequests(withDetails)
    if (!silent) setLoading(false)
  }

  useEffect(() => {
    loadRequests(false)
  }, [])

  useEffect(() => {
    setSelectedFollowUpIds(new Set())
    setFollowUpBatchMessage('')
  }, [statusFilter, searchQuery])

  const filteredRequests =
    statusFilter === 'all'
      ? requests
      : requests.filter((request) => request.status === statusFilter)

  const searchedRequests = (() => {
    const q = normalize(searchQuery)
    if (!q) return filteredRequests

    return filteredRequests.filter((request) => {
      const parentName = normalize(request.parishioner?.full_name)
      const email = normalize(request.parishioner?.email)
      const childName = normalize(request.child_name)
      const deceased = normalize(request.funeral_detail?.deceased_name)
      const p1 = normalize(request.wedding_detail?.partner_one_name)
      const p2 = normalize(request.wedding_detail?.partner_two_name)
      const ociaSeek = normalize(labelSeeking(request.ocia_detail?.seeking))
      const ociaSac = normalize(
        labelSacramentalBackground(request.ocia_detail?.sacramental_background)
      )
      const ociaParish = normalize(request.ocia_detail?.parishioner_status)
      const staffAssignee = normalize(request.assigned_staff_name)
      const priestAssignee = normalize(request.assigned_priest_name)
      const deaconAssignee = normalize(request.assigned_deacon_name)
      const followUpYmd = normalize(parseFollowUpCalendarDate(request.next_follow_up_date))
      const followUpCompact = normalize(
        formatNextFollowUpDateCompact(request.next_follow_up_date)
      )
      return (
        parentName.includes(q) ||
        email.includes(q) ||
        childName.includes(q) ||
        deceased.includes(q) ||
        p1.includes(q) ||
        p2.includes(q) ||
        ociaSeek.includes(q) ||
        ociaSac.includes(q) ||
        ociaParish.includes(q) ||
        staffAssignee.includes(q) ||
        priestAssignee.includes(q) ||
        deaconAssignee.includes(q) ||
        followUpYmd.includes(q) ||
        followUpCompact.includes(q)
      )
    })
  })()

  const visibleRequests = sortWithNullsLast(searchedRequests)
  const followUpVisible = sortWithNullsLast(searchedRequests.filter(inFollowUpQueue))

  const needsAttentionSorted = useMemo(
    () => sortNeedsAttentionRequests(requests.filter(needsAttentionEligible)),
    [requests]
  )

  const followUpToolbarLocked =
    loading ||
    followUpBatchBusy !== null ||
    followUpDraftingId !== null ||
    followUpMarkingId !== null ||
    followUpSendingId !== null

  async function batchDraftFollowUpEmails() {
    const ids = Array.from(selectedFollowUpIds)
    if (ids.length === 0) return

    setFollowUpBatchBusy('draft')
    setFollowUpBatchMessage('')
    const failures: string[] = []
    let ok = 0

    for (const id of ids) {
      const request = requests.find((r) => String(r.id) === id)
      if (!request) {
        failures.push(`${id}: request not found`)
        continue
      }
      const result = await runDraftFollowUpCore(request)
      if (result.ok) ok++
      else failures.push(`${id}: ${result.error}`)
    }

    let msg = `Batch drafts finished: ${ok} saved`
    if (failures.length > 0) {
      msg += `, ${failures.length} failed. ${failures.join(' ')}`
    } else {
      msg += '.'
    }
    setFollowUpBatchMessage(msg)
    setSelectedFollowUpIds(new Set())
    await loadRequests(true)
    setFollowUpBatchBusy(null)
  }

  async function batchMarkFollowUpAsContacted() {
    const ids = Array.from(selectedFollowUpIds)
    if (ids.length === 0) return

    setFollowUpBatchBusy('mark')
    setFollowUpBatchMessage('')
    const contactedAtIso = new Date().toISOString()
    const failures: string[] = []
    let ok = 0

    for (const id of ids) {
      const request = requests.find((r) => String(r.id) === id)
      if (!request) {
        failures.push(`${id}: request not found`)
        continue
      }
      const result = await runMarkFollowUpAsContactedCore(request, contactedAtIso)
      if (result.ok) ok++
      else {
        const detail =
          result.historyInserted
            ? `history logged but request update failed (${result.error})`
            : result.error
        failures.push(`${id}: ${detail}`)
      }
    }

    let msg = `Batch mark finished: ${ok} updated`
    if (failures.length > 0) {
      msg += `, ${failures.length} failed. ${failures.join(' ')}`
    } else {
      msg += '.'
    }
    setFollowUpBatchMessage(msg)
    setSelectedFollowUpIds(new Set())
    await loadRequests(true)
    setFollowUpBatchBusy(null)
  }

  function selectAllFollowUpVisible() {
    setSelectedFollowUpIds(new Set(followUpVisible.map((r) => String(r.id))))
  }

  function clearFollowUpSelection() {
    setSelectedFollowUpIds(new Set())
  }

  const statusFilterOptions = [
    { value: 'all' as const, label: 'All' },
    ...REQUEST_STATUS_VALUES.map((value) => ({
      value,
      label: getStatusLabel(value),
    })),
  ]

  return (
    <main className="mx-auto min-h-full w-full max-w-5xl bg-gray-50 px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-5">
      <header className="mb-4 sm:mb-5">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of parish requests and activity
        </p>
      </header>

      <div className="space-y-4 sm:space-y-5">
      <section
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm ring-1 ring-brand/10 sm:p-6"
        aria-labelledby="action-required-heading"
        aria-busy={loading}
      >
        <h2 id="action-required-heading" className={sectionHeadingClassName}>
          Action Required
        </h2>
        <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
          These requests need your attention today.
        </p>
        <div className="mt-3 space-y-3">
          {loading ? (
            <div
              role="status"
              aria-live="polite"
              aria-label="Loading action required requests"
              className="space-y-4"
            >
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-6 w-28 rounded-md bg-gray-200" />
                      <div className="h-4 w-[85%] max-w-xs rounded-md bg-gray-200 sm:w-72" />
                      <div className="h-4 w-40 rounded-md bg-gray-200" />
                      <div className="h-4 w-52 rounded-md bg-gray-200" />
                      <div className="h-4 w-44 rounded-md bg-gray-200" />
                    </div>
                    <div className="h-10 w-full shrink-0 rounded-md bg-gray-200 sm:mt-0.5 sm:w-[8.75rem]" />
                  </div>
                </div>
              ))}
            </div>
          ) : needsAttentionSorted.length === 0 ? (
            <div
              className="mx-auto max-w-2xl rounded-xl border border-dashed border-gray-300 bg-white px-5 py-10 text-center shadow-sm"
              role="status"
            >
              <p className="text-sm font-medium text-gray-900">
                No requests need attention
              </p>
              <p className="mt-2 max-w-md mx-auto text-sm text-gray-600 leading-relaxed">
                Open requests appear here when a follow-up is overdue or due today, or when
                no staff member is assigned. If those are up to date, an empty list means you
                are in good shape.
              </p>
            </div>
          ) : (
            needsAttentionSorted.map((request) => renderNeedsAttentionCard(request))
          )}
        </div>
      </section>

      {/* Metrics summary (global counts from the full loaded requests array) */}
      <Metrics requests={requests} loading={loading} />

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div
          className="inline-flex w-full flex-wrap gap-1 rounded-lg border border-gray-200 bg-white p-1 sm:flex-nowrap"
          role="group"
          aria-label="Filter by status"
        >
          {statusFilterOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={
                statusFilter === value
                  ? 'rounded-lg bg-brand-muted px-3.5 py-1.5 text-xs font-semibold text-brand-foreground shadow-sm ring-1 ring-brand/25 transition-all duration-150 active:scale-[0.98] sm:px-4 sm:py-2 sm:text-sm'
                  : 'rounded-lg px-3.5 py-1.5 text-xs font-medium text-gray-600 transition-all duration-150 hover:bg-brand-muted/40 hover:text-gray-900 active:scale-[0.98] sm:px-4 sm:py-2 sm:text-sm'
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div
          className="space-y-5 rounded-xl bg-white p-5 shadow-sm"
          aria-busy="true"
          aria-live="polite"
          aria-label="Loading dashboard"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-[5.25rem] rounded-lg border border-gray-200 bg-gray-50 animate-pulse"
              />
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-4 shadow-sm">
            <span
              className="h-5 w-5 shrink-0 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-gray-900">Loading requests…</p>
          </div>
        </div>
      ) : (
        <>
          <section
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            aria-labelledby="follow-up-queue-heading"
          >
            <h2 id="follow-up-queue-heading" className={sectionHeadingClassName}>
              Follow-Up Queue ({followUpVisible.length})
            </h2>
            <p className="mb-3 max-w-2xl text-sm leading-relaxed text-gray-600">
              Open requests that need contact, scheduling, or checklist work.
            </p>
            {followUpVisible.length > 0 && (
              <>
                <div className="mb-4 flex flex-col gap-3 text-sm text-gray-900 sm:flex-row sm:flex-wrap sm:items-center">
                  <span className="font-medium shrink-0">
                    {selectedFollowUpIds.size} selected
                  </span>
                  <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                    <button
                      type="button"
                      disabled={followUpToolbarLocked}
                      onClick={selectAllFollowUpVisible}
                      className={`${secondaryButtonSm} w-full justify-center sm:w-auto`}
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      disabled={
                        followUpToolbarLocked || selectedFollowUpIds.size === 0
                      }
                      onClick={clearFollowUpSelection}
                      className={`${secondaryButtonSm} w-full justify-center sm:w-auto`}
                    >
                      Clear all
                    </button>
                    <button
                      type="button"
                      disabled={
                        followUpToolbarLocked || selectedFollowUpIds.size === 0
                      }
                      onClick={() => void batchDraftFollowUpEmails()}
                      className={`${primaryButtonSm} w-full justify-center sm:w-auto`}
                    >
                      {followUpBatchBusy === 'draft'
                        ? 'Generating drafts...'
                        : 'Generate drafts for selected'}
                    </button>
                    <button
                      type="button"
                      disabled={
                        followUpToolbarLocked || selectedFollowUpIds.size === 0
                      }
                      onClick={() => void batchMarkFollowUpAsContacted()}
                      className={`${secondaryButtonSm} w-full justify-center sm:w-auto`}
                    >
                      {followUpBatchBusy === 'mark'
                        ? 'Marking...'
                        : 'Mark selected as contacted'}
                    </button>
                  </div>
                </div>
                {followUpBatchMessage && (
                  <div className="mb-4">
                    <InlineFormMessage
                      message={followUpBatchMessage}
                      className="!mt-0"
                    />
                  </div>
                )}
              </>
            )}
            {followUpVisible.length === 0 ? (
              <div
                className="mx-auto max-w-2xl rounded-xl border border-dashed border-gray-300 bg-white px-5 py-10 text-center shadow-sm"
                role="status"
              >
                <p className="text-sm font-medium text-gray-900">
                  No requests in the Follow-Up Queue
                </p>
                <p className="mt-2 max-w-md mx-auto text-sm text-gray-600 leading-relaxed">
                  This queue lists open requests that still need contact, a confirmed schedule, or
                  checklist work, using the same search and status filter as your main list below.
                  Clear the search field or switch status if you expected someone here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {followUpVisible.map((request) => followUpQueueRow(request))}
              </div>
            )}
          </section>

          <section
            className="rounded-xl bg-white p-5 shadow-sm"
            aria-labelledby="dashboard-requests-heading"
          >
            <h2 id="dashboard-requests-heading" className={sectionHeadingClassName}>
              Requests ({visibleRequests.length})
            </h2>
            <p className="mb-3 max-w-2xl text-sm leading-relaxed text-gray-600">
              Search and review all submitted requests.
            </p>
            {visibleRequests.length === 0 ? (
              <div
                className="mx-auto max-w-2xl rounded-xl border border-dashed border-gray-300 bg-white px-5 py-10 text-center shadow-sm"
                role="status"
              >
                <p className="text-sm font-medium text-gray-900">
                  {requests.length === 0
                    ? 'No requests yet'
                    : 'No requests match your filters'}
                </p>
                <p className="mt-2 max-w-md mx-auto text-sm text-gray-600 leading-relaxed">
                  {requests.length === 0
                    ? 'When a family submits an intake form, the request will show up here so your team can review it and take the next step.'
                    : 'Try another status tab, clear the search field, or change the sort option to see more requests.'}
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch mb-4">
                  <input
                    className="w-full min-w-0 flex-1 rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
                    placeholder="Search parent, child, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  <select
                    className="w-full shrink-0 rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 shadow-sm sm:w-auto sm:min-w-[11rem] focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as
                          | 'created_desc'
                          | 'created_asc'
                          | 'confirmed_baptism_date'
                          | 'last_contacted'
                          | 'status'
                      )
                    }
                  >
                    <option value="created_desc">Newest created</option>
                    <option value="created_asc">Oldest created</option>
                    <option value="confirmed_baptism_date">Confirmed baptism date</option>
                    <option value="last_contacted">Last contacted</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {visibleRequests.map((request) => dashboardRequestLink(request))}
                </div>
              </>
            )}
          </section>
        </>
      )}

      <RequestLinksSection />
      </div>
    </main>
  )
}
