'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Clock, UserRound } from 'lucide-react'
import type {
  ParishCareCalendarItem,
  ParishCareCalendarKind,
  ParishCareCalendarPriority,
} from '@/lib/parishCareCalendar'
import { addDaysKey, todayKey } from '@/lib/parishCareCalendar'
import { chipBase } from '@/lib/chipStyles'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaEmptyStateClassName } from '@/lib/vineaUi'

type FilterKey = 'week' | 'today' | 'followups' | 'sacraments' | 'intentions'

type Props = {
  items: ParishCareCalendarItem[]
  errorMessage?: string
  softWarnings?: string[]
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'week', label: 'This week' },
  { key: 'today', label: 'Today' },
  { key: 'followups', label: 'Follow-ups' },
  { key: 'sacraments', label: 'Sacraments' },
  { key: 'intentions', label: 'Mass intentions' },
]

function kindLabel(kind: ParishCareCalendarKind): string {
  if (kind === 'follow_up') return 'Follow-up'
  if (kind === 'mass_intention') return 'Mass intention'
  if (kind === 'ocia') return 'OCIA'
  return kind.charAt(0).toUpperCase() + kind.slice(1)
}

function kindTone(kind: ParishCareCalendarKind): string {
  if (kind === 'follow_up') return 'border-rose-200 bg-rose-50 text-rose-950'
  if (kind === 'mass_intention') return 'border-violet-200 bg-violet-50 text-violet-950'
  if (kind === 'funeral') return 'border-slate-300 bg-slate-50 text-slate-950'
  if (kind === 'wedding') return 'border-pink-200 bg-pink-50 text-pink-950'
  if (kind === 'ocia') return 'border-sky-200 bg-sky-50 text-sky-950'
  return 'border-emerald-200 bg-emerald-50 text-emerald-950'
}

function priorityTone(priority: ParishCareCalendarPriority): string {
  if (priority === 'urgent') return 'text-rose-700'
  if (priority === 'today') return 'text-amber-700'
  return 'text-gray-500'
}

function formatDayHeading(key: string): string {
  const [year, month, day] = key.split('-').map(Number)
  const date = new Date(year, month - 1, day, 12, 0, 0, 0)
  if (Number.isNaN(date.getTime())) return key
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function filterItems(items: ParishCareCalendarItem[], filter: FilterKey): ParishCareCalendarItem[] {
  const today = todayKey()
  const end = addDaysKey(today, 6)
  return items.filter((item) => {
    if (filter === 'today') return item.date <= today
    if (filter === 'followups') return item.kind === 'follow_up'
    if (filter === 'intentions') return item.kind === 'mass_intention'
    if (filter === 'sacraments') {
      return ['baptism', 'funeral', 'wedding', 'ocia'].includes(item.kind)
    }
    return item.date <= end
  })
}

function groupItems(items: ParishCareCalendarItem[]): { key: string; label: string; items: ParishCareCalendarItem[] }[] {
  const today = todayKey()
  const groups = new Map<string, ParishCareCalendarItem[]>()
  for (const item of items) {
    const key = item.date < today ? 'overdue' : item.date
    groups.set(key, [...(groups.get(key) ?? []), item])
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => {
      if (a === 'overdue') return -1
      if (b === 'overdue') return 1
      return a.localeCompare(b)
    })
    .map(([key, rows]) => ({
      key,
      label: key === 'overdue' ? 'Overdue' : formatDayHeading(key),
      items: rows,
    }))
}

export function DashboardCalendarPageClient({
  items,
  errorMessage = '',
  softWarnings = [],
}: Props) {
  const [filter, setFilter] = useState<FilterKey>('week')
  const visibleItems = useMemo(() => filterItems(items, filter), [items, filter])
  const groups = useMemo(() => groupItems(visibleItems), [visibleItems])

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Parish care calendar
          </p>
          <h1 className={`${sectionHeadingClassName} mt-1`}>
            This week&apos;s pastoral work
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
            Follow-ups, funerals, weddings, baptisms, OCIA milestones, and Mass intentions in
            one calm operating view.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
        >
          Back to dashboard
        </Link>
      </div>

      {errorMessage ? (
        <div className={vineaEmptyStateClassName} role="alert">
          <p className="text-base font-semibold text-gray-900">Calendar unavailable</p>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
            {errorMessage}
          </p>
        </div>
      ) : (
        <>
          {softWarnings.length > 0 ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
              {softWarnings.join(' ')}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2" aria-label="Calendar filters">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                  filter === item.key
                    ? 'border-brand bg-brand text-white'
                    : 'border-gray-200 bg-white text-gray-800 hover:border-brand/40'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {groups.length === 0 ? (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-5 text-sm leading-relaxed text-emerald-950">
              <p className="font-semibold">Nothing is scheduled in this view.</p>
              <p className="mt-1">Try another filter or add follow-up dates to active requests.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {groups.map((group) => (
                <section key={group.key} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <h2 className="text-base font-bold text-gray-950">{group.label}</h2>
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {group.items.length} item{group.items.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2">
                    {group.items.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 transition hover:border-brand/30 hover:bg-brand-muted/30"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`${chipBase} border text-[10px] uppercase ${kindTone(item.kind)}`}>
                                {kindLabel(item.kind)}
                              </span>
                              <span className={`text-xs font-semibold uppercase tracking-wide ${priorityTone(item.priority)}`}>
                                {item.actionLabel}
                              </span>
                            </div>
                            <p className="mt-2 font-bold leading-snug text-gray-950">{item.title}</p>
                            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-600">
                              {item.subtitle}
                            </p>
                          </div>
                          <div className="grid shrink-0 gap-1 text-sm text-gray-600 sm:min-w-44">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="h-4 w-4" aria-hidden />
                              {item.timeLabel}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <UserRound className="h-4 w-4" aria-hidden />
                              {item.ownerLabel}
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                              {item.statusLabel}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
