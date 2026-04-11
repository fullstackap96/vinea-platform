import React from 'react'

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
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">Internal Staff Notes</h2>

      <textarea
        value={staffNotes}
        onChange={(e) => setStaffNotes(e.target.value)}
        className="w-full border rounded p-3 min-h-[150px]"
        placeholder="Add internal notes for parish staff here..."
      />

      <button
        type="button"
        onClick={onSaveStaffNotes}
        className="mt-3 inline-flex w-full items-center justify-center bg-black text-white px-4 py-2 rounded sm:w-auto"
      >
        Save Notes
      </button>
    </div>
  )
}

