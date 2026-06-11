'use client'

import { useMemo, useState } from 'react'
import { formatPersonDisplayName, sanitizePeopleSearchQuery } from '@/lib/people'
import { vineaInputFieldClassName } from '@/lib/vineaUi'

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700'

export type PersonPickerOption = {
  id: string
  label: string
}

export function PersonPickerField({
  value,
  onChange,
  peopleOptions,
  disabled,
  idPrefix = 'person-picker',
}: {
  value: string | null
  onChange: (personId: string | null) => void
  peopleOptions: PersonPickerOption[]
  disabled?: boolean
  idPrefix?: string
}) {
  const [search, setSearch] = useState('')

  const filteredOptions = useMemo(() => {
    const q = sanitizePeopleSearchQuery(search).toLowerCase()
    if (!q) return peopleOptions
    return peopleOptions.filter((option) => option.label.toLowerCase().includes(q))
  }, [peopleOptions, search])

  const selectedLabel = useMemo(() => {
    if (!value) return ''
    return peopleOptions.find((o) => o.id === value)?.label ?? ''
  }, [peopleOptions, value])

  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-search`}>
          Search people
        </label>
        <input
          id={`${idPrefix}-search`}
          type="search"
          className={vineaInputFieldClassName}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name or email"
          disabled={disabled}
          autoComplete="off"
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-select`}>
          Link to person profile (optional)
        </label>
        <select
          id={`${idPrefix}-select`}
          className={vineaInputFieldClassName}
          value={value ?? ''}
          onChange={(e) => {
            const next = e.target.value.trim()
            onChange(next.length > 0 ? next : null)
          }}
          disabled={disabled}
        >
          <option value="">— None —</option>
          {filteredOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        {value && selectedLabel ? (
          <p className="mt-1.5 text-xs text-gray-600">
            Selected: <span className="font-medium text-gray-800">{selectedLabel}</span>
          </p>
        ) : (
          <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
            Register name is kept separately; linking only connects this record to a profile.
          </p>
        )}
      </div>
    </div>
  )
}

/** Build picker options from a people list query result. */
export function personRowsToPickerOptions(
  rows: Array<Record<string, unknown>>
): PersonPickerOption[] {
  return rows.map((row) => ({
    id: String(row.id),
    label: formatPersonDisplayName({
      first_name: row.first_name,
      middle_name: row.middle_name,
      last_name: row.last_name,
    }),
  }))
}
