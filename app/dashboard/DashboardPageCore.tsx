'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Activity, Calendar, Mail, Phone, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { DashboardCommandSummary } from './DashboardCommandSummary'
import { DashboardTodayView } from './DashboardTodayView'
import { DashboardSuggestedActions } from './DashboardSuggestedActions'
import { DashboardStaffWorkload } from './DashboardStaffWorkload'
import { DashboardOwnershipHealth } from './DashboardOwnershipHealth'
import {
  DashboardFamilyCarePlans,
  type CompleteCarePlanTouchpointInput,
} from './DashboardFamilyCarePlans'
import { DashboardRequestNameLink } from './_components/DashboardRequestNameLink'
import { DashboardRequestRowBadges } from './DashboardRequestRowBadges'
import { DashboardRequestFilters } from './DashboardRequestFilters'
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
import { getStatusLabel, requestStatusRankForSort } from '@/lib/requestStatus'
import { requestWaitingOnLabel } from '@/lib/requestWaitingOn'
import { loadDashboardSuggestedActions } from '@/lib/relationshipIntelligence/loadDashboardIntelligence'
import type { DashboardSuggestedAction } from '@/lib/relationshipIntelligence/types'
import { getDashboardCommandSummaryCounts } from '@/lib/dashboardSummaryCounts'
import {
  defaultDashboardRowFilters,
  requestMatchesDashboardRowFilters,
  type DashboardRowFilters,
} from '@/lib/dashboardRequestFilter'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import { fetchDashboardRequestParishionerScope } from '@/lib/dashboardParishRequestScope'
import {
  formatDashboardTechnicalError,
  logDashboardQueryError,
  userMessageForDashboardQueryError,
} from '@/lib/dashboardSupabaseError'
import { evaluateAtRiskRequest } from '@/lib/atRiskRequest'
import { evaluateSmartFollowUp } from '@/lib/smartFollowUpEngine'
import { ParishRequestStatusBadgeWithTooltip } from '@/lib/ParishRequestStatusBadge'
import {
  followUpSortPriority,
  formatNextFollowUpDateCompact,
  formatNextFollowUpDateDisplay,
  isNextFollowUpDueToday,
  isNextFollowUpOverdue,
  parseFollowUpCalendarDate,
} from '@/lib/nextFollowUpDate'
import {
  needsAttentionEligible,
  needsAttentionPriorityRank,
  sortNeedsAttentionRequests,
} from '@/lib/needsAttention'
import { dashboardOverdueFollowUpCardClasses } from '@/lib/dashboardOverdueCardStyle'
import { dashboardRequestOpenLabel } from '@/lib/dashboardRequestNavigation'
import {
  dashboardRequestContentLink,
  dashboardRequestLinkCardP4,
  dashboardRequestLinkCardP5,
} from '@/lib/cardStyles'
import {
  labelSacramentalBackground,
  labelSeeking,
} from '@/lib/ociaIntakeOptions'
import {
  dashboardRequestScheduleRow,
  requestWorkflowDetailHref,
  resolveRequestWorkflowV2,
  workflowUrgencyChipClassName,
  workflowUrgencyLabel,
} from '@/lib/requestWorkflowV2'
import {
  buildStaffCommandCenterRows,
  type StaffCommandCenterRow,
} from '@/lib/staffCommandCenter'
import { buildStaffWorkloadRows } from '@/lib/dashboardStaffWorkload'
import { buildCareCadenceQueue } from '@/lib/careCadence'
import { buildCommunicationCommitmentQueue } from '@/lib/communicationCommitments'
import { buildCarePlans } from '@/lib/carePlans'
import { evaluateIntakeTriage } from '@/lib/intakeTriage'
import { buildOwnershipHealth } from '@/lib/ownershipHealth'
import { getRequestDetailPrimaryHeading } from '@/lib/requestDetailIdentity'
import {
  vineaEmptyStateClassName,
  vineaSectionShellClassName,
  vineaSpinnerClassName,
} from '@/lib/vineaUi'

const FOLLOWUP_STALE_MS = 7 * 24 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

const FOLLOWUP_QUEUE_CONTACT_NOTES = 'Marked as contacted from Follow-Up Queue'

function commandCenterBucketTone(bucket: StaffCommandCenterRow['bucket']): string {
  switch (bucket) {
    case 'act_now':
      return 'border-rose-200 bg-rose-50 text-rose-950'
    case 'blocked':
      return 'border-violet-200 bg-violet-50 text-violet-950'
    case 'aging':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    case 'upcoming':
    default:
      return 'border-slate-200 bg-slate-50 text-slate-900'
  }
}

function commandCenterFollowUpTone(urgency: StaffCommandCenterRow['smartFollowUp']['urgency']): string {
  switch (urgency) {
    case 'critical':
      return 'border-red-300 bg-red-50 text-red-950'
    case 'high':
      return 'border-orange-300 bg-orange-50 text-orange-950'
    case 'medium':
      return 'border-sky-200 bg-sky-50 text-sky-950'
    case 'low':
    default:
      return 'border-slate-200 bg-slate-50 text-slate-900'
  }
}

function requestListDisplayName(request: {
  request_type?: unknown
  child_name?: unknown
  parishioner?: { full_name?: unknown } | null
  funeral_detail?: { deceased_name?: unknown } | null
  wedding_detail?: { partner_one_name?: unknown; partner_two_name?: unknown } | null
}): string {
  return getRequestDetailPrimaryHeading({
    request_type: request.request_type,
    child_name: request.child_name,
    parishioner: request.parishioner,
    funeralDetail: request.funeral_detail,
    weddingDetail: request.wedding_detail,
  })
}

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

export function DashboardPageCore({ view }: { view: 'home' | 'requests' }) {
  const isHome = view === 'home'
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [rowFilters, setRowFilters] = useState<DashboardRowFilters>(() =>
    defaultDashboardRowFilters()
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<
    | 'urgency'
    | 'created_desc'
    | 'created_asc'
    | 'confirmed_baptism_date'
    | 'last_contacted'
    | 'status'
  >('urgency')

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
  const [carePlanCompletingId, setCarePlanCompletingId] = useState<string | null>(null)
  const [carePlanMessages, setCarePlanMessages] = useState<Record<string, string>>({})
  const [requestsLoadError, setRequestsLoadError] = useState<string | null>(null)
  const [requestsFetchFailed, setRequestsFetchFailed] = useState(false)
  const [requestsLoadTechnicalDetail, setRequestsLoadTechnicalDetail] = useState<
    string | null
  >(null)
  const [suggestedActions, setSuggestedActions] = useState<DashboardSuggestedAction[]>(
    []
  )
  const [suggestedActionsLoading, setSuggestedActionsLoading] = useState(true)

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

  function setCarePlanMessage(requestId: string, message: string) {
    setCarePlanMessages((current) => ({ ...current, [requestId]: message }))
  }

  function sortWithNullsLast(list: any[]) {
    const copy = [...list]
    copy.sort((a, b) => {
      if (sortBy === 'urgency') {
        const aComplete = String(a.status ?? '').trim() === 'complete'
        const bComplete = String(b.status ?? '').trim() === 'complete'
        if (aComplete && bComplete) {
          const at = toTime(a.created_at) ?? 0
          const bt = toTime(b.created_at) ?? 0
          return bt - at
        }
        if (aComplete !== bComplete) {
          return aComplete ? 1 : -1
        }
        const ra = needsAttentionPriorityRank(a)
        const rb = needsAttentionPriorityRank(b)
        if (ra !== rb) return ra - rb
        const qa = inFollowUpQueue(a) ? 0 : 1
        const qb = inFollowUpQueue(b) ? 0 : 1
        if (qa !== qb) return qa - qb
        const fa = followUpSortPriority(a.next_follow_up_date, a.status)
        const fb = followUpSortPriority(b.next_follow_up_date, b.status)
        if (fa !== fb) return fa - fb
        const at = toTime(a.created_at) ?? 0
        const bt = toTime(b.created_at) ?? 0
        return bt - at
      }

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

  function renderRequestDetailLines(
    request: any,
    opts?: { streamlinedTiles?: boolean }
  ) {
    const streamlined = opts?.streamlinedTiles ?? false
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
        {!streamlined ? (
          <>
            <LabelValueRow
              label="Staff"
              value={maybeMissingValue(assignmentDisplayLabel(request.assigned_staff_name))}
            />
            <LabelValueRow
              label="Priest"
              value={maybeMissingValue(assignmentDisplayLabel(request.assigned_priest_name))}
            />
          </>
        ) : null}
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
              <ParishRequestStatusBadgeWithTooltip
                request={{
                  status: request.status,
                  next_follow_up_date: request.next_follow_up_date,
                  assigned_staff_name: request.assigned_staff_name,
                  assigned_priest_name: request.assigned_priest_name,
                  assigned_deacon_name: request.assigned_deacon_name,
                  request_type: request.request_type,
                  waiting_on: request.waiting_on,
                  scheduleRow: dashboardRequestScheduleRow(request),
                }}
              />
            </span>
          }
        />
        {!streamlined ? (
          <LabelValueRow
            label="Waiting for"
            value={maybeMissingValue(requestWaitingOnLabel(request.waiting_on) || '—')}
          />
        ) : null}
        {parseFollowUpCalendarDate(request.next_follow_up_date) ? (
          <LabelValueRow
            label={<FieldLabel icon={Calendar}>Follow-up</FieldLabel>}
            value={
              <span className="flex flex-wrap items-center gap-2">
                {isNextFollowUpOverdue(request.next_follow_up_date, request.status) && (
                  <span
                    className={`${chipBase} bg-red-50 text-red-900 border border-red-200`}
                  >
                    Past due
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

  function renderRequestSummary(
    request: any,
    opts?: { showAttentionChips?: boolean }
  ) {
    const showAttentionChips = opts?.showAttentionChips ?? true
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
        label: 'Past due',
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
    const waitingLabel = requestWaitingOnLabel(request.waiting_on)
    if (waitingLabel) {
      badges.push({
        key: 'waiting_on',
        label: `Waiting: ${waitingLabel}`,
        className: 'bg-indigo-50 text-indigo-950 border border-indigo-200',
      })
    }

    return (
      <>
        <div className="mb-2">
          <RequestTypeBadge requestType={request.request_type} />
        </div>
        {showAttentionChips && badges.length > 0 && (
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
        {renderRequestDetailLines(request, {
          streamlinedTiles: !showAttentionChips,
        })}
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
      lines.push('Past due')
    } else if (
      isNextFollowUpDueToday(request.next_follow_up_date, request.status)
    ) {
      lines.push('Follow-up due today')
    }
    const wl = requestWaitingOnLabel(request.waiting_on)
    if (wl) {
      lines.push(`Waiting for: ${wl}`)
    }
    return lines
  }

  function renderNeedsAttentionCard(request: any) {
    const id = String(request.id)
    const workflow = resolveRequestWorkflowV2({
      request,
      scheduleRow: dashboardRequestScheduleRow(request),
      checklistIncomplete: Boolean(request.checklist_incomplete),
    })
    const name = requestListDisplayName(request)
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
        href={requestWorkflowDetailHref(id, workflow.sectionAnchor)}
        aria-label={dashboardRequestOpenLabel(name)}
        className={`${dashboardRequestLinkCardP5} ${
          overdue ? dashboardOverdueFollowUpCardClasses : ''
        }`.trim()}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Next step
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${workflowUrgencyChipClassName(workflow.urgency)}`}
                >
                  {workflowUrgencyLabel[workflow.urgency]}
                </span>
              </div>
              <p className="mt-2 text-xl font-bold leading-snug text-gray-900 sm:text-2xl text-balance">
                {workflow.nextStepTitle}
              </p>
              <p className="mt-2 text-base font-semibold leading-snug text-gray-800 sm:text-lg text-pretty">
                {workflow.nextStepDescription}
              </p>
              <p className="mt-1.5 text-xs leading-snug text-gray-500 text-pretty">
                {workflow.reason}
              </p>
            </div>
            <span
              className={`${primaryButtonMd} w-full shrink-0 justify-center self-stretch shadow-sm sm:w-auto sm:self-start sm:min-w-[11.5rem]`}
            >
              {workflow.recommendedActionLabel}
            </span>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <RequestTypeBadge requestType={request.request_type} />
              <span className="text-sm font-medium text-gray-400" aria-hidden>
                ·
              </span>
              <DashboardRequestNameLink name={name} embedded />
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-xs font-medium text-gray-500">Status</span>
              <span className="inline-flex scale-[0.97] origin-left">
                <ParishRequestStatusBadgeWithTooltip
                  request={{
                    status: request.status,
                    next_follow_up_date: request.next_follow_up_date,
                    assigned_staff_name: request.assigned_staff_name,
                    assigned_priest_name: request.assigned_priest_name,
                    assigned_deacon_name: request.assigned_deacon_name,
                    request_type: request.request_type,
                    waiting_on: request.waiting_on,
                    scheduleRow: dashboardRequestScheduleRow(request),
                  }}
                />
              </span>
            </p>
            {requestWaitingOnLabel(request.waiting_on) ? (
              <p className="mt-1.5 text-xs text-gray-600">
                <span className="text-gray-500">Waiting for</span>{' '}
                <span className="font-medium text-indigo-900/90">
                  {requestWaitingOnLabel(request.waiting_on)}
                </span>
              </p>
            ) : null}
            <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs leading-relaxed text-gray-600">
              <span>
                <span className="text-gray-500">Staff</span>{' '}
                <span className="text-gray-700">
                  {maybeMissingValue(assignmentDisplayLabel(request.assigned_staff_name))}
                </span>
              </span>
              <span>
                <span className="text-gray-500">Priest</span>{' '}
                <span className="text-gray-700">{maybeMissingValue(priestLabel)}</span>
              </span>
              <span>
                <span className="text-gray-500">Deacon</span>{' '}
                <span className="text-gray-700">{maybeMissingValue(deaconLabel)}</span>
              </span>
            </p>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600">
              <span className="shrink-0 text-gray-500">Follow-up</span>
              <span className="inline-flex flex-wrap items-center gap-1.5">
                {overdue ? (
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-none bg-red-50 text-red-900 border-red-200`}
                  >
                    Past due
                  </span>
                ) : null}
                {dueToday && !overdue ? (
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-none bg-amber-50 text-amber-900 border-amber-200`}
                  >
                    Due today
                  </span>
                ) : null}
                <span className="font-medium text-gray-700">{maybeMissingValue(dateLabel)}</span>
              </span>
            </p>
          </div>
        </div>
      </Link>
    )
  }

  function renderCommandCenterRow(row: StaffCommandCenterRow) {
    const request = row.request
    const name = requestListDisplayName(request)
    const contact = String(request.parishioner?.full_name ?? '').trim()
    const followUpLabel = formatNextFollowUpDateCompact(request.next_follow_up_date) || 'Not set'
    const ageLabel = row.ageDays === null ? 'Age unknown' : `${row.ageDays}d open`
    const contactAgeLabel =
      row.daysSinceContact === null
        ? 'Never contacted'
        : row.daysSinceContact <= 0
          ? 'Contacted today'
          : `${row.daysSinceContact}d since contact`
    const checklistLabel =
      row.openChecklistCount > 0
        ? row.openChecklistCount === 1
          ? '1 checklist item open'
          : `${row.openChecklistCount} checklist items open`
        : 'Checklist OK'
    const blockerDisplay =
      row.blockerAgeDays !== null
        ? `${row.blockerLabel} · ${row.blockerAgeDays}d`
        : row.blockerLabel

    return (
      <Link
        key={row.requestId}
        href={row.detailHref}
        aria-label={dashboardRequestOpenLabel(name)}
        className={`${dashboardRequestLinkCardP4} block`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <RequestTypeBadge requestType={row.requestType} />
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${commandCenterBucketTone(row.bucket)}`}
              >
                {row.bucketLabel}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${workflowUrgencyChipClassName(row.workflow.urgency)}`}
              >
                {workflowUrgencyLabel[row.workflow.urgency]}
              </span>
            </div>
            <p className="mt-2 text-lg font-bold leading-snug text-gray-900 text-balance">
              {row.workflow.nextStepTitle}
            </p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-gray-700 text-pretty">
              {row.workflow.nextStepDescription}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              <span className="font-semibold text-gray-900">{name}</span>
              {contact && contact !== name ? <> · {contact}</> : null}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-gray-800">
                Owner: {row.ownerLabel}
              </span>
              <span className="rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-violet-950">
                Blocker: {blockerDisplay}
              </span>
              <span className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-gray-800">
                {ageLabel}
              </span>
              <span className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-gray-800">
                {contactAgeLabel}
              </span>
              <span
                className={`rounded-lg border px-2.5 py-1 ${commandCenterFollowUpTone(row.smartFollowUp.urgency)}`}
              >
                Follow-up: {followUpLabel}
              </span>
              <span className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-gray-800">
                {checklistLabel}
              </span>
              {row.missingConfirmedSchedule ? (
                <span className="rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-orange-950">
                  Schedule missing
                </span>
              ) : null}
            </div>
          </div>
          <span className={`${primaryButtonSm} w-full justify-center sm:w-auto`}>
            {row.workflow.recommendedActionLabel}
          </span>
        </div>
      </Link>
    )
  }

  function dashboardRequestLink(request: any) {
    const followUpOverdue = isNextFollowUpOverdue(
      request.next_follow_up_date,
      request.status
    )
    const workflow = resolveRequestWorkflowV2({
      request,
      scheduleRow: dashboardRequestScheduleRow(request),
      checklistIncomplete: Boolean(request.checklist_incomplete),
    })
    const smartFollowUp = evaluateSmartFollowUp(request)
    const atRisk = evaluateAtRiskRequest(request)
    const intakeTriage = evaluateIntakeTriage(request)
    const waitingOnDisplay =
      requestWaitingOnLabel(request.waiting_on)?.trim() || 'Nothing recorded'
    const displayName = requestListDisplayName(request)

    return (
      <Link
        key={request.id}
        href={requestWorkflowDetailHref(String(request.id), workflow.sectionAnchor)}
        aria-label={dashboardRequestOpenLabel(displayName)}
        className={`${dashboardRequestLinkCardP4} ${
          followUpOverdue ? dashboardOverdueFollowUpCardClasses : ''
        }`.trim()}
      >
        <div className="mb-3">
          <DashboardRequestNameLink name={displayName} embedded size="lg" />
        </div>
        {renderRequestSummary(request, { showAttentionChips: false })}
        <DashboardRequestRowBadges
          workflow={workflow}
          smartFollowUp={smartFollowUp}
          atRisk={atRisk}
          intakeTriage={intakeTriage}
          waitingOnDisplay={waitingOnDisplay}
          staffDisplay={assignmentDisplayLabel(request.assigned_staff_name)}
          priestDisplay={assignmentDisplayLabel(request.assigned_priest_name)}
        />
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
        payload.familyRelationship = fd?.family_relationship ?? ''
        payload.dateOfDeath = fd?.date_of_death ?? ''
        payload.funeralHome = fd?.funeral_home_or_location ?? ''
        payload.funeralDirectorContact = fd?.funeral_director_contact ?? ''
        payload.serviceLocation = fd?.service_location ?? ''
        payload.visitationDetails = fd?.visitation_details ?? ''
        payload.cemeteryOrCommittal = fd?.cemetery_or_committal ?? ''
        payload.readingsMusicNotes = fd?.readings_music_notes ?? ''
        payload.obituaryProgramNotes = fd?.obituary_program_notes ?? ''
        payload.postFuneralFollowUpDate = fd?.post_funeral_follow_up_date ?? ''
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

  async function completeCarePlanTouchpoint({
    plan,
    method,
    notes,
    nextFollowUpDate,
    careCycleComplete,
  }: CompleteCarePlanTouchpointInput): Promise<
    { ok: true } | { ok: false; error: string }
  > {
    const id = String(plan.requestId)
    const normalizedMethod = String(method || 'phone').trim()
    const trimmedNotes = String(notes || '').trim()

    if (!careCycleComplete && !parseFollowUpCalendarDate(nextFollowUpDate)) {
      const error = 'Choose the next follow-up date before saving.'
      setCarePlanMessage(id, error)
      return { ok: false, error }
    }

    setCarePlanCompletingId(id)
    setCarePlanMessage(id, '')

    try {
      const contactedAtIso = new Date().toISOString()
      const nextFollowUpDisplay = careCycleComplete
        ? 'Care cycle complete'
        : `Next follow-up: ${formatNextFollowUpDateDisplay(nextFollowUpDate)}`
      const communicationNotes = [
        `Care plan touchpoint: ${plan.familyLabel}`,
        trimmedNotes || plan.nextTouchpoint,
        nextFollowUpDisplay,
      ].join('\n')

      const insertRes = await supabase.from('request_communications').insert({
        request_id: id,
        contacted_at: contactedAtIso,
        method: normalizedMethod,
        notes: communicationNotes,
      })

      if (insertRes.error) {
        setCarePlanMessage(id, `Could not log care touchpoint: ${insertRes.error.message}`)
        return { ok: false, error: insertRes.error.message }
      }

      if (plan.planType === 'funeral_bereavement') {
        const funeralUpdate = await supabase
          .from('funeral_request_details')
          .update({
            post_funeral_follow_up_date: careCycleComplete ? null : nextFollowUpDate,
          })
          .eq('request_id', id)

        if (funeralUpdate.error) {
          const error = `Logged touchpoint, but failed updating funeral care date: ${funeralUpdate.error.message}`
          setCarePlanMessage(id, error)
          await loadRequests(true)
          return { ok: false, error }
        }
      }

      const updatePayload: Record<string, unknown> = {
        last_contacted_at: contactedAtIso,
        last_contact_method: normalizedMethod,
        communication_notes: communicationNotes,
        next_follow_up_date: careCycleComplete ? null : nextFollowUpDate,
      }
      if (careCycleComplete) {
        updatePayload.status = 'complete'
      }

      const updateRes = await supabase
        .from('requests')
        .update(updatePayload)
        .eq('id', id)

      if (updateRes.error) {
        const error = `Logged touchpoint, but failed updating request: ${updateRes.error.message}`
        setCarePlanMessage(id, error)
        await loadRequests(true)
        return { ok: false, error }
      }

      setCarePlanMessage(
        id,
        careCycleComplete
          ? 'Care touchpoint saved and care cycle completed.'
          : 'Care touchpoint saved and next follow-up scheduled.'
      )
      await loadRequests(true)
      return { ok: true }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? `Error: ${error.message}` : 'Error: Unknown error'
      setCarePlanMessage(id, message)
      return { ok: false, error: message }
    } finally {
      setCarePlanCompletingId(null)
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

    const displayName = requestListDisplayName(request)
    const email = String(request.parishioner?.email ?? '').trim()
    const phone = String(request.parishioner?.phone ?? '').trim()
    const staff = assignmentDisplayLabel(request.assigned_staff_name)
    const priest = assignmentDisplayLabel(request.assigned_priest_name)
    const deacon = assignmentDisplayLabel(request.assigned_deacon_name)
    const highlightLines = followUpQueueHighlightLines(request)
    const emailSubject = followUpEmailSubject(request)
    const workflow = resolveRequestWorkflowV2({
      request,
      scheduleRow: dashboardRequestScheduleRow(request),
      checklistIncomplete: Boolean(request.checklist_incomplete),
    })

    const requestDetailHref = `/dashboard/requests/${encodeURIComponent(id)}`

    return (
      <div
        key={id}
        className={`rounded-xl border border-gray-200 p-3 shadow-sm ${
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
                <Link
                  href={requestDetailHref}
                  aria-label={dashboardRequestOpenLabel(displayName)}
                  className={dashboardRequestContentLink}
                >
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <DashboardRequestNameLink name={displayName} embedded />
                      <div className="flex flex-wrap items-center gap-2">
                        <RequestTypeBadge requestType={request.request_type} />
                        <ParishRequestStatusBadgeWithTooltip
                          request={{
                            status: request.status,
                            next_follow_up_date: request.next_follow_up_date,
                            assigned_staff_name: request.assigned_staff_name,
                            assigned_priest_name: request.assigned_priest_name,
                            assigned_deacon_name: request.assigned_deacon_name,
                            request_type: request.request_type,
                            waiting_on: request.waiting_on,
                            scheduleRow: dashboardRequestScheduleRow(request),
                          }}
                        />
                      </div>
                    </div>
                    {requestWaitingOnLabel(request.waiting_on) ? (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-gray-500">Waiting for </span>
                        <span className="font-semibold text-indigo-950">
                          {requestWaitingOnLabel(request.waiting_on)}
                        </span>
                      </p>
                    ) : null}

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
                  </div>
                </Link>

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
                    href={requestWorkflowDetailHref(id, workflow.sectionAnchor)}
                    className="group inline-block text-xs font-medium text-blue-800 hover:text-blue-950"
                  >
                    <span className="underline decoration-blue-800/80 underline-offset-2 group-hover:decoration-blue-950">
                      {workflow.recommendedActionLabel}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-normal leading-snug text-gray-600">
                      {workflow.nextStepTitle} · {workflowUrgencyLabel[workflow.urgency]}
                    </span>
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
    setRequestsLoadError(null)
    setRequestsFetchFailed(false)
    setRequestsLoadTechnicalDetail(null)
    const softWarnings: string[] = []

    try {
    const parishScope = await fetchDashboardRequestParishionerScope(supabase)
    if (!parishScope.ok) {
      if (parishScope.technicalDetail) {
        logDashboardQueryError(
          'dashboard request parish scope',
          new Error(parishScope.technicalDetail)
        )
        setRequestsLoadTechnicalDetail(parishScope.technicalDetail)
      }
      setRequests([])
      setSuggestedActions([])
      setRequestsLoadError(parishScope.userMessage)
      return
    }

    const parishionerIdsForParish = parishScope.parishionerIds

    let requestsQuery = supabase
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
        person_id,
        confirmed_baptism_date,
        last_contacted_at,
        assigned_staff_name,
        assigned_priest_name,
        assigned_deacon_name,
        next_follow_up_date,
        waiting_on
      `)
      .order('created_at', { ascending: false })

    requestsQuery = requestsQuery.in('parishioner_id', parishionerIdsForParish)

    const { data: requestsData, error: requestsError } = await requestsQuery

    if (requestsError) {
      logDashboardQueryError('requests (dashboard list)', requestsError)
      setRequestsFetchFailed(true)
      setRequestsLoadTechnicalDetail(formatDashboardTechnicalError(requestsError))
      setRequests([])
      setSuggestedActions([])
      return
    }

    if (!requestsData) {
      const synthetic = new Error('Supabase returned no data and no error')
      logDashboardQueryError('requests (dashboard list)', synthetic)
      setRequestsFetchFailed(true)
      setRequestsLoadTechnicalDetail(formatDashboardTechnicalError(synthetic))
      setRequests([])
      setSuggestedActions([])
      return
    }

    const requestRows = (requestsData || []).map((r) => ({
      ...r,
      request_type: requestTypeFromRow(r as { request_type?: unknown }),
    }))

    const parishionerIds = requestRows
      .map((request) => request.parishioner_id)
      .filter(Boolean)

    let parishionersData:
      | { id: string; full_name: string | null; email: string | null; phone: string | null; parish_id: string | null }[]
      | null
    let parishionersError: { message: string } | null

    if (parishionerIds.length > 0) {
      const pRes = await supabase
        .from('parishioners')
        .select('id, full_name, email, phone, parish_id')
        .in('id', parishionerIds)
      parishionersData = pRes.data as typeof parishionersData
      parishionersError = pRes.error
    } else {
      parishionersData = []
      parishionersError = null
    }

    if (parishionersError) {
      logDashboardQueryError('parishioners (for dashboard merge)', parishionersError)
      setRequestsFetchFailed(true)
      setRequestsLoadTechnicalDetail(formatDashboardTechnicalError(parishionersError))
      setRequests([])
      setSuggestedActions([])
      return
    }

    const requestIds = requestRows.map((r) => r.id).filter(Boolean)
    let checklistIncompleteCountByRequestId = new Map<string, number>()
    if (requestIds.length > 0) {
      const { data: checklistData, error: checklistError } = await supabase
        .from('checklist_items')
        .select('request_id, is_complete')
        .in('request_id', requestIds)

      if (checklistError) {
        logDashboardQueryError('checklist_items (for dashboard)', checklistError)
        softWarnings.push(
          userMessageForDashboardQueryError('checklist summary', checklistError)
        )
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

    const funeralById = new Map<string, Record<string, unknown>>()
    if (funeralIds.length > 0) {
      const { data: funeralRows, error: funeralErr } = await supabase
        .from('funeral_request_details')
        .select('*')
        .in('request_id', funeralIds)

      if (funeralErr) {
        logDashboardQueryError('funeral_request_details (for dashboard)', funeralErr)
        softWarnings.push(
          userMessageForDashboardQueryError('funeral request details', funeralErr)
        )
      }
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

    const weddingById = new Map<string, Record<string, unknown>>()
    if (weddingIds.length > 0) {
      const { data: weddingRows, error: weddingErr } = await supabase
        .from('wedding_request_details')
        .select('*')
        .in('request_id', weddingIds)

      if (weddingErr) {
        logDashboardQueryError('wedding_request_details (for dashboard)', weddingErr)
        softWarnings.push(
          userMessageForDashboardQueryError('wedding request details', weddingErr)
        )
      }
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

    const ociaById = new Map<string, Record<string, unknown>>()
    if (ociaIds.length > 0) {
      const { data: ociaRows, error: ociaErr } = await supabase
        .from('ocia_request_details')
        .select('*')
        .in('request_id', ociaIds)

      if (ociaErr) {
        logDashboardQueryError('ocia_request_details (for dashboard)', ociaErr)
        softWarnings.push(
          userMessageForDashboardQueryError('OCIA request details', ociaErr)
        )
      }
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
    setRequestsFetchFailed(false)
    setRequestsLoadTechnicalDetail(null)
    setRequestsLoadError(softWarnings.length > 0 ? softWarnings.join(' • ') : null)

    setSuggestedActionsLoading(true)
    try {
      const actions = await loadDashboardSuggestedActions(supabase, withDetails)
      setSuggestedActions(actions)
    } catch (suggestionsErr) {
      logDashboardQueryError('dashboard suggested actions', suggestionsErr)
      setSuggestedActions([])
    } finally {
      setSuggestedActionsLoading(false)
    }
    } catch (unexpected) {
      logDashboardQueryError('dashboard load (unexpected)', unexpected)
      setRequestsFetchFailed(true)
      setRequestsLoadTechnicalDetail(formatDashboardTechnicalError(unexpected))
      setRequests([])
      setSuggestedActions([])
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests(false)
  }, [])

  const rowFiltersKey = JSON.stringify(rowFilters)

  useEffect(() => {
    setSelectedFollowUpIds(new Set())
    setFollowUpBatchMessage('')
  }, [rowFiltersKey, searchQuery])

  const { staffAssigneeOptions, priestAssigneeOptions } = useMemo(() => {
    const staff = new Set<string>()
    const priest = new Set<string>()
    for (const r of requests) {
      const s = String(r.assigned_staff_name ?? '').trim()
      const p = String(r.assigned_priest_name ?? '').trim()
      if (s) staff.add(s)
      if (p) priest.add(p)
    }
    return {
      staffAssigneeOptions: [...staff].sort((a, b) => a.localeCompare(b)),
      priestAssigneeOptions: [...priest].sort((a, b) => a.localeCompare(b)),
    }
  }, [requests])

  const rowFiltered = useMemo(
    () =>
      requests.filter((request) =>
        requestMatchesDashboardRowFilters(request as Record<string, unknown>, rowFilters)
      ),
    [requests, rowFilters]
  )

  const searchedRequests = useMemo(() => {
    const q = normalize(searchQuery)
    if (!q) return rowFiltered

    return rowFiltered.filter((request) => {
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
      const waitingOnQ = normalize(requestWaitingOnLabel(request.waiting_on) || '')
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
        followUpCompact.includes(q) ||
        waitingOnQ.includes(q)
      )
    })
  }, [rowFiltered, searchQuery])

  const visibleRequests = sortWithNullsLast(searchedRequests)
  const followUpVisible = sortWithNullsLast(searchedRequests.filter(inFollowUpQueue))

  const needsAttentionSorted = useMemo(
    () =>
      sortNeedsAttentionRequests(
        (isHome ? requests : searchedRequests).filter((r) => needsAttentionEligible(r))
      ),
    [isHome, requests, searchedRequests]
  )

  /** One timestamp per loaded request list so summary cards and staff workload use the same rules. */
  const dashboardMetricsAt = useMemo(() => new Date(), [requests])

  const actionRequiredCount = useMemo(
    () => getDashboardCommandSummaryCounts(requests, dashboardMetricsAt).actionRequired,
    [requests, dashboardMetricsAt]
  )

  const staffCommandCenter = useMemo(
    () =>
      buildStaffCommandCenterRows(isHome ? requests : searchedRequests, {
        now: dashboardMetricsAt,
        limit: isHome ? 6 : 12,
      }),
    [isHome, requests, searchedRequests, dashboardMetricsAt]
  )

  const staffWorkloadRows = useMemo(
    () => buildStaffWorkloadRows(isHome ? requests : searchedRequests, dashboardMetricsAt),
    [isHome, requests, searchedRequests, dashboardMetricsAt]
  )

  const ownershipHealth = useMemo(
    () =>
      buildOwnershipHealth(isHome ? requests : searchedRequests, {
        now: dashboardMetricsAt,
        limit: isHome ? 4 : 6,
      }),
    [isHome, requests, searchedRequests, dashboardMetricsAt]
  )

  const careCadence = useMemo(
    () =>
      buildCareCadenceQueue(isHome ? requests : searchedRequests, {
        now: dashboardMetricsAt,
        limit: isHome ? 4 : 8,
      }),
    [isHome, requests, searchedRequests, dashboardMetricsAt]
  )

  const familyCarePlans = useMemo(
    () =>
      buildCarePlans(isHome ? requests : searchedRequests, {
        now: dashboardMetricsAt,
        limit: isHome ? 4 : 8,
      }),
    [isHome, requests, searchedRequests, dashboardMetricsAt]
  )

  const communicationCommitments = useMemo(
    () =>
      buildCommunicationCommitmentQueue(isHome ? requests : searchedRequests, {
        now: dashboardMetricsAt,
        limit: isHome ? 4 : 8,
      }),
    [isHome, requests, searchedRequests, dashboardMetricsAt]
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

  const listLoadFailed =
    requestsFetchFailed ||
    (Boolean(requestsLoadError) && requests.length === 0 && !loading)

  const isDevRuntime = process.env.NODE_ENV === 'development'

  return (
    <main className="mx-auto min-h-full w-full max-w-6xl px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-5">
      <header className={isHome ? 'mb-3 sm:mb-4' : 'mb-4 sm:mb-5'}>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {isHome ? 'Home' : 'Requests'}
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
          {isHome
            ? 'Start with today’s priorities, then review recommended actions and your work queue.'
            : 'Search and filter parish requests, work the follow-up list, and browse everything in one place.'}
        </p>
      </header>

      {false ? (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 sm:mb-5 ${
            actionRequiredCount > 0
              ? 'border-amber-200 bg-amber-50 text-amber-950'
              : 'border-emerald-200 bg-emerald-50 text-emerald-950'
          }`}
          role="status"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium leading-relaxed">
              {actionRequiredCount > 0 ? (
                <>
                  You have {actionRequiredCount}{' '}
                  {actionRequiredCount === 1 ? 'request' : 'requests'} that{' '}
                  {actionRequiredCount === 1 ? 'needs' : 'need'} attention today.
                </>
              ) : (
                <>You’re all caught up. Great work.</>
              )}
            </p>
            {actionRequiredCount > 0 ? (
              <a
                href="#action-required-heading"
                className={`${primaryButtonMd} w-full shrink-0 justify-center sm:w-auto`}
              >
                Review needs attention
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      {requestsFetchFailed ? (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-950 sm:mb-5"
        >
          <p className="text-base font-semibold">Requests could not be loaded.</p>
          <p className="mt-1.5 text-sm leading-relaxed text-rose-900/95">
            Check your connection or try again. If this keeps happening, contact support.
          </p>
          {isDevRuntime && requestsLoadTechnicalDetail ? (
            <pre className="mt-3 max-h-52 overflow-auto rounded-md border border-rose-200/80 bg-white/90 p-3 text-left font-mono text-xs leading-relaxed whitespace-pre-wrap text-gray-900">
              {requestsLoadTechnicalDetail}
            </pre>
          ) : null}
        </div>
      ) : requestsLoadError ? (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:mb-5"
        >
          {requestsLoadError}
        </div>
      ) : null}

      <div className={isHome ? 'space-y-3 sm:space-y-4' : 'space-y-4 sm:space-y-5'}>
      {isHome ? (
        <>
          <DashboardTodayView
            careCadence={careCadence}
            communicationCommitments={communicationCommitments}
            staffCommandCenter={staffCommandCenter}
            loading={loading}
            dataUnavailable={requestsFetchFailed}
          />

          <DashboardCommandSummary
            requests={requests}
            loading={loading}
            dataUnavailable={requestsFetchFailed}
            metricsAt={dashboardMetricsAt}
            compact
          />

          <DashboardSuggestedActions
            actions={suggestedActions}
            loading={loading || suggestedActionsLoading}
            dataUnavailable={requestsFetchFailed}
            compact
          />

          <DashboardFamilyCarePlans
            plans={familyCarePlans}
            loading={loading}
            dataUnavailable={requestsFetchFailed}
            completingPlanId={carePlanCompletingId}
            messages={carePlanMessages}
            onCompleteTouchpoint={completeCarePlanTouchpoint}
          />
        </>
      ) : (
        <DashboardRequestFilters
          filters={rowFilters}
          onChange={setRowFilters}
          staffOptions={staffAssigneeOptions}
          priestOptions={priestAssigneeOptions}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          disabled={loading || requestsFetchFailed}
        />
      )}

      <section
        className={vineaSectionShellClassName}
        aria-labelledby="staff-command-center-heading"
        aria-busy={loading}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 id="staff-command-center-heading" className={sectionHeadingClassName}>
              Staff command center
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
              Owned next actions across funerals, weddings, baptisms, and OCIA, ranked by
              urgency, blockers, aging, and follow-up risk.
            </p>
          </div>
          {!isHome ? (
            <span className="text-sm font-medium text-gray-600">
              Showing {staffCommandCenter.rows.length} prioritized rows
            </span>
          ) : null}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {[
            ['Act now', staffCommandCenter.summary.actNow, 'act_now'],
            ['Blocked', staffCommandCenter.summary.blocked, 'blocked'],
            ['Aging', staffCommandCenter.summary.aging, 'aging'],
            ['Upcoming', staffCommandCenter.summary.upcoming, 'upcoming'],
          ].map(([label, value, bucket]) => (
            <div
              key={String(bucket)}
              className={`rounded-lg border px-3 py-3 ${commandCenterBucketTone(
                bucket as StaffCommandCenterRow['bucket']
              )}`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {loading ? '—' : value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {loading ? (
            <div
              role="status"
              aria-live="polite"
              aria-label="Loading staff command center"
              className="space-y-3"
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="mt-3 h-5 w-56 rounded bg-gray-200" />
                  <div className="mt-2 h-4 w-full max-w-xl rounded bg-gray-200" />
                  <div className="mt-3 flex gap-2">
                    <div className="h-7 w-24 rounded bg-gray-200" />
                    <div className="h-7 w-24 rounded bg-gray-200" />
                    <div className="h-7 w-24 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : listLoadFailed ? (
            <div className={vineaEmptyStateClassName} role="alert">
              <p className="text-base font-semibold text-gray-900">
                Requests could not be loaded.
              </p>
              <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
                The command center will appear after request data loads successfully.
              </p>
            </div>
          ) : staffCommandCenter.rows.length === 0 ? (
            <div className={vineaEmptyStateClassName} role="status">
              <p className="text-base font-semibold text-gray-900">
                No open command-center work
              </p>
              <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
                Open requests appear here when they need ownership, follow-up, schedule
                confirmation, blocker review, or checklist work.
              </p>
            </div>
          ) : (
            staffCommandCenter.rows.map((row) => renderCommandCenterRow(row))
          )}
        </div>
      </section>

      <DashboardOwnershipHealth
        health={ownershipHealth}
        loading={loading}
        dataUnavailable={requestsFetchFailed}
      />

      <DashboardStaffWorkload
        rows={staffWorkloadRows}
        loading={loading}
        dataUnavailable={requestsFetchFailed}
      />

      {isHome ? (
      <section
        className={vineaSectionShellClassName}
        aria-labelledby="action-required-heading"
        aria-busy={loading}
      >
        <h2 id="action-required-heading" className={sectionHeadingClassName}>
          Today&apos;s work queue
        </h2>
        <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
          Families waiting on you: past-due or due-today follow-ups, and requests not yet assigned
          to staff.
        </p>
        <div className="mt-3 space-y-3">
          {loading ? (
            <div
              role="status"
              aria-live="polite"
              aria-label="Loading needs-attention requests"
              className="space-y-4"
            >
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm ring-1 ring-gray-900/[0.03]"
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
          ) : listLoadFailed ? (
            <div className={vineaEmptyStateClassName} role="alert">
              <p className="text-base font-semibold text-gray-900">
                Requests could not be loaded.
              </p>
              <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
                See the message at the top of the page, then refresh after the issue is fixed.
              </p>
            </div>
          ) : needsAttentionSorted.length === 0 ? (
            <div className={vineaEmptyStateClassName} role="status">
              <p className="text-base font-semibold text-gray-900">
                No requests need attention
              </p>
              <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
                Open requests appear here when a follow-up is overdue or due today, or when
                no staff member is assigned yet. An empty list means you are in good shape.
              </p>
            </div>
          ) : (
            needsAttentionSorted.map((request) => renderNeedsAttentionCard(request))
          )}
        </div>
      </section>
      ) : null}

      {!isHome && loading ? (
        <div
          className={`space-y-5 ${vineaSectionShellClassName}`}
          aria-busy="true"
          aria-live="polite"
          aria-label="Loading dashboard"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[7.5rem] animate-pulse rounded-2xl border border-gray-200/90 bg-slate-50/80 ring-1 ring-gray-900/[0.03]"
              />
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-200/90 bg-slate-50/60 px-4 py-4">
            <span className={vineaSpinnerClassName} aria-hidden="true" />
            <p className="text-base font-medium text-gray-900">Loading requests…</p>
          </div>
        </div>
      ) : !isHome ? (
        <>
          <section
            className={vineaSectionShellClassName}
            aria-labelledby="follow-up-queue-heading"
          >
            <h2 id="follow-up-queue-heading" className={sectionHeadingClassName}>
              Follow-Up Queue ({followUpVisible.length})
            </h2>
            <p className="mb-3 max-w-2xl text-sm leading-relaxed text-gray-600">
              Next: families who need a touchpoint, a confirmed date on the calendar, or
              checklist items finished.
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
            {listLoadFailed ? (
              <div className={vineaEmptyStateClassName} role="alert">
                <p className="text-base font-semibold text-gray-900">
                  Requests could not be loaded.
                </p>
                <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
                  See the message at the top of the page, then refresh after the issue is fixed.
                </p>
              </div>
            ) : followUpVisible.length === 0 ? (
              <div className={vineaEmptyStateClassName} role="status">
                <p className="text-base font-semibold text-gray-900">
                  No requests in the Follow-Up Queue
                </p>
                <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
                  This queue uses the same filters and search as your main list. Try clearing a
                  filter, widening the submitted date range, or turning off the overdue-only
                  checkbox if you expected someone here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {followUpVisible.map((request) => followUpQueueRow(request))}
              </div>
            )}
          </section>

          <section
            className={vineaSectionShellClassName}
            aria-labelledby="dashboard-requests-heading"
          >
            <h2 id="dashboard-requests-heading" className={sectionHeadingClassName}>
              All requests ({visibleRequests.length})
            </h2>
            <p className="mb-3 max-w-2xl text-sm leading-relaxed text-gray-600">
              Browse everything that matches the filters above. Default sort puts the most urgent
              rows at the top.
            </p>
            {visibleRequests.length === 0 ? (
              listLoadFailed ? (
                <div className={vineaEmptyStateClassName} role="alert">
                  <p className="text-base font-semibold text-gray-900">
                    Requests could not be loaded.
                  </p>
                  <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
                    See the message at the top of the page, then refresh after the issue is fixed.
                  </p>
                </div>
              ) : (
                <div className={vineaEmptyStateClassName} role="status">
                  {requests.length === 0 ? (
                    <p className="mx-auto max-w-md text-base font-semibold leading-relaxed text-gray-900">
                      No requests yet. Once someone submits a parish form, it will appear here.
                    </p>
                  ) : (
                    <>
                      <p className="text-base font-semibold text-gray-900">
                        No requests match your filters
                      </p>
                      <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
                        Try clearing filters with the button above, adjusting request type or
                        dates, or change the sort option to see more requests.
                      </p>
                    </>
                  )}
                </div>
              )
            ) : (
              <>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <label htmlFor="dash-sort" className="sr-only">
                    Sort requests
                  </label>
                  <select
                    id="dash-sort"
                    className="w-full shrink-0 rounded-xl border border-gray-200 bg-white p-3.5 text-base text-gray-900 shadow-sm transition-colors focus:border-brand/35 focus:outline-none focus:ring-2 focus:ring-brand/20 sm:w-auto sm:min-w-[14rem]"
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as
                          | 'urgency'
                          | 'created_desc'
                          | 'created_asc'
                          | 'confirmed_baptism_date'
                          | 'last_contacted'
                          | 'status'
                      )
                    }
                  >
                    <option value="urgency">Most urgent first</option>
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

          <RequestLinksSection />
        </>
      ) : null}
      </div>
    </main>
  )
}
