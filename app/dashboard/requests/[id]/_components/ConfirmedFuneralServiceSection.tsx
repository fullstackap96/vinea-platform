import React from 'react'
import { InlineFormMessage } from '@/lib/inlineFormMessage'

function formatConfirmedLabel(confirmedIso: string | null | undefined) {
  if (!confirmedIso) return 'Not set'
  const d = new Date(String(confirmedIso))
  if (Number.isNaN(d.getTime())) return 'Not set'
  return d.toLocaleString()
}

export function ConfirmedFuneralServiceSection({
  confirmedValue,
  setConfirmedValue,
  confirmedIso,
  onSave,
  onClear,
  saving,
  message,
}: {
  confirmedValue: string
  setConfirmedValue: (value: string) => void
  confirmedIso?: string | null
  onSave: () => void
  onClear: () => void
  saving: boolean
  message: string
}) {
  const canClear = Boolean(confirmedValue || confirmedIso)

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2 text-gray-900">Confirmed funeral service time</h2>
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
            {saving ? 'Saving...' : 'Save confirmed time'}
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
      </div>

      <InlineFormMessage message={message} />
    </div>
  )
}
