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
    { key: 'in_progress', label: 'In Progress', count: inProgressCount, color: 'bg-amber-50 text-amber-950' },
    { key: 'scheduled', label: 'Scheduled', count: scheduledCount, color: 'bg-green-50 text-green-950' },
    { key: 'needs_contact', label: 'Needs Contact', count: needsContactCount, color: 'bg-red-50 text-red-950' },
    { key: 'no_confirmed', label: 'Missing confirmed schedule', count: missingConfirmedCount, color: 'bg-orange-50 text-orange-950' },
    { key: 'checklist', label: 'Checklist Incomplete', count: checklistIncompleteCount, color: 'bg-amber-50 text-amber-950' },
  ]

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <div
            key={c.key}
            className="min-w-0 border border-gray-200 rounded-lg p-3 bg-white shadow-sm"
          >
            <div className="text-sm font-medium text-gray-900 mb-2 leading-snug break-words">
              {c.label}
            </div>
            <div className={`text-2xl font-bold ${c.color}`}>{loading ? '—' : c.count}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
