'use client'

import React, { useRef, useState } from 'react'
import { updateRequestAssignment } from '../../actions'
import { assignmentDisplayLabel } from '@/lib/requestAssignment'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import { maybeMissingValue } from '@/lib/missingValue'
import {
  requestDetailClientFailureMessage,
  requestDetailClientServerActionErrorMessage,
} from '@/lib/requestDetailClientMessages'
import { awaitRequestDetailClientMutationConfirmation } from '@/lib/requestDetailClientMutationConfirmation'
import { LabelValueGrid, LabelValueRow } from './LabelValueGrid'

const assignSelectClassName = 'w-full rounded border border-gray-300 bg-white p-3 text-gray-900'

export function AssignmentSection({
  requestId,
  assignedStaffName,
  assignedPriestName,
  assignedDeaconName,
  staffOptions,
  priestOptions,
  onSaved,
  mutationRequiresRefresh = false,
  onMutationUnconfirmed,
}: {
  requestId: string
  assignedStaffName: string | null | undefined
  assignedPriestName: string | null | undefined
  assignedDeaconName: string | null | undefined
  staffOptions: string[]
  priestOptions: string[]
  onSaved: () => Promise<unknown> | unknown
  mutationRequiresRefresh?: boolean
  onMutationUnconfirmed?: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draftStaff, setDraftStaff] = useState('')
  const [draftPriest, setDraftPriest] = useState('')
  const [draftDeacon, setDraftDeacon] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const saveInFlightRef = useRef(false)
  const mutationBusy = saving || mutationRequiresRefresh

  function releaseSave() {
    saveInFlightRef.current = false
    setSaving(false)
  }

  function renderAssigneeDotLabel(value: unknown) {
    const label = assignmentDisplayLabel(value)
    const isUnassigned = String(label).trim().toLowerCase() === 'unassigned'
    if (!isUnassigned) return maybeMissingValue(label)
    return (
      <span className="inline-flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-orange-400" aria-hidden />
        <span>{label}</span>
      </span>
    )
  }

  function beginEdit() {
    if (mutationRequiresRefresh) return
    setDraftStaff(String(assignedStaffName ?? '').trim())
    setDraftPriest(String(assignedPriestName ?? '').trim())
    setDraftDeacon(String(assignedDeaconName ?? '').trim())
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

    let result: Awaited<ReturnType<typeof updateRequestAssignment>>
    try {
      const confirmation = await awaitRequestDetailClientMutationConfirmation(
        updateRequestAssignment({
          requestId,
          assignedStaffName: draftStaff,
          assignedPriestName: draftPriest,
          assignedDeaconName: draftDeacon,
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
      setMessage(requestDetailClientServerActionErrorMessage('updateAssignment', result.error))
      releaseSave()
      return
    }

    try {
      const refreshed = await onSaved()
      if (refreshed === false) {
        onMutationUnconfirmed?.()
        setMessage(
          'Assignment updated, but the refreshed request could not load. Refresh the page before changing assignment again.',
        )
        releaseSave()
        return
      }
    } catch {
      onMutationUnconfirmed?.()
      setMessage(
        'Assignment updated, but the refreshed request could not load. Refresh the page before changing assignment again.',
      )
      releaseSave()
      return
    }

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
            Edit assignment
          </button>
        </div>
      ) : null}

      {editing ? (
        <div className="space-y-3" aria-busy={mutationBusy}>
          <div>
            <label className="mb-1 block text-sm text-gray-500" htmlFor="assign-staff">
              Assigned to
            </label>
            <select
              id="assign-staff"
              className={assignSelectClassName}
              value={draftStaff}
              disabled={mutationBusy}
              onChange={(e) => setDraftStaff(e.target.value)}
            >
              <option value="">Unassigned</option>
              {staffOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-500" htmlFor="assign-priest">
              Assigned priest
            </label>
            <select
              id="assign-priest"
              className={assignSelectClassName}
              value={draftPriest}
              disabled={mutationBusy}
              onChange={(e) => setDraftPriest(e.target.value)}
            >
              <option value="">Unassigned</option>
              {priestOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-500" htmlFor="assign-deacon">
              Assigned deacon
            </label>
            <input
              id="assign-deacon"
              className="w-full rounded border p-3"
              type="text"
              autoComplete="name"
              value={draftDeacon}
              disabled={mutationBusy}
              onChange={(e) => setDraftDeacon(e.target.value)}
              placeholder="Enter name or leave blank"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={mutationBusy}
              onClick={save}
              className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
            >
              {saving ? 'Saving…' : 'Save assignment'}
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
        <LabelValueGrid>
          <LabelValueRow
            label="Assigned to"
            value={renderAssigneeDotLabel(assignedStaffName)}
          />
          <LabelValueRow
            label="Assigned priest"
            value={renderAssigneeDotLabel(assignedPriestName)}
          />
          <LabelValueRow
            label="Assigned deacon"
            value={renderAssigneeDotLabel(assignedDeaconName)}
          />
        </LabelValueGrid>
      )}
    </div>
  )
}
