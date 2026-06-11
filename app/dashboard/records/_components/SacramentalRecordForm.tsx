'use client'

import { formatSacramentalRecordType } from '@/lib/formatSacramentalRecordType'
import { SACRAMENTAL_RECORD_TYPES } from '@/lib/sacramentalRecordConstants'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import type { SacramentalRecordRow, SacramentalRecordWriteInput } from '@/lib/types/sacramentalRecords'
import { vineaInputFieldClassName } from '@/lib/vineaUi'

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700'

export type SacramentalRecordFormValues = {
  recordType: string
  personName: string
  sacramentDate: string
  place: string
  minister: string
  book: string
  page: string
  line: string
  notes: string
}

export function sacramentalRecordToFormValues(
  record: SacramentalRecordRow | null | undefined
): SacramentalRecordFormValues {
  return {
    recordType: record?.record_type ?? 'baptism',
    personName: record?.person_name ?? '',
    sacramentDate: record?.sacrament_date ?? '',
    place: record?.place ?? '',
    minister: record?.minister ?? '',
    book: record?.book ?? '',
    page: record?.page ?? '',
    line: record?.line ?? '',
    notes: record?.notes ?? '',
  }
}

export function formValuesToWriteInput(values: SacramentalRecordFormValues): SacramentalRecordWriteInput {
  return {
    recordType: values.recordType,
    personName: values.personName,
    sacramentDate: values.sacramentDate,
    place: values.place,
    minister: values.minister,
    book: values.book,
    page: values.page,
    line: values.line,
    notes: values.notes,
  }
}

export function SacramentalRecordForm({
  values,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  saving,
  message,
  idPrefix = 'record',
}: {
  values: SacramentalRecordFormValues
  onChange: (next: SacramentalRecordFormValues) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel?: () => void
  submitLabel: string
  saving: boolean
  message?: string
  idPrefix?: string
}) {
  function patch(partial: Partial<SacramentalRecordFormValues>) {
    onChange({ ...values, ...partial })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor={`${idPrefix}-type`}>
            Record type <span className="text-red-700">*</span>
          </label>
          <select
            id={`${idPrefix}-type`}
            className={vineaInputFieldClassName}
            value={values.recordType}
            onChange={(e) => patch({ recordType: e.target.value })}
            required
          >
            {SACRAMENTAL_RECORD_TYPES.map((t) => (
              <option key={t} value={t}>
                {formatSacramentalRecordType(t)}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor={`${idPrefix}-person`}>
            Person name <span className="text-red-700">*</span>
          </label>
          <input
            id={`${idPrefix}-person`}
            type="text"
            className={vineaInputFieldClassName}
            value={values.personName}
            onChange={(e) => patch({ personName: e.target.value })}
            placeholder="Full name as it appears in the register"
            required
            autoComplete="name"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-date`}>
            Sacrament date
          </label>
          <input
            id={`${idPrefix}-date`}
            type="date"
            className={vineaInputFieldClassName}
            value={values.sacramentDate}
            onChange={(e) => patch({ sacramentDate: e.target.value })}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-minister`}>
            Minister / celebrant
          </label>
          <input
            id={`${idPrefix}-minister`}
            type="text"
            className={vineaInputFieldClassName}
            value={values.minister}
            onChange={(e) => patch({ minister: e.target.value })}
            placeholder="Priest or deacon name"
            autoComplete="off"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor={`${idPrefix}-place`}>
            Place
          </label>
          <input
            id={`${idPrefix}-place`}
            type="text"
            className={vineaInputFieldClassName}
            value={values.place}
            onChange={(e) => patch({ place: e.target.value })}
            placeholder="Church, chapel, or cemetery"
            autoComplete="off"
          />
        </div>
      </div>

      <fieldset className="rounded-xl border border-gray-200 bg-slate-50/50 p-4 sm:p-5">
        <legend className="px-1 text-sm font-semibold text-gray-800">Register reference</legend>
        <p className="mb-4 text-xs leading-relaxed text-gray-600">
          Optional book, page, and line as your parish keeps them on paper.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor={`${idPrefix}-book`}>
              Book
            </label>
            <input
              id={`${idPrefix}-book`}
              type="text"
              className={vineaInputFieldClassName}
              value={values.book}
              onChange={(e) => patch({ book: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`${idPrefix}-page`}>
              Page
            </label>
            <input
              id={`${idPrefix}-page`}
              type="text"
              className={vineaInputFieldClassName}
              value={values.page}
              onChange={(e) => patch({ page: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`${idPrefix}-line`}>
              Line
            </label>
            <input
              id={`${idPrefix}-line`}
              type="text"
              className={vineaInputFieldClassName}
              value={values.line}
              onChange={(e) => patch({ line: e.target.value })}
            />
          </div>
        </div>
      </fieldset>

      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-notes`}>
          Notes
        </label>
        <textarea
          id={`${idPrefix}-notes`}
          className={`${vineaInputFieldClassName} min-h-[6rem] resize-y`}
          value={values.notes}
          onChange={(e) => patch({ notes: e.target.value })}
          placeholder="Additional register notes for staff"
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={saving}
          className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
        >
          {saving ? 'Saving…' : submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            disabled={saving}
            onClick={onCancel}
            className={`${secondaryButtonMd} w-full justify-center sm:w-auto`}
          >
            Cancel
          </button>
        ) : null}
      </div>

      {message ? <InlineFormMessage message={message} /> : null}
    </form>
  )
}
