import React from 'react'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { chipBase } from '@/lib/chipStyles'
import { isPastSuggestedDate, minTodayDatetimeLocal } from '@/lib/scheduleValidation'

export function SuggestedDatesSection({
  suggested1,
  suggested2,
  suggested3,
  setSuggested1,
  setSuggested2,
  setSuggested3,
  onSaveSuggestedDates,
  saving,
  message,
}: {
  suggested1: string
  suggested2: string
  suggested3: string
  setSuggested1: (value: string) => void
  setSuggested2: (value: string) => void
  setSuggested3: (value: string) => void
  onSaveSuggestedDates: () => void
  saving: boolean
  message: string
}) {
  const pastBadgeClass = `${chipBase} border border-amber-200 bg-amber-50 text-amber-950`
  const min = minTodayDatetimeLocal()
  return (
    <div>
      <h2 className={sectionHeadingClassName}>Suggested Dates</h2>
      <p className="mt-1 text-xs text-gray-500">Choose today or a future date.</p>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            className="w-full border p-3 rounded"
            type="datetime-local"
            min={min}
            placeholder="Suggested date/time 1"
            value={suggested1}
            onChange={(e) => setSuggested1(e.target.value)}
          />
          {isPastSuggestedDate(suggested1) ? (
            <span className={pastBadgeClass}>Past date</span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <input
            className="w-full border p-3 rounded"
            type="datetime-local"
            min={min}
            placeholder="Suggested date/time 2"
            value={suggested2}
            onChange={(e) => setSuggested2(e.target.value)}
          />
          {isPastSuggestedDate(suggested2) ? (
            <span className={pastBadgeClass}>Past date</span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <input
            className="w-full border p-3 rounded"
            type="datetime-local"
            min={min}
            placeholder="Suggested date/time 3"
            value={suggested3}
            onChange={(e) => setSuggested3(e.target.value)}
          />
          {isPastSuggestedDate(suggested3) ? (
            <span className={pastBadgeClass}>Past date</span>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={onSaveSuggestedDates}
        disabled={saving}
        className={`${primaryButtonMd} mt-3 w-full justify-center sm:w-auto`}
      >
        {saving ? 'Saving...' : 'Save Suggested Dates'}
      </button>

      <InlineFormMessage message={message} />
    </div>
  )
}

