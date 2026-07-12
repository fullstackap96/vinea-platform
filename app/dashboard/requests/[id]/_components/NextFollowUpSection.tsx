'use client'

import React, { useRef, useState } from 'react'
import { updateRequestNextFollowUpDate } from '../../actions'
import {
  formatNextFollowUpDateDisplay,
  parseFollowUpCalendarDate,
} from '@/lib/nextFollowUpDate'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import { MissingValue } from '@/lib/missingValue'
import { requestDetailClientServerActionErrorMessage } from '@/lib/requestDetailClientMessages'

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
  const inputRef = useRef<HTMLInputElement | null>(null)
  const saveInFlightRef = useRef(false)

  function releaseSave() {
    saveInFlightRef.current = false
    setSaving(false)
  }

  const currentYmd = parseFollowUpCalendarDate(nextFollowUpDate)

  function beginEdit() {
    setDraftDate(currentYmd ?? '')
    setMessage('')
    setEditing(true)
  }

  function cancelEdit() {
    if (saveInFlightRef.current) return
    setEditing(false)
    setMessage('')
  }

  async function save() {
    if (saveInFlightRef.current) return

    saveInFlightRef.current = true
    setSaving(true)
    setMessage('')
    const nextDate = inputRef.current?.value ?? draftDate

    let result: Awaited<ReturnType<typeof updateRequestNextFollowUpDate>>
    try {
      result = await updateRequestNextFollowUpDate({
        requestId,
        nextFollowUpDate: nextDate.trim() || null,
      })
    } catch (error: unknown) {
      setMessage(requestDetailClientServerActionErrorMessage('updateFollowUp', error))
      releaseSave()
      return
    }

    if (!result.ok) {
      setMessage(requestDetailClientServerActionErrorMessage('updateFollowUp', result.error))
      releaseSave()
      return
    }

    setEditing(false)
    releaseSave()
    onSaved()
  }

  async function clearDate() {
    if (saveInFlightRef.current) return

    saveInFlightRef.current = true
    setSaving(true)
    setMessage('')

    let result: Awaited<ReturnType<typeof updateRequestNextFollowUpDate>>
    try {
      result = await updateRequestNextFollowUpDate({
        requestId,
        nextFollowUpDate: null,
      })
    } catch (error: unknown) {
      setMessage(requestDetailClientServerActionErrorMessage('updateFollowUp', error))
      releaseSave()
      return
    }

    if (!result.ok) {
      setMessage(requestDetailClientServerActionErrorMessage('updateFollowUp', result.error))
      releaseSave()
      return
    }

    setDraftDate('')
    setEditing(false)
    releaseSave()
    onSaved()
  }

  return (
    <div>
      {!editing ? (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={beginEdit}
            className={`${secondaryButtonMd} w-full justify-center sm:w-auto`}
          >
            Edit follow-up date
          </button>
        </div>
      ) : null}

      {editing ? (
        <div className="space-y-3" aria-busy={saving}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800" htmlFor="next-follow-up-date">
              Follow-up date
            </label>
            <input
              ref={inputRef}
              id="next-follow-up-date"
              className="w-full rounded border p-3"
              type="date"
              value={draftDate}
              disabled={saving}
              onChange={(e) => setDraftDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
              className={`${secondaryButtonMd} w-full justify-center sm:w-auto`}
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
            <MissingValue>Not set</MissingValue>
          )}
        </p>
      )}
    </div>
  )
}
