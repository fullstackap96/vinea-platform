'use client'

import { useEffect, useRef } from 'react'
import { CheckCircle, Mail, Pencil } from 'lucide-react'
import { RequestTypeBadge } from '@/app/_components/RequestTypeBadge'
import { ParishRequestStatusBadgeWithTooltip } from '@/lib/ParishRequestStatusBadge'
import type { ParishRequestVisualStatusInput } from '@/lib/parishRequestVisualStatus'
import { assignmentDisplayLabel } from '@/lib/requestAssignment'
import { primaryButtonSm, secondaryButtonSm } from '@/lib/buttonStyles'
import { REQUEST_QUICK_ACTION_SECTION_IDS } from './RequestQuickActionsCard'

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
  canEditIntake: boolean
  editingIntake: boolean
  onEditIntake: () => void
  onMarkComplete: () => void
}

const controlActionClass = `${secondaryButtonSm} justify-center gap-2`
const summaryLabel = 'text-[11px] font-semibold uppercase tracking-wide text-gray-500'
const summaryValue = 'mt-0.5 text-sm font-medium text-gray-900'

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

  const staff = assignmentDisplayLabel(assignedStaffName)
  const priest = assignmentDisplayLabel(assignedPriestName)
  const deacon = assignmentDisplayLabel(assignedDeaconName)

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/80 shadow-sm ring-1 ring-black/[0.04] sm:mb-8">
      <div className="border-b border-gray-100 bg-white/90 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <RequestTypeBadge requestType={requestType} />
              <ParishRequestStatusBadgeWithTooltip request={parishStatus} />
            </div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl break-words">
              {primaryHeading}
            </h1>
            {subtitle ? (
              <p className="text-sm text-gray-600 break-words">{subtitle}</p>
            ) : null}
          </div>

          <div
            className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end"
            role="toolbar"
            aria-label="Request actions"
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
              className={`${controlActionClass} w-full sm:w-auto disabled:pointer-events-none disabled:opacity-50`}
            >
              <Pencil className="h-4 w-4 shrink-0 text-gray-600" aria-hidden />
              {editingIntake ? 'Editing details…' : 'Edit request details'}
            </button>
            <button
              type="button"
              onClick={onMarkComplete}
              disabled={isComplete}
              className={`${primaryButtonSm} w-full justify-center gap-2 sm:w-auto disabled:pointer-events-none disabled:opacity-50`}
            >
              <CheckCircle className="h-4 w-4 shrink-0" aria-hidden />
              Mark complete
            </button>
            <a href={sendHref} className={`${controlActionClass} w-full sm:w-auto`}>
              <Mail className="h-4 w-4 shrink-0 text-gray-600" aria-hidden />
              Send email
            </a>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-3 border-t border-gray-100 pt-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          <div className="min-w-0 rounded-lg bg-gray-50/90 px-3 py-2.5 ring-1 ring-gray-200/60">
            <dt className={summaryLabel}>Assigned staff</dt>
            <dd className={summaryValue}>{staff || '—'}</dd>
          </div>
          <div className="min-w-0 rounded-lg bg-gray-50/90 px-3 py-2.5 ring-1 ring-gray-200/60">
            <dt className={summaryLabel}>Assigned priest</dt>
            <dd className={summaryValue}>{priest || '—'}</dd>
            {deacon && deacon !== '—' ? (
              <>
                <dt className={`${summaryLabel} mt-2`}>Deacon</dt>
                <dd className={`${summaryValue} text-sm`}>{deacon}</dd>
              </>
            ) : null}
          </div>
          <div className="min-w-0 rounded-lg bg-violet-50/50 px-3 py-2.5 ring-1 ring-violet-200/50 sm:col-span-2 lg:col-span-1">
            <dt className={`${summaryLabel} text-violet-800/90`}>Next step</dt>
            <dd className={`${summaryValue} text-violet-950`}>{nextStepTitle}</dd>
            <p className="mt-1 text-xs leading-snug text-violet-900/80">{nextStepInstruction}</p>
          </div>
          <div className="min-w-0 rounded-lg bg-sky-50/50 px-3 py-2.5 ring-1 ring-sky-200/60 sm:col-span-2 lg:col-span-1">
            <dt className={`${summaryLabel} text-sky-900/80`}>Follow-up date</dt>
            <dd className={`${summaryValue} text-sky-950`}>{followUpDisplay}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
