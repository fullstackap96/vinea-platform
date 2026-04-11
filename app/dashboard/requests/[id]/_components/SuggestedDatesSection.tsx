import React from 'react'
import { InlineFormMessage } from '@/lib/inlineFormMessage'

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
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">Suggested Dates</h2>

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
        className="mt-3 inline-flex w-full items-center justify-center bg-black text-white px-4 py-2 rounded sm:w-auto"
      >
        {saving ? 'Saving...' : 'Save Suggested Dates'}
      </button>

      <InlineFormMessage message={message} />
    </div>
  )
}

