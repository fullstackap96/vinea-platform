import React from 'react'
import { InlineFormMessage } from '@/lib/inlineFormMessage'

function formatConfirmedLabel(confirmedIso: string | null | undefined) {
  if (!confirmedIso) return 'Not set'
  const d = new Date(String(confirmedIso))
  if (Number.isNaN(d.getTime())) return 'Not set'
  return d.toLocaleString()
}

export function ConfirmedBaptismDateSection({
  confirmedValue,
  setConfirmedValue,
  confirmedIso,
  suggested1,
  suggested2,
  suggested3,
  onSave,
  onClear,
  saving,
  message,
}: {
  confirmedValue: string
  setConfirmedValue: (value: string) => void
  confirmedIso?: string | null
  suggested1: string
  suggested2: string
  suggested3: string
  onSave: () => void
  onClear: () => void
  saving: boolean
  message: string
}) {
  const canClear = Boolean(confirmedValue || confirmedIso)

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2 text-gray-900">Confirmed Baptism Date</h2>
      <p className="text-sm text-gray-800 mb-4 [&_strong]:text-gray-900">
        <strong>Confirmed:</strong> {formatConfirmedLabel(confirmedIso)}
      </p>

      <div className="space-y-3">
        <input
          className="w-full border p-3 rounded"
          type="datetime-local"
          value={confirmedValue}
          onChange={(e) => setConfirmedValue(e.target.value)}
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex w-full items-center justify-center bg-black text-white px-4 py-2 rounded sm:w-auto"
          >
            {saving ? 'Saving...' : 'Save Confirmed Date'}
          </button>

          <button
            type="button"
            onClick={onClear}
            disabled={saving || !canClear}
            className="inline-flex w-full items-center justify-center border px-4 py-2 rounded sm:w-auto"
          >
            Clear
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            className="inline-flex w-full items-center justify-center border px-3 py-2 rounded sm:w-auto"
            onClick={() => setConfirmedValue(suggested1)}
            disabled={!suggested1}
          >
            Use Suggested #1
          </button>
          <button
            type="button"
            className="inline-flex w-full items-center justify-center border px-3 py-2 rounded sm:w-auto"
            onClick={() => setConfirmedValue(suggested2)}
            disabled={!suggested2}
          >
            Use Suggested #2
          </button>
          <button
            type="button"
            className="inline-flex w-full items-center justify-center border px-3 py-2 rounded sm:w-auto"
            onClick={() => setConfirmedValue(suggested3)}
            disabled={!suggested3}
          >
            Use Suggested #3
          </button>
        </div>
      </div>

      <InlineFormMessage message={message} />
    </div>
  )
}

