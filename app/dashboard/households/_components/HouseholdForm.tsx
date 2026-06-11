'use client'

import { HOUSEHOLD_RELATIONSHIP_OPTIONS } from '@/lib/households'
import { formatPersonDisplayName } from '@/lib/people'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import type { HouseholdMemberWithPerson, HouseholdRow, HouseholdWriteInput } from '@/lib/types/households'
import { vineaInputFieldClassName } from '@/lib/vineaUi'

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700'

export type HouseholdFormValues = {
  name: string
  address: string
  city: string
  state: string
  postalCode: string
  notes: string
}

export type HouseholdMemberFormRow = {
  memberId: string
  personId: string
  personLabel: string
  relationship: string
  isPrimaryContact: boolean
}

export type NewMemberDraft = {
  personId: string
  relationship: string
  isPrimaryContact: boolean
}

export function householdToFormValues(
  household: HouseholdRow | null | undefined
): HouseholdFormValues {
  return {
    name: household?.name ?? '',
    address: household?.address ?? '',
    city: household?.city ?? '',
    state: household?.state ?? '',
    postalCode: household?.postal_code ?? '',
    notes: household?.notes ?? '',
  }
}

export function formValuesToWriteInput(values: HouseholdFormValues): HouseholdWriteInput {
  return {
    name: values.name,
    address: values.address,
    city: values.city,
    state: values.state,
    postalCode: values.postalCode,
    notes: values.notes,
  }
}

export function membersToFormRows(members: HouseholdMemberWithPerson[]): HouseholdMemberFormRow[] {
  return members.map((member) => ({
    memberId: member.id,
    personId: member.person_id,
    personLabel: formatPersonDisplayName(member.person),
    relationship: member.relationship,
    isPrimaryContact: member.is_primary_contact,
  }))
}

export function HouseholdForm({
  values,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  saving,
  message,
  idPrefix = 'household',
  members,
  onMemberChange,
  newMember,
  onNewMemberChange,
  onAddMember,
  addingMember,
  addMemberMessage,
  peopleOptions,
}: {
  values: HouseholdFormValues
  onChange: (next: HouseholdFormValues) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel?: () => void
  submitLabel: string
  saving: boolean
  message?: string
  idPrefix?: string
  members?: HouseholdMemberFormRow[]
  onMemberChange?: (memberId: string, patch: Partial<HouseholdMemberFormRow>) => void
  newMember?: NewMemberDraft
  onNewMemberChange?: (next: NewMemberDraft) => void
  onAddMember?: () => void
  addingMember?: boolean
  addMemberMessage?: string
  peopleOptions?: { id: string; label: string }[]
}) {
  function patch(partial: Partial<HouseholdFormValues>) {
    onChange({ ...values, ...partial })
  }

  const showMembers = members != null && onMemberChange != null

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-5">
        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-name`}>
            Household name <span className="text-red-700">*</span>
          </label>
          <input
            id={`${idPrefix}-name`}
            className={vineaInputFieldClassName}
            value={values.name}
            onChange={(e) => patch({ name: e.target.value })}
            required
            placeholder="e.g. Martinez Family"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-address`}>
            Address
          </label>
          <input
            id={`${idPrefix}-address`}
            className={vineaInputFieldClassName}
            value={values.address}
            onChange={(e) => patch({ address: e.target.value })}
            autoComplete="street-address"
          />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor={`${idPrefix}-city`}>
              City
            </label>
            <input
              id={`${idPrefix}-city`}
              className={vineaInputFieldClassName}
              value={values.city}
              onChange={(e) => patch({ city: e.target.value })}
              autoComplete="address-level2"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`${idPrefix}-state`}>
              State
            </label>
            <input
              id={`${idPrefix}-state`}
              className={vineaInputFieldClassName}
              value={values.state}
              onChange={(e) => patch({ state: e.target.value })}
              autoComplete="address-level1"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`${idPrefix}-postal`}>
              Postal code
            </label>
            <input
              id={`${idPrefix}-postal`}
              className={vineaInputFieldClassName}
              value={values.postalCode}
              onChange={(e) => patch({ postalCode: e.target.value })}
              autoComplete="postal-code"
            />
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-notes`}>
            Notes
          </label>
          <textarea
            id={`${idPrefix}-notes`}
            rows={4}
            className={vineaInputFieldClassName}
            value={values.notes}
            onChange={(e) => patch({ notes: e.target.value })}
          />
        </div>
      </div>

      {showMembers ? (
        <div className="space-y-4 border-t border-gray-200 pt-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Members</h2>
            <p className="mt-1 text-sm text-gray-600">
              Set relationship and primary contact for each household member.
            </p>
          </div>

          {members.length === 0 ? (
            <p className="text-sm text-gray-700">No members yet. Add someone below.</p>
          ) : (
            <ul className="space-y-4">
              {members.map((member) => (
                <li
                  key={member.memberId}
                  className="rounded-xl border border-gray-200/90 bg-slate-50/60 p-4"
                >
                  <p className="text-sm font-semibold text-gray-900">{member.personLabel}</p>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor={`${idPrefix}-rel-${member.memberId}`}>
                        Relationship
                      </label>
                      <select
                        id={`${idPrefix}-rel-${member.memberId}`}
                        className={vineaInputFieldClassName}
                        value={member.relationship}
                        onChange={(e) =>
                          onMemberChange(member.memberId, { relationship: e.target.value })
                        }
                      >
                        {HOUSEHOLD_RELATIONSHIP_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end pb-3">
                      <label className="flex items-center gap-2 text-sm text-gray-800">
                        <input
                          type="checkbox"
                          checked={member.isPrimaryContact}
                          onChange={(e) =>
                            onMemberChange(member.memberId, {
                              isPrimaryContact: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        Primary contact
                      </label>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {newMember != null && onNewMemberChange != null && onAddMember != null ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-4">
              <p className="text-sm font-medium text-gray-900">Add member</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor={`${idPrefix}-new-person`}>
                    Person
                  </label>
                  <select
                    id={`${idPrefix}-new-person`}
                    className={vineaInputFieldClassName}
                    value={newMember.personId}
                    onChange={(e) =>
                      onNewMemberChange({ ...newMember, personId: e.target.value })
                    }
                  >
                    <option value="">Select a person…</option>
                    {(peopleOptions ?? []).map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor={`${idPrefix}-new-rel`}>
                    Relationship
                  </label>
                  <select
                    id={`${idPrefix}-new-rel`}
                    className={vineaInputFieldClassName}
                    value={newMember.relationship}
                    onChange={(e) =>
                      onNewMemberChange({ ...newMember, relationship: e.target.value })
                    }
                  >
                    {HOUSEHOLD_RELATIONSHIP_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-2 text-sm text-gray-800">
                    <input
                      type="checkbox"
                      checked={newMember.isPrimaryContact}
                      onChange={(e) =>
                        onNewMemberChange({
                          ...newMember,
                          isPrimaryContact: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Primary contact
                  </label>
                </div>
              </div>
              <button
                type="button"
                onClick={onAddMember}
                disabled={addingMember}
                className={`${primaryButtonMd} mt-4`}
              >
                {addingMember ? 'Adding…' : 'Add to household'}
              </button>
              <InlineFormMessage message={addMemberMessage ?? ''} className="!mt-2" />
            </div>
          ) : null}
        </div>
      ) : null}

      {message ? (
        <p className="text-sm text-red-800" role="alert">
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-60"
        >
          {saving ? 'Saving…' : submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}
