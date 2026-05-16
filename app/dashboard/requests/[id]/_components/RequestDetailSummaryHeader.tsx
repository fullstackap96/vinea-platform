'use client'

import { useEffect, useRef } from 'react'
import { CheckCircle, Mail, Pencil } from 'lucide-react'
import { RequestTypeBadge } from '@/app/_components/RequestTypeBadge'
import { ParishRequestStatusBadgeWithTooltip } from '@/lib/ParishRequestStatusBadge'
import type { ParishRequestVisualStatusInput } from '@/lib/parishRequestVisualStatus'
import { assignmentDisplayLabel } from '@/lib/requestAssignment'
import type { RequestDetailQuickAction } from '@/lib/requestDetailQuickActions'
import { getStatusLabel } from '@/lib/requestStatus'
import { primaryButtonMd, secondaryButtonSm } from '@/lib/buttonStyles'
import { REQUEST_QUICK_ACTION_SECTION_IDS } from './RequestQuickActionsCard'
import { scrollAndHighlightRequestSection } from './requestDetailSectionNav'

export type RequestDetailSummaryHeaderProps = {
  primaryHeading: string
  subtitle?: string | null
  requestType: string
  parishStatus: ParishRequestVisualStatusInput
  assignedStaffName: unknown
  assignedPriestName: unknown
  assignedDeaconName: unknown
  nextStepTitle: string
  nextStepInstruction: string
  followUpDisplay: string
  status: unknown
  primaryAction: RequestDetailQuickAction
  canEditIntake: boolean
  editingIntake: boolean
  onEditIntake: () => void
  onMarkComplete: () => void
}

const summaryLabel = 'text-[11px] font-semibold uppercase tracking-wide text-gray-500'
const summaryValue = 'mt-0.5 text-sm font-medium text-gray-900'

function formatAssignmentSummary(
  assignedStaffName: unknown,
  assignedPriestName: unknown,
  assignedDeaconName: unknown
): string {
  const parts: string[] = []
  for (const value of [assignedStaffName, assignedPriestName, assignedDeaconName]) {
    const label = assignmentDisplayLabel(value)
    if (label && label !== 'Unassigned' && !parts.includes(label)) {
      parts.push(label)
    }
  }
  return parts.length > 0 ? parts.join(' · ') : 'Unassigned'
}

function PrimaryWorkflowAction({
  action,
  onMarkComplete,
  isComplete,
}: {
  action: RequestDetailQuickAction
  onMarkComplete: () => void
  isComplete: boolean
}) {
  const isMarkCompleteAction =
    action.label === 'Mark complete' || action.href === '#completion'

  if (isMarkCompleteAction && !isComplete) {
    return (
      <button
        type="button"
        onClick={onMarkComplete}
        className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
      >
        {action.label}
      </button>
    )
  }

  return (
    <a
      href={action.href}
      className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
      onClick={(e) => {
        if (typeof window === 'undefined') return
        if (window.location.hash === action.href) {
          e.preventDefault()
          scrollAndHighlightRequestSection(action.href)
        }
      }}
    >
      {action.label}
    </a>
  )
}

export function RequestDetailSummaryHeader({
  primaryHeading,
  subtitle,
  requestType,
  parishStatus,
  assignedStaffName,
  assignedPriestName,
  assignedDeaconName,
  nextStepTitle,
  nextStepInstruction,
  followUpDisplay,
  status,
  primaryAction,
  canEditIntake,
  editingIntake,
  onEditIntake,
  onMarkComplete,
}: RequestDetailSummaryHeaderProps) {
  const prevEditing = useRef(editingIntake)
  useEffect(() => {
    if (editingIntake && !prevEditing.current) {
      const el = document.getElementById('request-intake-editor')
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    prevEditing.current = editingIntake
  }, [editingIntake])

  const sendHref = `#${REQUEST_QUICK_ACTION_SECTION_IDS.sendEmail}`
  const isComplete = String(status ?? '').trim() === 'complete'
  const statusLabel = getStatusLabel(status)
  const assignmentSummary = formatAssignmentSummary(
    assignedStaffName,
    assignedPriestName,
    assignedDeaconName
  )
  const primaryIsMarkComplete =
    primaryAction.label === 'Mark complete' || primaryAction.href === '#completion'

  return (
    <header className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/80 shadow-sm ring-1 ring-black/[0.04] sm:mb-8">
      <div className="border-b border-gray-100 bg-white/90 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center gap-2">
          <RequestTypeBadge requestType={requestType} />
          <ParishRequestStatusBadgeWithTooltip request={parishStatus} />
        </div>

        <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl break-words">
          {primaryHeading}
        </h1>
        {subtitle ? (
          <p className="mt-1.5 text-sm text-gray-600 break-words">{subtitle}</p>
        ) : null}

        <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          <div className="min-w-0 rounded-lg bg-gray-50/90 px-3 py-2.5 ring-1 ring-gray-200/60">
            <dt className={summaryLabel}>Status</dt>
            <dd className={summaryValue}>{statusLabel}</dd>
          </div>
          <div className="min-w-0 rounded-lg bg-gray-50/90 px-3 py-2.5 ring-1 ring-gray-200/60">
            <dt className={summaryLabel}>Assigned</dt>
            <dd className={`${summaryValue} break-words`}>{assignmentSummary}</dd>
          </div>
          <div className="min-w-0 rounded-lg bg-violet-50/50 px-3 py-2.5 ring-1 ring-violet-200/50">
            <dt className={`${summaryLabel} text-violet-800/90`}>Next step</dt>
            <dd className={`${summaryValue} text-violet-950`}>{nextStepTitle}</dd>
            <p className="mt-1 text-xs leading-snug text-violet-900/80 line-clamp-2">
              {nextStepInstruction}
            </p>
          </div>
          <div className="min-w-0 rounded-lg bg-sky-50/50 px-3 py-2.5 ring-1 ring-sky-200/60">
            <dt className={`${summaryLabel} text-sky-900/80`}>Follow-up date</dt>
            <dd className={`${summaryValue} text-sky-950`}>{followUpDisplay}</dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <PrimaryWorkflowAction
            action={primaryAction}
            onMarkComplete={onMarkComplete}
            isComplete={isComplete}
          />
          <div
            className="flex flex-wrap items-center gap-2"
            role="toolbar"
            aria-label="More request actions"
          >
            <button
              type="button"
              onClick={onEditIntake}
              disabled={!canEditIntake || editingIntake}
              title={
                !canEditIntake
                  ? 'Intake cannot be edited until a contact record is available for this request.'
                  : undefined
              }
              className={`${secondaryButtonSm} justify-center gap-1.5 disabled:pointer-events-none disabled:opacity-50`}
            >
              <Pencil className="h-3.5 w-3.5 shrink-0 text-gray-600" aria-hidden />
              {editingIntake ? 'Editing…' : 'Edit details'}
            </button>
            <a href={sendHref} className={`${secondaryButtonSm} justify-center gap-1.5`}>
              <Mail className="h-3.5 w-3.5 shrink-0 text-gray-600" aria-hidden />
              Send email
            </a>
            {!isComplete && !primaryIsMarkComplete ? (
              <button
                type="button"
                onClick={onMarkComplete}
                className={`${secondaryButtonSm} justify-center gap-1.5`}
              >
                <CheckCircle className="h-3.5 w-3.5 shrink-0 text-gray-600" aria-hidden />
                Mark complete
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
