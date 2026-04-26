import React from 'react'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import { maybeMissingValue } from '@/lib/missingValue'
import { LabelValueGrid, LabelValueRow } from './LabelValueGrid'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { InlineAmberNote } from '@/lib/InlineAmberNote'
import { isPastConfirmedIso, minNowDatetimeLocal } from '@/lib/scheduleValidation'

function formatConfirmedLabel(confirmedIso: string | null | undefined) {
  if (!confirmedIso) return 'Not set'
  const d = new Date(String(confirmedIso))
  if (Number.isNaN(d.getTime())) return 'Not set'
  return d.toLocaleString()
}

export function ConfirmedWeddingCeremonySection({
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
  const showPastNote = isPastConfirmedIso(confirmedIso)
  const min = minNowDatetimeLocal()

  return (
    <div>
      <h2 className={sectionHeadingClassName}>Confirmed wedding ceremony time</h2>
      <p className="mt-1 text-xs text-gray-500">Choose a future date and time.</p>
      <LabelValueGrid className="mb-3">
        <LabelValueRow
          label="Confirmed"
          value={maybeMissingValue(formatConfirmedLabel(confirmedIso))}
        />
      </LabelValueGrid>
      {showPastNote ? <InlineAmberNote message="This date has already passed." /> : null}

      <div className="space-y-3">
        <input
          className="w-full border p-3 rounded"
          type="datetime-local"
          min={min}
          value={confirmedValue}
          onChange={(e) => setConfirmedValue(e.target.value)}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
          >
            {saving ? 'Saving...' : 'Save confirmed time'}
          </button>

          <button
            type="button"
            onClick={onClear}
            disabled={saving || !canClear}
            className={`${secondaryButtonMd} w-full justify-center sm:w-auto`}
          >
            Clear
          </button>
        </div>
      </div>

      <InlineFormMessage message={message} />
    </div>
  )
}
