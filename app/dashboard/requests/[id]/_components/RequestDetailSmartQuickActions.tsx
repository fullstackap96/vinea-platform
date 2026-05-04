'use client'

import { Sparkles } from 'lucide-react'
import { primaryButtonMd, secondaryButtonSm } from '@/lib/buttonStyles'
import type { RequestWorkflowV2Input } from '@/lib/requestWorkflowV2'
import {
  getRequestDetailSmartQuickActions,
  type RequestDetailQuickAction,
} from '@/lib/requestDetailQuickActions'

export type RequestDetailSmartQuickActionsProps = {
  workflowInput: RequestWorkflowV2Input
  canMarkComplete: boolean
  hasRecipientEmail: boolean
}

function scrollAndHighlightSection(id: string) {
  if (typeof window === 'undefined') return
  const el = document.getElementById(id) as HTMLElement | null
  if (!el) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })

  const cls = 'request-detail-hash-highlight'
  el.classList.remove(cls)
  el.style.animationDuration = ''
  void el.offsetWidth
  el.classList.add(cls)
  el.style.animationDuration = reduced ? '2200ms' : '3500ms'
  const timeout = reduced ? 2600 : 3900
  window.setTimeout(() => {
    el.classList.remove(cls)
    el.style.animationDuration = ''
  }, timeout)
}

function ActionLink({
  action,
  className,
}: {
  action: RequestDetailQuickAction
  className: string
}) {
  return (
    <a
      href={action.href}
      className={className}
      onClick={(e) => {
        if (typeof window === 'undefined') return
        if (window.location.hash === action.href) {
          e.preventDefault()
          scrollAndHighlightSection(action.href.slice(1))
        }
      }}
    >
      {action.label}
    </a>
  )
}

export function RequestDetailSmartQuickActions({
  workflowInput,
  canMarkComplete,
  hasRecipientEmail,
}: RequestDetailSmartQuickActionsProps) {
  const { primary, secondary } = getRequestDetailSmartQuickActions({
    workflowInput,
    canMarkComplete,
    hasRecipientEmail,
  })

  return (
    <section
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-brand/10 sm:p-5"
      aria-labelledby="smart-quick-actions-heading"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2
            id="smart-quick-actions-heading"
            className="flex items-center gap-2 text-sm font-semibold text-gray-900"
          >
            <Sparkles className="h-4 w-4 shrink-0 text-brand" aria-hidden />
            Smart quick actions
          </h2>
          <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-gray-600">
            Suggested from the current next step. Jump to a section and highlight it on the page.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
        <ActionLink action={primary} className={`${primaryButtonMd} w-full shrink-0 justify-center sm:w-auto`} />
        {secondary.length > 0 ? (
          <div
            className="flex flex-1 flex-wrap gap-2 sm:min-w-0 sm:justify-end"
            role="group"
            aria-label="Secondary quick actions"
          >
            {secondary.map((a) => (
              <ActionLink
                key={a.key}
                action={a}
                className={`${secondaryButtonSm} justify-center`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
