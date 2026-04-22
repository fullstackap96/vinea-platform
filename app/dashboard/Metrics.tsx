"use client"

import React from 'react'
import {
  hasConfirmedSchedule,
  isMissingConfirmedSchedule,
} from '@/lib/requestConfirmedSchedule'
import { dashboardCardHoverPolish } from '@/lib/cardStyles'
import { sectionHeadingClassName } from '@/lib/sectionHeader'

type Props = {
  requests: any[]
  loading?: boolean
}

function toTime(value: any) {
  if (!value) return null
  const d = new Date(String(value))
  const t = d.getTime()
  return Number.isNaN(t) ? null : t
}

type MetricCard = {
  key: string
  label: string
  count: number
  /** Very light card tint + border */
  tint: string
  /** Count color */
  num: string
}

export default function Metrics({ requests = [], loading = false }: Props) {
  const now = Date.now()
  const weekMs = 7 * 24 * 60 * 60 * 1000

  const newCount = requests.filter((r) => r.status === 'new').length
  const inProgressCount = requests.filter((r) => r.status === 'in_progress').length
  const waitingOnFamilyCount = requests.filter(
    (r) => r.status === 'waiting_on_family'
  ).length
  const scheduledCount = requests.filter((r) => hasConfirmedSchedule(r)).length
  const missingConfirmedCount = requests.filter((r) =>
    isMissingConfirmedSchedule(r)
  ).length
  const checklistIncompleteCount = requests.filter((r) =>
    Boolean(r.checklist_incomplete)
  ).length
  const needsContactCount = requests.filter((r) => {
    const last = toTime(r.last_contacted_at)
    return last === null || now - last >= weekMs
  }).length

  const cards: MetricCard[] = [
    {
      key: 'new',
      label: 'New Requests',
      count: newCount,
      tint: 'border-sky-100/90 bg-sky-50/55',
      num: 'text-sky-950',
    },
    {
      key: 'in_progress',
      label: 'In Progress',
      count: inProgressCount,
      tint: 'border-amber-100/90 bg-amber-50/50',
      num: 'text-amber-950',
    },
    {
      key: 'waiting_on_family',
      label: 'Waiting on Family',
      count: waitingOnFamilyCount,
      tint: 'border-violet-100/90 bg-violet-50/45',
      num: 'text-violet-950',
    },
    {
      key: 'scheduled',
      label: 'Scheduled',
      count: scheduledCount,
      tint: 'border-emerald-100/90 bg-emerald-50/50',
      num: 'text-emerald-950',
    },
    {
      key: 'needs_contact',
      label: 'Needs Contact',
      count: needsContactCount,
      tint: 'border-rose-100/90 bg-rose-50/45',
      num: 'text-rose-950',
    },
    {
      key: 'no_confirmed',
      label: 'Missing confirmed schedule',
      count: missingConfirmedCount,
      tint: 'border-orange-100/90 bg-orange-50/45',
      num: 'text-orange-950',
    },
    {
      key: 'checklist',
      label: 'Checklist Incomplete',
      count: checklistIncompleteCount,
      tint: 'border-amber-100/80 bg-amber-50/40',
      num: 'text-amber-950',
    },
  ]

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
      <h2 className={sectionHeadingClassName}>Summary</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 items-stretch">
        {cards.map((c) => (
          <div
            key={c.key}
            className={`flex min-h-0 min-w-0 flex-col justify-between gap-1.5 rounded-lg border p-4 shadow-sm ${dashboardCardHoverPolish} ${c.tint}`}
          >
            <div className="min-h-0 flex-1 text-xs font-medium leading-snug text-gray-500 break-words">
              {c.label}
            </div>
            <div className={`shrink-0 text-2xl font-bold tabular-nums ${c.num}`}>
              {loading ? '—' : c.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
