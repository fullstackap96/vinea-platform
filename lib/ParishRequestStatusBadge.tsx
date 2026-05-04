'use client'

import type { LucideIcon } from 'lucide-react'
import {
  AlertCircle,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  Hourglass,
  Inbox,
  ListTodo,
  MessageCircleHeart,
} from 'lucide-react'
import { REQUEST_STATUS_BADGE_BASE } from '@/lib/requestStatus'
import {
  resolveParishRequestVisualStatus,
  type ParishRequestVisualStatusInput,
  type ParishVisualStatusKey,
} from '@/lib/parishRequestVisualStatus'

function StatusInfoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clipRule="evenodd"
      />
    </svg>
  )
}

const ICONS: Record<ParishVisualStatusKey, LucideIcon> = {
  completed: CheckCircle2,
  follow_up_overdue: CalendarClock,
  action_required: AlertCircle,
  waiting_on_hold: Hourglass,
  waiting_on_family: MessageCircleHeart,
  scheduled: CalendarCheck2,
  new_request: Inbox,
  in_progress: ListTodo,
}

export type ParishRequestStatusBadgeWithTooltipProps = {
  request: ParishRequestVisualStatusInput
  className?: string
}

/**
 * Parish-friendly status chip (label + icon) with tooltip. Safe inside dashboard `Link`s.
 */
export function ParishRequestStatusBadgeWithTooltip({
  request,
  className,
}: ParishRequestStatusBadgeWithTooltipProps) {
  const v = resolveParishRequestVisualStatus(request)
  const Icon = ICONS[v.key]
  const base = `${REQUEST_STATUS_BADGE_BASE} ${v.badgeSurfaceClassName}`
  const merged = className ? `${base} ${className}` : base

  return (
    <span className="group/status-tip relative inline-flex items-center align-middle">
      <span className={merged}>
        <Icon className="h-4 w-4 shrink-0 opacity-95" strokeWidth={2} aria-hidden />
        <span className="min-w-0">{v.label}</span>
      </span>
      <span
        className="inline-flex shrink-0 cursor-help text-gray-500 transition-colors group-hover/status-tip:text-brand"
        aria-hidden="true"
      >
        <StatusInfoIcon />
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 w-max max-w-[15rem] -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-left text-xs leading-snug text-white opacity-0 shadow-lg ring-1 ring-black/10 transition-opacity duration-200 group-hover/status-tip:opacity-100"
      >
        {v.description}
      </span>
    </span>
  )
}
