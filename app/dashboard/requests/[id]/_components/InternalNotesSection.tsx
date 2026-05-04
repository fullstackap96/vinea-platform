'use client'

import React, { useState } from 'react'
import { addRequestNote } from '../../actions'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import { maybeMissingValue } from '@/lib/missingValue'
import { sectionSubheadingClassName } from '@/lib/sectionHeader'

function formatNoteTimestamp(iso: string | null | undefined) {
  if (!iso) return '—'
  const d = new Date(String(iso))
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

export type RequestNoteRow = {
  id: string
  body: string
  created_at: string
}

export function InternalNotesSection({
  requestId,
  notes,
  onAdded,
}: {
  requestId: string
  notes: RequestNoteRow[]
  onAdded: () => void
}) {
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleAdd() {
    setSaving(true)
    setMessage('')
    const result = await addRequestNote({ requestId, body: draft })
    setSaving(false)

    if (!result.ok) {
      setMessage(result.error)
      return
    }

    setDraft('')
    onAdded()
  }

  return (
    <div>
      <div className="space-y-3">
        <textarea
          className="w-full min-h-[120px] rounded border p-3"
          placeholder="Add an internal note…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
        />
        <button
          type="button"
          disabled={saving || !draft.trim()}
          onClick={handleAdd}
          className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
        >
          {saving ? 'Adding…' : 'Add Note'}
        </button>
        {message && <InlineFormMessage message={message} className="!mt-2" />}
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4">
        <h3 className={sectionSubheadingClassName}>Internal Notes Timeline</h3>
        {notes.length === 0 ? (
          <p className="text-sm text-gray-800">No notes yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {notes.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold text-gray-900">
                  {maybeMissingValue(formatNoteTimestamp(item.created_at))}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-gray-800">{item.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
