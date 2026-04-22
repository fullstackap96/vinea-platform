import { getStatusDescription } from '@/lib/requestStatus'
import { RequestStatusBadge } from '@/lib/RequestStatusBadge'

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

/**
 * Status chip plus a small info icon; hovering the badge or icon shows a compact tooltip.
 * Uses only spans (no nested button) so it is safe inside dashboard cards wrapped in `Link`.
 */
export function RequestStatusBadgeWithTooltip({
  status,
  className,
}: {
  status: unknown
  className?: string
}) {
  const description = getStatusDescription(status)
  if (!description) {
    return <RequestStatusBadge status={status} className={className} />
  }

  return (
    <span className="group/status-tip relative inline-flex items-center gap-1 align-middle">
      <RequestStatusBadge status={status} className={className} />
      <span
        className="inline-flex shrink-0 cursor-help text-gray-500 transition-colors group-hover/status-tip:text-brand"
        aria-hidden="true"
      >
        <StatusInfoIcon />
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 w-max max-w-[13rem] -translate-x-1/2 rounded-md bg-gray-900 px-2.5 py-1.5 text-left text-[11px] leading-snug text-white opacity-0 shadow-lg ring-1 ring-black/10 transition-opacity duration-150 group-hover/status-tip:opacity-100 sm:text-xs"
      >
        {description}
      </span>
    </span>
  )
}
