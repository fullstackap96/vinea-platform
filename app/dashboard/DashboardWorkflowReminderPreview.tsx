'use client'

import Link from 'next/link'
import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileWarning,
  ShieldCheck,
  UserPlus,
} from 'lucide-react'
import { secondaryButtonSm } from '@/lib/buttonStyles'
import { chipBase } from '@/lib/chipStyles'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaEmptyStateClassName, vineaSectionShellClassName } from '@/lib/vineaUi'
import type {
  WorkflowReminderCandidate,
  WorkflowReminderKind,
  WorkflowReminderSeverity,
} from '@/lib/workflowReminderDtos'

function severityClasses(severity: WorkflowReminderSeverity): string {
  switch (severity) {
    case 'urgent':
      return 'border-rose-200 bg-rose-50 text-rose-950'
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    case 'info':
    default:
      return 'border-sky-200 bg-sky-50 text-sky-950'
  }
}

function severityLabel(severity: WorkflowReminderSeverity): string {
  switch (severity) {
    case 'urgent':
      return 'Needs attention'
    case 'warning':
      return 'Review soon'
    case 'info':
    default:
      return 'For review'
  }
}

function reminderIcon(kind: WorkflowReminderKind) {
  switch (kind) {
    case 'overdue_follow_up':
    case 'stalled_request':
      return <BellRing className="h-4 w-4" aria-hidden="true" />
    case 'missing_documents':
      return <FileWarning className="h-4 w-4" aria-hidden="true" />
    case 'upcoming_sacramental_date':
      return <CalendarClock className="h-4 w-4" aria-hidden="true" />
    case 'unassigned_request':
      return <UserPlus className="h-4 w-4" aria-hidden="true" />
    case 'certificate_ready':
      return <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
    case 'duplicate_review':
    default:
      return <ShieldCheck className="h-4 w-4" aria-hidden="true" />
  }
}

function formatDueAt(value: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function DashboardWorkflowReminderPreview({
  reminders,
  loading,
  dataUnavailable,
}: {
  reminders: readonly WorkflowReminderCandidate[]
  loading: boolean
  dataUnavailable: boolean
}) {
  const visibleReminders = reminders.slice(0, 6)
  const hiddenCount = Math.max(0, reminders.length - visibleReminders.length)

  if (loading) {
    return (
      <section className={`${vineaSectionShellClassName} animate-pulse`} aria-busy="true">
        <div className="h-5 w-48 rounded bg-gray-200" />
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-28 rounded-xl bg-gray-100" />
          ))}
        </div>
      </section>
    )
  }

  if (dataUnavailable) {
    return (
      <section className={vineaSectionShellClassName}>
        <div className={vineaEmptyStateClassName}>
          <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
          Reminder preview could not load request signals. Try refreshing before using reminders.
        </div>
      </section>
    )
  }

  return (
    <section className={vineaSectionShellClassName} aria-labelledby="workflow-reminders-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Staff-reviewed reminder preview
          </p>
          <h2 id="workflow-reminders-heading" className={`${sectionHeadingClassName} mt-1`}>
            Reminders V1
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            A read-only preview of work Vinea can safely flag for staff review. Nothing here sends
            a message, schedules automation, or changes parish records.
          </p>
        </div>
        <span className={`${chipBase} border-emerald-200 bg-emerald-50 text-emerald-950`}>
          Staff review required
        </span>
      </div>

      {visibleReminders.length > 0 ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {visibleReminders.map((reminder) => {
            const dueAt = formatDueAt(reminder.dueAt)
            return (
              <article
                key={reminder.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <span
                      className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${severityClasses(
                        reminder.severity
                      )}`}
                    >
                      {reminderIcon(reminder.kind)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-950">{reminder.title}</p>
                      <p className="mt-1 text-sm leading-snug text-gray-700">
                        {reminder.detail}
                      </p>
                    </div>
                  </div>
                  <span className={`${chipBase} ${severityClasses(reminder.severity)} shrink-0`}>
                    {severityLabel(reminder.severity)}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-gray-900">Owner:</span>{' '}
                    {reminder.ownerLabel}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Due:</span>{' '}
                    {dueAt ?? 'Review when staff are ready'}
                  </p>
                </div>

                <p className="mt-3 text-sm leading-snug text-gray-700">
                  <span className="font-semibold text-gray-950">Recommended:</span>{' '}
                  {reminder.recommendedAction}
                </p>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-medium text-gray-500">
                    No automated sending. No record changes. Dashboard preview only.
                  </p>
                  <Link href={reminder.href} className={secondaryButtonSm}>
                    Review safely
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className={`${vineaEmptyStateClassName} mt-4`}>
          <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          No staff-reviewed reminder candidates are visible right now.
        </div>
      )}

      {hiddenCount > 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          {hiddenCount} additional reminder {hiddenCount === 1 ? 'candidate is' : 'candidates are'}{' '}
          available in the request queue. The preview stays short so the first screen remains easy
          to scan.
        </p>
      ) : null}
    </section>
  )
}
