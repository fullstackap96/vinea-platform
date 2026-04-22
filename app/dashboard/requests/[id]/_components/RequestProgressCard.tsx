import {
  hasConfirmedSchedule,
  type RequestScheduleRow,
} from '@/lib/requestConfirmedSchedule'

export type RequestProgressCardProps = {
  assignedStaffName: unknown
  nextFollowUpDate: unknown
  lastContactedAt: unknown
  scheduleRow: RequestScheduleRow
}

const TOTAL_STEPS = 4

function isBlank(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return !value.trim()
  return false
}

export function computeRequestProgress(props: RequestProgressCardProps): {
  complete: number
  total: number
  statusLabel: string
} {
  const stepsComplete = [
    !isBlank(props.assignedStaffName),
    !isBlank(props.nextFollowUpDate),
    !isBlank(props.lastContactedAt),
    hasConfirmedSchedule(props.scheduleRow),
  ].filter(Boolean).length

  let statusLabel: string
  if (stepsComplete <= 1) {
    statusLabel = 'Needs attention'
  } else if (stepsComplete < TOTAL_STEPS) {
    statusLabel = 'In progress'
  } else {
    statusLabel = 'On track'
  }

  return { complete: stepsComplete, total: TOTAL_STEPS, statusLabel }
}

export function RequestProgressCard(props: RequestProgressCardProps) {
  const { complete, total, statusLabel } = computeRequestProgress(props)
  const pct = Math.round((complete / total) * 100)

  const statusClass =
    complete <= 1
      ? 'text-amber-900/90'
      : complete < total
        ? 'text-gray-700'
        : 'text-emerald-900/85'

  return (
    <div
      className="mb-6 sm:mb-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
      role="region"
      aria-labelledby="request-progress-heading"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <h2
          id="request-progress-heading"
          className="text-sm font-semibold text-gray-900"
        >
          Request Progress
        </h2>
        <p className="text-xs font-medium tabular-nums text-gray-500 sm:text-right">
          {complete} of {total} key steps complete
        </p>
      </div>

      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100"
        role="progressbar"
        aria-valuenow={complete}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${complete} of ${total} key workflow steps complete`}
      >
        <div
          className="h-full rounded-full bg-gray-400 transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className={`mt-2 text-xs font-medium ${statusClass}`}>{statusLabel}</p>
    </div>
  )
}
