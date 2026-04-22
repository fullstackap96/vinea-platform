'use client'

import React, { useState } from 'react'
import { updateRequestAssignment } from '../../actions'
import { assignmentDisplayLabel } from '@/lib/requestAssignment'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import { maybeMissingValue } from '@/lib/missingValue'
import { LabelValueGrid, LabelValueRow } from './LabelValueGrid'
import {
  sectionHeadingRowClassName,
  sectionHeadingTitleClassName,
} from '@/lib/sectionHeader'

export function AssignmentSection({
  requestId,
  assignedStaffName,
  assignedPriestName,
  onSaved,
}: {
  requestId: string
  assignedStaffName: string | null | undefined
  assignedPriestName: string | null | undefined
  onSaved: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draftStaff, setDraftStaff] = useState('')
  const [draftPriest, setDraftPriest] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  function beginEdit() {
    setDraftStaff(String(assignedStaffName ?? '').trim())
    setDraftPriest(String(assignedPriestName ?? '').trim())
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
    const result = await updateRequestAssignment({
      requestId,
      assignedStaffName: draftStaff,
      assignedPriestName: draftPriest,
    })
    setSaving(false)

    if (!result.ok) {
      setMessage(result.error)
      return
    }

    setEditing(false)
    onSaved()
  }

  return (
    <div>
      <div className={sectionHeadingRowClassName}>
        <h2 className={sectionHeadingTitleClassName}>Assignment</h2>
        {!editing && (
          <button
            type="button"
            onClick={beginEdit}
            className={`${secondaryButtonMd} w-full justify-center sm:w-auto`}
          >
            Edit assignment
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-500" htmlFor="assign-staff">
              Assigned staff
            </label>
            <input
              id="assign-staff"
              className="w-full rounded border p-3"
              type="text"
              autoComplete="name"
              value={draftStaff}
              onChange={(e) => setDraftStaff(e.target.value)}
              placeholder="Name or leave blank"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-500" htmlFor="assign-priest">
              Assigned priest
            </label>
            <input
              id="assign-priest"
              className="w-full rounded border p-3"
              type="text"
              autoComplete="name"
              value={draftPriest}
              onChange={(e) => setDraftPriest(e.target.value)}
              placeholder="Name or leave blank"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
            >
              {saving ? 'Saving…' : 'Save assignment'}
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
        <LabelValueGrid>
          <LabelValueRow
            label="Assigned staff"
            value={maybeMissingValue(assignmentDisplayLabel(assignedStaffName))}
          />
          <LabelValueRow
            label="Assigned priest"
            value={maybeMissingValue(assignmentDisplayLabel(assignedPriestName))}
          />
        </LabelValueGrid>
      )}
    </div>
  )
}
