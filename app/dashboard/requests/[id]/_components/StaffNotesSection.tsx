import React from 'react'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { sectionHeadingClassName } from '@/lib/sectionHeader'

export function StaffNotesSection({
  staffNotes,
  setStaffNotes,
  onSaveStaffNotes,
}: {
  staffNotes: string
  setStaffNotes: (value: string) => void
  onSaveStaffNotes: () => void
}) {
  return (
    <div>
      <h2 className={sectionHeadingClassName}>Internal Staff Notes</h2>

      <textarea
        value={staffNotes}
        onChange={(e) => setStaffNotes(e.target.value)}
        className="w-full border rounded p-3 min-h-[150px]"
        placeholder="Add internal notes for parish staff here..."
      />

      <button
        type="button"
        onClick={onSaveStaffNotes}
        className={`${primaryButtonMd} mt-3 w-full justify-center sm:w-auto`}
      >
        Save Notes
      </button>
    </div>
  )
}

