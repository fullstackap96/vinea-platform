"use client"

import React from 'react'
import {
  hasConfirmedSchedule,
  isMissingConfirmedSchedule,
} from '@/lib/requestConfirmedSchedule'

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

  const cards = [
    { key: 'new', label: 'New Requests', count: newCount, color: 'bg-blue-50 text-blue-950' },
    {
      key: 'in_progress',
      label: 'In Progress',
      count: inProgressCount,
      color: 'bg-amber-50 text-amber-950',
    },
    {
      key: 'waiting_on_family',
      label: 'Waiting on Family',
      count: waitingOnFamilyCount,
      color: 'bg-violet-50 text-violet-950',
    },
    { key: 'scheduled', label: 'Scheduled', count: scheduledCount, color: 'bg-green-50 text-green-950' },
    { key: 'needs_contact', label: 'Needs Contact', count: needsContactCount, color: 'bg-red-50 text-red-950' },
    { key: 'no_confirmed', label: 'Missing confirmed schedule', count: missingConfirmedCount, color: 'bg-orange-50 text-orange-950' },
    { key: 'checklist', label: 'Checklist Incomplete', count: checklistIncompleteCount, color: 'bg-amber-50 text-amber-950' },
  ]

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 items-stretch">
        {cards.map((c) => (
          <div
            key={c.key}
            className="flex h-full min-h-0 min-w-0 flex-col rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
          >
            <div className="mb-2 min-h-[2.75rem] flex-1 text-sm font-medium leading-snug text-gray-900 break-words">
              {c.label}
            </div>
            <div
              className={`shrink-0 text-2xl font-bold tabular-nums ${c.color}`}
            >
              {loading ? '—' : c.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
