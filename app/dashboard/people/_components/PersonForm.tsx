'use client'

import { vineaInputFieldClassName } from '@/lib/vineaUi'
import type { PersonRow, PersonWriteInput } from '@/lib/types/people'

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700'

export type PersonFormValues = {
  firstName: string
  middleName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  notes: string
}

export function personToFormValues(person: PersonRow | null | undefined): PersonFormValues {
  return {
    firstName: person?.first_name ?? '',
    middleName: person?.middle_name ?? '',
    lastName: person?.last_name ?? '',
    email: person?.email ?? '',
    phone: person?.phone ?? '',
    dateOfBirth: person?.date_of_birth ?? '',
    notes: person?.notes ?? '',
  }
}

export function formValuesToWriteInput(values: PersonFormValues): PersonWriteInput {
  return {
    firstName: values.firstName,
    middleName: values.middleName,
    lastName: values.lastName,
    email: values.email,
    phone: values.phone,
    dateOfBirth: values.dateOfBirth,
    notes: values.notes,
  }
}

export function PersonForm({
  values,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  saving,
  message,
  idPrefix = 'person',
}: {
  values: PersonFormValues
  onChange: (next: PersonFormValues) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel?: () => void
  submitLabel: string
  saving: boolean
  message?: string
  idPrefix?: string
}) {
  function patch(partial: Partial<PersonFormValues>) {
    onChange({ ...values, ...partial })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-first-name`}>
            First name <span className="text-red-700">*</span>
          </label>
          <input
            id={`${idPrefix}-first-name`}
            className={vineaInputFieldClassName}
            value={values.firstName}
            onChange={(e) => patch({ firstName: e.target.value })}
            required
            autoComplete="given-name"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-middle-name`}>
            Middle name
          </label>
          <input
            id={`${idPrefix}-middle-name`}
            className={vineaInputFieldClassName}
            value={values.middleName}
            onChange={(e) => patch({ middleName: e.target.value })}
            autoComplete="additional-name"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor={`${idPrefix}-last-name`}>
            Last name <span className="text-red-700">*</span>
          </label>
          <input
            id={`${idPrefix}-last-name`}
            className={vineaInputFieldClassName}
            value={values.lastName}
            onChange={(e) => patch({ lastName: e.target.value })}
            required
            autoComplete="family-name"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-email`}>
            Email
          </label>
          <input
            id={`${idPrefix}-email`}
            type="email"
            className={vineaInputFieldClassName}
            value={values.email}
            onChange={(e) => patch({ email: e.target.value })}
            autoComplete="email"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-phone`}>
            Phone
          </label>
          <input
            id={`${idPrefix}-phone`}
            type="tel"
            className={vineaInputFieldClassName}
            value={values.phone}
            onChange={(e) => patch({ phone: e.target.value })}
            autoComplete="tel"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-dob`}>
            Date of birth
          </label>
          <input
            id={`${idPrefix}-dob`}
            type="date"
            className={vineaInputFieldClassName}
            value={values.dateOfBirth}
            onChange={(e) => patch({ dateOfBirth: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
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
