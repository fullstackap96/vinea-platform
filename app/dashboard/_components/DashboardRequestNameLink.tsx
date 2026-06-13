import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  dashboardRequestNameArrowClassName,
  dashboardRequestNameInCardClassName,
  dashboardRequestNameLinkClassName,
  dashboardRequestNameSizeClassName,
  dashboardRequestOpenLabel,
  requestDetailHref,
} from '@/lib/dashboardRequestNavigation'

type Props = {
  name: string
  requestId?: string
  /** When true, render styled text inside a parent link (no nested anchor). */
  embedded?: boolean
  className?: string
  size?: 'sm' | 'base' | 'lg'
}

export function DashboardRequestNameLink({
  name,
  requestId,
  embedded = false,
  className = '',
  size = 'base',
}: Props) {
  const displayName = String(name ?? '').trim() || '—'
  const sizeClass = dashboardRequestNameSizeClassName(size)
  const content = (
    <>
      <span className="min-w-0 break-words">{displayName}</span>
      <ArrowRight className={dashboardRequestNameArrowClassName} aria-hidden />
    </>
  )

  if (embedded) {
    return (
      <span className={`${dashboardRequestNameInCardClassName} ${sizeClass} ${className}`.trim()}>
        {content}
      </span>
    )
  }

  const id = String(requestId ?? '').trim()
  if (!id) {
    return (
      <span className={`${dashboardRequestNameInCardClassName} ${sizeClass} ${className}`.trim()}>
        {content}
      </span>
    )
  }

  return (
    <Link
      href={requestDetailHref(id)}
      aria-label={dashboardRequestOpenLabel(displayName)}
      className={`${dashboardRequestNameLinkClassName} ${sizeClass} ${className}`.trim()}
    >
      {content}
    </Link>
  )
}
