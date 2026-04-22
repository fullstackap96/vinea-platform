import { getStatusLabel, requestStatusBadgeClasses } from '@/lib/requestStatus'

export function RequestStatusBadge({
  status,
  className,
}: {
  status: unknown
  className?: string
}) {
  const base = requestStatusBadgeClasses(status)
  return (
    <span className={className ? `${base} ${className}` : base}>
      {getStatusLabel(status)}
    </span>
  )
}
