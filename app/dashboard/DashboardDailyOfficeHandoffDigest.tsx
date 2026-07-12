'use client'

import Link from 'next/link'
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Coffee,
  Moon,
  ShieldCheck,
  Sunrise,
} from 'lucide-react'
import { secondaryButtonSm } from '@/lib/buttonStyles'
import { chipBase } from '@/lib/chipStyles'
import type {
  DailyOfficeHandoffDigest,
  DailyOfficeHandoffItem,
  DailyOfficeHandoffPhaseKey,
  DailyOfficeHandoffPriority,
  DailyOfficeHandoffSource,
} from '@/lib/dailyOfficeHandoffDigest'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaEmptyStateClassName, vineaSectionShellClassName } from '@/lib/vineaUi'

function priorityClasses(priority: DailyOfficeHandoffPriority): string {
  switch (priority) {
    case 'urgent':
      return 'border-rose-200 bg-rose-50 text-rose-950'
    case 'watch':
    default:
      return 'border-amber-200 bg-amber-50 text-amber-950'
  }
}

function priorityLabel(priority: DailyOfficeHandoffPriority): string {
  return priority === 'urgent' ? 'Review first' : 'Watch today'
}

function sourceLabel(source: DailyOfficeHandoffSource): string {
  return source === 'parish_health_score'
    ? 'Parish Health Score'
    : 'Operational Intelligence'
}

function slotIcon(key: DailyOfficeHandoffPhaseKey) {
  switch (key) {
    case 'opening':
      return <Sunrise className="h-4 w-4" aria-hidden="true" />
    case 'midday':
      return <Coffee className="h-4 w-4" aria-hidden="true" />
    case 'before_close':
    default:
      return <Moon className="h-4 w-4" aria-hidden="true" />
  }
}

function HandoffItemCard({ item }: { item: DailyOfficeHandoffItem }) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-950">{item.title}</p>
          <p className="mt-1 text-sm leading-snug text-gray-700">{item.detail}</p>
        </div>
        <span className={`${chipBase} ${priorityClasses(item.priority)} shrink-0`}>
          {priorityLabel(item.priority)}
        </span>
      </div>
      <p className="mt-2 text-sm leading-snug text-gray-700">
        <span className="font-semibold text-gray-950">Staff next step:</span> {item.staffAction}
      </p>
      <p className="mt-2 text-xs font-medium text-gray-500">Source: {sourceLabel(item.source)}</p>
      {item.href ? (
        <Link href={item.href} className={`${secondaryButtonSm} mt-3`}>
          Open existing queue
        </Link>
      ) : null}
    </article>
  )
}

export function DashboardDailyOfficeHandoffDigest({
  digest,
  loading,
  dataUnavailable,
  activeParishName,
}: {
  digest: DailyOfficeHandoffDigest
  loading: boolean
  dataUnavailable: boolean
  activeParishName: string | null
}) {
  if (loading) {
    return (
      <section className={`${vineaSectionShellClassName} animate-pulse`} aria-busy="true">
        <div className="h-5 w-52 rounded bg-gray-200" />
        <div className="mt-4 h-7 w-3/4 rounded bg-gray-200" />
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-44 rounded-xl bg-gray-100" />
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
          Daily office handoff could not load dashboard signals. Try refreshing before using the
          handoff.
        </div>
      </section>
    )
  }

  return (
    <section className={vineaSectionShellClassName} aria-labelledby="daily-office-handoff-heading">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Staff handoff rhythm
          </p>
          <h2 id="daily-office-handoff-heading" className={`${sectionHeadingClassName} mt-1`}>
            {digest.title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            {activeParishName
              ? `Scoped to ${activeParishName}. ${digest.subline}`
              : digest.subline}
          </p>
        </div>
        <span className={`${chipBase} border-violet-200 bg-violet-50 text-violet-950`}>
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
          Staff-reviewed only
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50/60 p-4">
        <p className="text-base font-semibold leading-snug text-violet-950">{digest.headline}</p>
        <p className="mt-1 text-sm leading-relaxed text-violet-900">
          Use these cues as a calm office handoff. They point to existing review queues and do not
          perform work automatically.
        </p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {digest.slots.map((slot) => (
          <section key={slot.key} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700">
                {slotIcon(slot.key)}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-950">{slot.label}</h3>
                <p className="mt-0.5 text-xs leading-snug text-gray-600">{slot.guidance}</p>
              </div>
            </div>

            {slot.items.length > 0 ? (
              <div className="mt-3 space-y-2">
                {slot.items.map((item) => (
                  <HandoffItemCard key={item.key} item={item} />
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-relaxed text-emerald-950">
                <CheckCircle2 className="mb-2 h-4 w-4 text-emerald-700" aria-hidden="true" />
                {slot.emptyState}
              </div>
            )}
          </section>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-gray-500" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-gray-950">Read-only boundary</h3>
        </div>
        <ul className="mt-2 space-y-1 text-sm leading-relaxed text-gray-600">
          {digest.coverageNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
