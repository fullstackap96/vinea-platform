'use client'

import React, { useState } from 'react'
import { updateRequestNextFollowUpDate } from '../../actions'
import {
  formatNextFollowUpDateDisplay,
  parseFollowUpCalendarDate,
} from '@/lib/nextFollowUpDate'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'

export function NextFollowUpSection({
  requestId,
  nextFollowUpDate,
  onSaved,
}: {
  requestId: string
  nextFollowUpDate: string | null | undefined
  onSaved: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draftDate, setDraftDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const currentYmd = parseFollowUpCalendarDate(nextFollowUpDate)

  function beginEdit() {
    setDraftDate(currentYmd ?? '')
    setMessage('')
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setMessage('')
  }

  async function save() {
    setSaving(true)
    setMessage('')
    const result = await updateRequestNextFollowUpDate({
      requestId,
      nextFollowUpDate: draftDate.trim() || null,
    })
    setSaving(false)

    if (!result.ok) {
      setMessage(result.error)
      return
    }

    setEditing(false)
    onSaved()
  }

  async function clearDate() {
    setSaving(true)
    setMessage('')
    const result = await updateRequestNextFollowUpDate({
      requestId,
      nextFollowUpDate: null,
    })
    setSaving(false)

    if (!result.ok) {
      setMessage(result.error)
      return
    }

    setDraftDate('')
    setEditing(false)
    onSaved()
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Next Follow-Up</h2>
        {!editing && (
          <button
            type="button"
            onClick={beginEdit}
            className={`${secondaryButtonMd} w-full justify-center sm:w-auto`}
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800" htmlFor="next-follow-up-date">
              Follow-up date
            </label>
            <input
              id="next-follow-up-date"
              className="w-full rounded border p-3"
              type="date"
              value={draftDate}
              onChange={(e) => setDraftDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              disabled={saving || !currentYmd}
              onClick={clearDate}
              className={`${secondaryButtonMd} w-full justify-center sm:w-auto disabled:opacity-50`}
            >
              Clear
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={cancelEdit}
              className={`${secondaryButtonMd} w-full justify-center sm:w-auto`}
            >
              Cancel
            </button>
          </div>
          {message && <InlineFormMessage message={message} />}
        </div>
      ) : (
        <p className="text-sm text-gray-800 sm:text-base">
          {currentYmd ? (
            <span className="text-gray-900">{formatNextFollowUpDateDisplay(nextFollowUpDate)}</span>
          ) : (
            <span className="text-gray-600">Not set</span>
          )}
        </p>
      )}
    </div>
  )
}
