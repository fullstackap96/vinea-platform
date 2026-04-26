'use client'

import { useEffect, useRef } from 'react'
import { CheckCircle, Mail, Pencil } from 'lucide-react'
import { RequestTypeBadge } from '@/app/_components/RequestTypeBadge'
import { RequestStatusBadgeWithTooltip } from '@/lib/RequestStatusBadgeWithTooltip'
import { primaryButtonSm, secondaryButtonSm } from '@/lib/buttonStyles'
import { REQUEST_QUICK_ACTION_SECTION_IDS } from './RequestQuickActionsCard'

export type RequestDetailControlBarProps = {
  requestType: string
  /** Main identity line (usually contact name). */
  primaryHeading: string
  /** Optional supporting line (e.g. email). */
  subtitle?: string | null
  status: unknown
  canEditIntake: boolean
  editingIntake: boolean
  onEditIntake: () => void
  onMarkComplete: () => void
}

const controlActionClass = `${secondaryButtonSm} justify-center gap-2`

export function RequestDetailControlBar({
  requestType,
  primaryHeading,
  subtitle,
  status,
  canEditIntake,
  editingIntake,
  onEditIntake,
  onMarkComplete,
}: RequestDetailControlBarProps) {
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

  return (
    <div className="mb-6 sm:mb-8 rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm ring-1 ring-black/[0.03] sm:px-6 sm:py-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <RequestTypeBadge requestType={requestType} />
            <RequestStatusBadgeWithTooltip status={status} />
          </div>
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl break-words">
            {primaryHeading}
          </h1>
          {subtitle ? (
            <p className="text-sm text-gray-600 break-words">{subtitle}</p>
          ) : null}
        </div>

        <div
          className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end lg:pt-1"
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
    </div>
  )
}
