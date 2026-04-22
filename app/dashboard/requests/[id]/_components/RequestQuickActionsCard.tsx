import { CalendarClock, Mail, MessageSquare, UserPlus } from 'lucide-react'
import { secondaryButtonSm } from '@/lib/buttonStyles'

/** Stable fragment ids for in-page navigation (Quick Actions + deep links). */
export const REQUEST_QUICK_ACTION_SECTION_IDS = {
  assignment: 'assignment',
  nextFollowUp: 'next-follow-up',
  sendEmail: 'send-email',
  communication: 'communication',
} as const

const quickActionLinkClass = `${secondaryButtonSm} w-full justify-center gap-2 text-gray-800`

export function RequestQuickActionsCard() {
  const ids = REQUEST_QUICK_ACTION_SECTION_IDS

  return (
    <div
      className="mb-6 sm:mb-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
      role="navigation"
      aria-label="Quick actions"
    >
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Quick Actions
      </h2>
      <p className="mb-3 text-xs text-gray-600 sm:mb-4">
        Jump to common tasks on this page.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <a href={`#${ids.assignment}`} className={quickActionLinkClass}>
          <UserPlus className="h-4 w-4 shrink-0 text-gray-600" aria-hidden />
          Assign staff
        </a>
        <a href={`#${ids.nextFollowUp}`} className={quickActionLinkClass}>
          <CalendarClock className="h-4 w-4 shrink-0 text-gray-600" aria-hidden />
          Set follow-up
        </a>
        <a href={`#${ids.sendEmail}`} className={quickActionLinkClass}>
          <Mail className="h-4 w-4 shrink-0 text-gray-600" aria-hidden />
          Send email
        </a>
        <a href={`#${ids.communication}`} className={quickActionLinkClass}>
          <MessageSquare className="h-4 w-4 shrink-0 text-gray-600" aria-hidden />
          Log communication
        </a>
      </div>
    </div>
  )
}
