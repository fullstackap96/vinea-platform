'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Metrics from './Metrics'
import { RequestTypeBadge } from './requests/[id]/_components/RequestTypeBadge'
import {
  isMissingConfirmedSchedule,
  missingConfirmedScheduleCopy,
} from '@/lib/requestConfirmedSchedule'
import { primaryButtonMd, primaryButtonSm, secondaryButtonMd, secondaryButtonSm } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import { chipBase } from '@/lib/chipStyles'
import { assignmentDisplayLabel } from '@/lib/requestAssignment'
import {
  formatRequestStatus,
  requestStatusBadgeClasses,
  requestStatusRankForSort,
  REQUEST_STATUS_VALUES,
} from '@/lib/requestStatus'
import {
  formatNextFollowUpDateCompact,
  isNextFollowUpDueToday,
  isNextFollowUpOverdue,
  parseFollowUpCalendarDate,
} from '@/lib/nextFollowUpDate'

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

  function followUpContactDetailLine(request: any) {
    const last = toTime(request.last_contacted_at)
    if (last === null) return 'Never contacted'
    const days = wholeDaysSinceTimestamp(last)
    if (days <= 0) return 'Last contacted today'
    if (days === 1) return 'Last contacted 1 day ago'
    return `Last contacted ${days} days ago`
  }

  function followUpMissingDateDetailLine(request: any) {
    const created = toTime(request.created_at)
    if (created === null) return 'Request submitted — date unknown'
    const days = wholeDaysSinceTimestamp(created)
    if (days <= 0) return 'Request submitted today'
    if (days === 1) return 'Request submitted 1 day ago'
    return `Request submitted ${days} days ago`
  }

  function followUpChecklistDetailLine(request: any) {
    const n = Number(request.checklist_incomplete_count ?? 0)
    if (n === 1) return '1 item remaining'
    return `${n} items remaining`
  }

  function formatDateTime(value: any) {
    if (!value) return '—'
    const d = new Date(String(value))
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleString()
  }

  function normalize(value: any) {
    return String(value || '').toLowerCase().trim()
  }

  function sortWithNullsLast(list: any[]) {
    const copy = [...list]
    copy.sort((a, b) => {
      if (sortBy === 'created_desc' || sortBy === 'created_asc') {
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
    return (
      <div className="text-sm text-gray-900 space-y-1 leading-relaxed">
        <p>
          <strong>Contact:</strong> {request.parishioner?.full_name}
        </p>
        <p>
          <strong>Email:</strong> {request.parishioner?.email}
        </p>
        <p>
          <strong>Staff:</strong> {assignmentDisplayLabel(request.assigned_staff_name)}
        </p>
        <p>
          <strong>Priest:</strong> {assignmentDisplayLabel(request.assigned_priest_name)}
        </p>
        {isFuneral ? (
          <>
            <p>
              <strong>Deceased:</strong> {request.funeral_detail?.deceased_name || '—'}
            </p>
            <p>
              <strong>Confirmed service:</strong>{' '}
              {formatDateTime(request.funeral_detail?.confirmed_service_at)}
            </p>
          </>
        ) : isWedding ? (
          <>
            <p>
              <strong>Partners:</strong>{' '}
              {[request.wedding_detail?.partner_one_name, request.wedding_detail?.partner_two_name]
                .filter(Boolean)
                .join(' & ') || '—'}
            </p>
            <p>
              <strong>Confirmed ceremony:</strong>{' '}
              {formatDateTime(request.wedding_detail?.confirmed_ceremony_at)}
            </p>
            <p>
              <strong>Proposed date:</strong>{' '}
              {request.wedding_detail?.proposed_wedding_date
                ? String(request.wedding_detail.proposed_wedding_date)
                : '—'}
            </p>
          </>
        ) : (
          <>
            <p>
              <strong>Child:</strong> {request.child_name}
            </p>
            <p>
              <strong>Confirmed Date:</strong> {formatDateTime(request.confirmed_baptism_date)}
            </p>
            <p>
              <strong>Preferred Dates:</strong> {request.preferred_dates}
            </p>
          </>
        )}
        <p className="flex flex-wrap items-center gap-2">
          <strong>Status:</strong>{' '}
          <span className={requestStatusBadgeClasses(request.status)}>
            {formatRequestStatus(request.status)}
          </span>
        </p>
        {parseFollowUpCalendarDate(request.next_follow_up_date) ? (
          <p className="flex flex-wrap items-center gap-2">
            <strong>Next follow-up:</strong>
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
            <span className="text-gray-800">
              {formatNextFollowUpDateCompact(request.next_follow_up_date)}
            </span>
          </p>
        ) : null}
        <p>
          <strong>Last Contacted:</strong> {formatDateTime(request.last_contacted_at)}
        </p>
        <p>
          <strong>Request ID:</strong> {request.id}
        </p>
      </div>
    )
  }

  function renderRequestSummary(request: any) {
    const { needsConfirmed, needsContact, checklistIncomplete } = getAttentionState(request)
    const isNew = request.status === 'new'

    const badges: Array<{ key: string; label: string; className: string }> = []
    if (isNew)
      badges.push({
        key: 'new',
        label: 'New',
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

  /** Queue rows: reason chips + New badge only (no overlapping status badges). */
  function renderFollowUpQueueBody(request: any) {
    const { needsConfirmed, needsContact, checklistIncomplete } = getAttentionState(request)
    const isNew = request.status === 'new'
    const reasonChips: Array<{ key: string; label: string; className: string }> = []
    if (needsContact) {
      reasonChips.push({
        key: 'needs_contact',
        label: 'Needs Contact',
        className: 'bg-red-50 text-red-900 border border-red-200',
      })
    }
    if (needsConfirmed) {
      reasonChips.push({
        key: 'missing_confirmed',
        label: missingConfirmedScheduleCopy(request.request_type).chip,
        className: 'bg-orange-50 text-orange-900 border border-orange-200',
      })
    }
    if (checklistIncomplete) {
      reasonChips.push({
        key: 'checklist',
        label: 'Checklist Incomplete',
        className: 'bg-amber-50 text-amber-900 border border-amber-200',
      })
    }
    if (isNextFollowUpOverdue(request.next_follow_up_date, request.status)) {
      reasonChips.push({
        key: 'follow_up_overdue',
        label: 'Follow-up Overdue',
        className: 'bg-red-50 text-red-900 border border-red-200',
      })
    } else if (
      isNextFollowUpDueToday(request.next_follow_up_date, request.status)
    ) {
      reasonChips.push({
        key: 'follow_up_today',
        label: 'Follow-up Due Today',
        className: 'bg-amber-50 text-amber-900 border border-amber-200',
      })
    }

    const hasDraft = Boolean(String(request.reply_draft || '').trim())

    return (
      <>
        <div className="mb-2">
          <RequestTypeBadge requestType={request.request_type} />
        </div>
        <div className="flex gap-2 flex-wrap mb-2" aria-label="Follow-up reasons">
          {reasonChips.map((c) => (
            <span
              key={c.key}
              className={`${chipBase} ${c.className}`}
            >
              {c.label}
            </span>
          ))}
          {isNew && (
            <span
              className={`${chipBase} bg-blue-50 text-blue-900 border border-blue-200`}
            >
              New
            </span>
          )}
        </div>
        <ul className="text-sm text-gray-900 space-y-1 mb-2 list-disc list-inside">
          {needsContact && (
            <li>
              <span className="font-semibold text-gray-900">Needs contact</span>
              {' — '}
              {followUpContactDetailLine(request)}
            </li>
          )}
          {needsConfirmed && (
            <li>
              <span className="font-semibold text-gray-900">
                {missingConfirmedScheduleCopy(request.request_type).listHeading}
              </span>
              {' — '}
              {followUpMissingDateDetailLine(request)}
            </li>
          )}
          {checklistIncomplete && (
            <li>
              <span className="font-semibold text-gray-900">Checklist incomplete</span>
              {' — '}
              {followUpChecklistDetailLine(request)}
            </li>
          )}
        </ul>
        <p className="text-sm text-gray-900 mb-2">
          <strong>Follow-up draft:</strong>{' '}
          {hasDraft ? 'Ready to send.' : 'No draft saved yet.'}
        </p>
        {renderRequestDetailLines(request)}
      </>
    )
  }

  function dashboardRequestLink(request: any) {
    return (
      <Link
        key={request.id}
        href={`/dashboard/requests/${request.id}`}
        className="block border border-gray-200 rounded-lg p-4 sm:p-5 bg-white shadow-sm hover:border-gray-300 transition-colors"
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

    return (
      <div
        key={id}
        className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-white shadow-sm space-y-3"
      >
        <div className="flex gap-3 items-start">
          <label className="flex items-center gap-2 pt-0.5 shrink-0 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={selectedFollowUpIds.has(id)}
              disabled={selectionLocked}
              onChange={() => toggleFollowUpSelection(id)}
              className="rounded border-gray-400"
            />
            <span className="sr-only">Select for batch actions</span>
          </label>
          <div className="min-w-0 flex-1 space-y-3">
        <div className="min-w-0">
          <div className="text-base font-medium leading-snug text-gray-900 break-words">
            {String(request.parishioner?.full_name ?? '').trim() || '—'}
          </div>
          <Link
            href={`/dashboard/requests/${id}`}
            className="mt-1 inline-block text-sm font-medium text-blue-800 underline decoration-blue-800/80 underline-offset-2 hover:text-blue-950"
          >
            Open full request
          </Link>
        </div>
        {renderFollowUpQueueBody(request)}
        <p className="text-sm text-gray-900 break-words">
          <strong>Send subject:</strong> {followUpEmailSubject(request)}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            disabled={loading || followUpGlobalBusy}
            onClick={() => draftFollowUpEmail(request)}
            className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
          >
            {followUpDraftingId === id ? 'Drafting...' : 'Draft follow-up email'}
          </button>
          <button
            type="button"
            disabled={sendDisabled}
            onClick={() => sendFollowUpEmail(request)}
            className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
          >
            {followUpSendingId === id ? 'Sending...' : 'Send follow-up email'}
          </button>
          <button
            type="button"
            disabled={loading || followUpGlobalBusy}
            onClick={() => markFollowUpAsContacted(request)}
            className={`${secondaryButtonMd} w-full justify-center sm:w-auto`}
          >
            {followUpMarkingId === id ? 'Saving...' : 'Mark as Contacted'}
          </button>
        </div>
        {followUpRowMessages[id] && (
          <InlineFormMessage
            message={followUpRowMessages[id]}
            className="!mt-2"
          />
        )}
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

    const withDetails = withFuneral.map((r) => ({
      ...r,
      wedding_detail:
        r.request_type === 'wedding'
          ? weddingById.get(String(r.id)) ?? null
          : null,
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
      const staffAssignee = normalize(request.assigned_staff_name)
      const priestAssignee = normalize(request.assigned_priest_name)
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
        staffAssignee.includes(q) ||
        priestAssignee.includes(q) ||
        followUpYmd.includes(q) ||
        followUpCompact.includes(q)
      )
    })
  })()

  const visibleRequests = sortWithNullsLast(searchedRequests)
  const followUpVisible = sortWithNullsLast(searchedRequests.filter(inFollowUpQueue))

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
      label: formatRequestStatus(value),
    })),
  ]

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
        Dashboard
      </h1>
      {/* Metrics summary (global counts from the full loaded requests array) */}
      <Metrics requests={requests} loading={loading} />

      <div
        className="inline-flex rounded-lg border border-gray-200 bg-gray-100/90 p-1 gap-1 mb-6 flex-wrap sm:flex-nowrap"
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
                ? 'rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-gray-200/90'
                : 'rounded-md px-4 py-2 text-sm font-medium text-gray-800 hover:text-gray-950 hover:bg-white/80'
            }
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div
          className="space-y-6"
          aria-busy="true"
          aria-live="polite"
          aria-label="Loading dashboard"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-[4.5rem] rounded-lg border border-gray-200 bg-white shadow-sm animate-pulse"
              />
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-4 shadow-sm">
            <span
              className="h-5 w-5 shrink-0 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin"
              aria-hidden
            />
            <p className="text-sm font-medium text-gray-900">Loading requests…</p>
          </div>
        </div>
      ) : (
        <>
          <section className="mb-10" aria-labelledby="follow-up-queue-heading">
            <h2
              id="follow-up-queue-heading"
              className="text-xl font-semibold text-gray-900 mb-2"
            >
              Follow-Up Queue
            </h2>
            <p className="text-sm text-gray-900 mb-3 leading-relaxed">
              Open requests (not complete) that need contact, a confirmed date, or checklist work.
              Showing {followUpVisible.length} for the current status filter and search.
            </p>
            {followUpVisible.length > 0 && (
              <>
                <div className="mb-3 flex flex-col gap-3 text-sm text-gray-900 sm:flex-row sm:flex-wrap sm:items-center">
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
                  <div className="mb-3">
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
                className="rounded-lg border border-dashed border-gray-300 bg-white px-5 py-10 text-center shadow-sm"
                role="status"
              >
                <p className="text-sm font-medium text-gray-900">
                  Nothing in the follow-up queue for this filter and search.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {followUpVisible.map((request) => followUpQueueRow(request))}
              </div>
            )}
          </section>

          {visibleRequests.length === 0 ? (
            <div
              className="rounded-lg border border-dashed border-gray-300 bg-white px-5 py-10 text-center shadow-sm"
              role="status"
            >
              <p className="text-sm font-medium text-gray-900">
                No requests found for this filter.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch mb-6">
                <input
                  className="border border-gray-300 rounded-lg p-3 w-full min-w-0 flex-1 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
                  placeholder="Search parent, child, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <select
                  className="border border-gray-300 rounded-lg p-3 w-full sm:w-auto sm:min-w-[11rem] shrink-0 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
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
        </>
      )}
    </main>
  )
}
