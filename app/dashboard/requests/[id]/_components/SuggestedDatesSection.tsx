import React from 'react'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import { sectionHeadingClassName } from '@/lib/sectionHeader'

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
  return (
    <div>
      <h2 className={sectionHeadingClassName}>Suggested Dates</h2>

      <div className="space-y-3">
        <input
          className="w-full border p-3 rounded"
          type="datetime-local"
          placeholder="Suggested date/time 1"
          value={suggested1}
          onChange={(e) => setSuggested1(e.target.value)}
        />

        <input
          className="w-full border p-3 rounded"
          type="datetime-local"
          placeholder="Suggested date/time 2"
          value={suggested2}
          onChange={(e) => setSuggested2(e.target.value)}
        />

        <input
          className="w-full border p-3 rounded"
          type="datetime-local"
          placeholder="Suggested date/time 3"
          value={suggested3}
          onChange={(e) => setSuggested3(e.target.value)}
        />
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

