import React from 'react'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import { sectionHeadingClassName } from '@/lib/sectionHeader'

export function FuneralDetailsSection({
  deceasedName,
  setDeceasedName,
  dateOfDeath,
  setDateOfDeath,
  funeralHome,
  setFuneralHome,
  preferredServiceNotes,
  setPreferredServiceNotes,
  onSave,
  saving,
  message,
}: {
  deceasedName: string
  setDeceasedName: (v: string) => void
  dateOfDeath: string
  setDateOfDeath: (v: string) => void
  funeralHome: string
  setFuneralHome: (v: string) => void
  preferredServiceNotes: string
  setPreferredServiceNotes: (v: string) => void
  onSave: () => void
  saving: boolean
  message: string
}) {
  return (
    <div>
      <h2 className={sectionHeadingClassName}>Funeral details</h2>
      <div className="space-y-3">
        <input
          className="w-full border p-3 rounded"
          placeholder="Deceased name"
          value={deceasedName}
          onChange={(e) => setDeceasedName(e.target.value)}
          required
        />
        <label className="block text-sm text-gray-800">Date of death (optional)</label>
        <input
          className="w-full border p-3 rounded"
          type="date"
          value={dateOfDeath}
          onChange={(e) => setDateOfDeath(e.target.value)}
        />
        <input
          className="w-full border p-3 rounded"
          placeholder="Funeral home or location"
          value={funeralHome}
          onChange={(e) => setFuneralHome(e.target.value)}
        />
        <textarea
          className="w-full border p-3 rounded min-h-[80px]"
          placeholder="Preferred service notes (dates, times, wishes)"
          value={preferredServiceNotes}
          onChange={(e) => setPreferredServiceNotes(e.target.value)}
        />
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !deceasedName.trim()}
          className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
        >
          {saving ? 'Saving...' : 'Save funeral details'}
        </button>
      </div>
      <InlineFormMessage message={message} />
    </div>
  )
}
