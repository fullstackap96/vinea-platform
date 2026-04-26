import React from 'react'
import { primaryButtonMd, secondaryButtonMd, secondaryButtonSm } from '@/lib/buttonStyles'
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
  const showPastNote = isPastConfirmedIso(confirmedIso)
  const min = minNowDatetimeLocal()

  return (
    <div>
      <h2 className={sectionHeadingClassName}>Confirmed Baptism Date</h2>
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
            {saving ? 'Saving...' : 'Save Confirmed Date'}
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

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            className={`${secondaryButtonSm} w-full justify-center sm:w-auto`}
            onClick={() => setConfirmedValue(suggested1)}
            disabled={!suggested1}
          >
            Use Suggested #1
          </button>
          <button
            type="button"
            className={`${secondaryButtonSm} w-full justify-center sm:w-auto`}
            onClick={() => setConfirmedValue(suggested2)}
            disabled={!suggested2}
          >
            Use Suggested #2
          </button>
          <button
            type="button"
            className={`${secondaryButtonSm} w-full justify-center sm:w-auto`}
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

