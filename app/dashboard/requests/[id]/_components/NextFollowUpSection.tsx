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
import {
  requestDetailClientFailureMessage,
  requestDetailClientServerActionErrorMessage,
} from '@/lib/requestDetailClientMessages'
import { awaitRequestDetailClientMutationConfirmation } from '@/lib/requestDetailClientMutationConfirmation'

export function NextFollowUpSection({
  requestId,
  nextFollowUpDate,
  onSaved,
  mutationRequiresRefresh = false,
  onMutationUnconfirmed,
}: {
  requestId: string
  nextFollowUpDate: string | null | undefined
  onSaved: () => Promise<unknown> | unknown
  mutationRequiresRefresh?: boolean
  onMutationUnconfirmed?: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draftDate, setDraftDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const saveInFlightRef = useRef(false)
  const mutationBusy = saving || mutationRequiresRefresh

  function releaseSave() {
    saveInFlightRef.current = false
    setSaving(false)
  }

  const currentYmd = parseFollowUpCalendarDate(nextFollowUpDate)

  function beginEdit() {
    if (mutationRequiresRefresh) return
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
    if (saveInFlightRef.current || mutationRequiresRefresh) return

    saveInFlightRef.current = true
    setSaving(true)
    setMessage('')
    const nextDate = inputRef.current?.value ?? draftDate

    let result: Awaited<ReturnType<typeof updateRequestNextFollowUpDate>>
    try {
      const confirmation = await awaitRequestDetailClientMutationConfirmation(
        updateRequestNextFollowUpDate({
          requestId,
          nextFollowUpDate: nextDate.trim() || null,
        }),
      )
      if (!confirmation.confirmed) {
        onMutationUnconfirmed?.()
        setMessage(requestDetailClientFailureMessage('confirmWorkflowMutation'))
        releaseSave()
        return
      }
      result = confirmation.value
    } catch {
      onMutationUnconfirmed?.()
      setMessage(requestDetailClientFailureMessage('confirmWorkflowMutation'))
      releaseSave()
      return
    }

    if (!result.ok) {
      setMessage(requestDetailClientServerActionErrorMessage('updateFollowUp', result.error))
      releaseSave()
      return
    }

    try {
      const refreshed = await onSaved()
      if (refreshed === false) {
        onMutationUnconfirmed?.()
        setMessage(
          'Follow-up updated, but the refreshed request could not load. Refresh the page before changing it again.',
        )
        releaseSave()
        return
      }
    } catch {
      onMutationUnconfirmed?.()
      setMessage(
        'Follow-up updated, but the refreshed request could not load. Refresh the page before changing it again.',
      )
      releaseSave()
      return
    }

    setEditing(false)
    releaseSave()
  }

  async function clearDate() {
    if (saveInFlightRef.current || mutationRequiresRefresh) return

    saveInFlightRef.current = true
    setSaving(true)
    setMessage('')

    let result: Awaited<ReturnType<typeof updateRequestNextFollowUpDate>>
    try {
      const confirmation = await awaitRequestDetailClientMutationConfirmation(
        updateRequestNextFollowUpDate({
          requestId,
          nextFollowUpDate: null,
        }),
      )
      if (!confirmation.confirmed) {
        onMutationUnconfirmed?.()
        setMessage(requestDetailClientFailureMessage('confirmWorkflowMutation'))
        releaseSave()
        return
      }
      result = confirmation.value
    } catch {
      onMutationUnconfirmed?.()
      setMessage(requestDetailClientFailureMessage('confirmWorkflowMutation'))
      releaseSave()
      return
    }

    if (!result.ok) {
      setMessage(requestDetailClientServerActionErrorMessage('updateFollowUp', result.error))
      releaseSave()
      return
    }

    try {
      const refreshed = await onSaved()
      if (refreshed === false) {
        onMutationUnconfirmed?.()
        setMessage(
          'Follow-up updated, but the refreshed request could not load. Refresh the page before changing it again.',
        )
        releaseSave()
        return
      }
    } catch {
      onMutationUnconfirmed?.()
      setMessage(
        'Follow-up updated, but the refreshed request could not load. Refresh the page before changing it again.',
      )
      releaseSave()
      return
    }

    setDraftDate('')
    setEditing(false)
    releaseSave()
  }

  return (
    <div>
      {!editing ? (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={beginEdit}
            disabled={mutationRequiresRefresh}
            className={`${secondaryButtonMd} w-full justify-center sm:w-auto`}
          >
            Edit follow-up date
          </button>
        </div>
      ) : null}

      {editing ? (
        <div className="space-y-3" aria-busy={mutationBusy}>
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
              disabled={mutationBusy}
              onChange={(e) => setDraftDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              disabled={mutationBusy}
              onClick={save}
              className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              disabled={mutationBusy || !currentYmd}
              onClick={clearDate}
              className={`${secondaryButtonMd} w-full justify-center sm:w-auto`}
            >
              Clear
            </button>
            <button
              type="button"
              disabled={mutationBusy}
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
