'use client'

import { useState } from 'react'
import { HeartHandshake } from 'lucide-react'
import { updateRequestNextFollowUpDate } from '../../actions'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import { chipBase } from '@/lib/chipStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import {
  type CareCadenceEvaluation,
  type CareCadenceLevel,
} from '@/lib/careCadence'

function levelClass(level: CareCadenceLevel): string {
  switch (level) {
    case 'urgent':
      return 'border-rose-200 bg-rose-50 text-rose-950'
    case 'high':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    case 'medium':
      return 'border-sky-200 bg-sky-50 text-sky-950'
    case 'steady':
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-950'
  }
}

function levelLabel(level: CareCadenceLevel): string {
  switch (level) {
    case 'urgent':
      return 'Urgent care'
    case 'high':
      return 'High care'
    case 'medium':
      return 'Watch'
    case 'steady':
    default:
      return 'Steady'
  }
}

export function RequestCareCadenceCard({
  cadence,
  onSaved,
}: {
  cadence: CareCadenceEvaluation | null
  onSaved: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  if (!cadence) return null

  async function acceptSuggestedDate() {
    if (!cadence) return
    setSaving(true)
    setMessage('')
    const result = await updateRequestNextFollowUpDate({
      requestId: cadence.requestId,
      nextFollowUpDate: cadence.suggestedFollowUpDate,
    })
    setSaving(false)

    if (!result.ok) {
      setMessage(result.error)
      return
    }

    setMessage(`Follow-up set for ${cadence.suggestedFollowUpLabel}.`)
    onSaved()
  }

  return (
    <section
      className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-white p-5 shadow-sm sm:p-6"
      aria-labelledby="request-care-cadence-heading"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-700 text-white"
            aria-hidden
          >
            <HeartHandshake className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="request-care-cadence-heading"
                className="text-sm font-semibold uppercase tracking-wide text-rose-900"
              >
                Care cadence
              </h2>
              <span className={`${chipBase} text-[10px] uppercase ${levelClass(cadence.level)}`}>
                {levelLabel(cadence.level)}
              </span>
            </div>
            <p className="mt-2 text-lg font-semibold leading-snug text-gray-950">
              {cadence.label}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">{cadence.reason}</p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-rose-950">
              {cadence.recommendedAction}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-violet-100 bg-white px-4 py-3 text-sm text-gray-900 lg:min-w-56">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-900">
            Suggested next follow-up
          </p>
          <p className="mt-1 text-lg font-bold text-gray-950">{cadence.suggestedFollowUpLabel}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          disabled={saving}
          onClick={acceptSuggestedDate}
          className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
        >
          {saving ? 'Saving...' : 'Use suggested follow-up'}
        </button>
        <a href="#next-follow-up" className={`${secondaryButtonMd} w-full justify-center sm:w-auto`}>
          Choose another date
        </a>
      </div>
      {message ? <InlineFormMessage message={message} /> : null}
    </section>
  )
}
