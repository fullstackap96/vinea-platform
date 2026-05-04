import React from 'react'
import { primaryButtonMd } from '@/lib/buttonStyles'
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
      <textarea
        value={staffNotes}
        onChange={(e) => setStaffNotes(e.target.value)}
        className="w-full border rounded p-3 min-h-[150px]"
        placeholder="Shared staff notes for this request (saved on the request record)…"
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

