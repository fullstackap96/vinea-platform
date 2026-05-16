'use client'

import type { RequestDetailQuickAction } from '@/lib/requestDetailQuickActions'
import { primaryButtonMd, secondaryButtonSm } from '@/lib/buttonStyles'
import { scrollAndHighlightRequestSection } from './requestDetailSectionNav'

export function RequestWorkflowActionButton({
  action,
  variant = 'primary',
  onMarkComplete,
  isComplete,
}: {
  action: RequestDetailQuickAction
  variant?: 'primary' | 'secondary'
  onMarkComplete?: () => void
  isComplete?: boolean
}) {
  const isMarkCompleteAction =
    action.label === 'Mark complete' || action.href === '#completion'
  const className =
    variant === 'primary'
      ? `${primaryButtonMd} w-full justify-center sm:w-auto`
      : `${secondaryButtonSm} justify-center`

  if (variant === 'primary' && isMarkCompleteAction && !isComplete && onMarkComplete) {
    return (
      <button type="button" onClick={onMarkComplete} className={className}>
        {action.label}
      </button>
    )
  }

  return (
    <a
      href={action.href}
      className={className}
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
