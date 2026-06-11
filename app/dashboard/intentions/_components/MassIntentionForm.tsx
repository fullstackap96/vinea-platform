'use client'

import { assignmentDisplayLabel } from '@/lib/requestAssignment'
import type { MassIntentionRow, MassIntentionWriteInput } from '@/lib/types/massIntentions'
import { vineaInputFieldClassName } from '@/lib/vineaUi'

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700'

export type MassIntentionFormValues = {
  requesterName: string
  intentionText: string
  requestedDate: string
  assignedMassDate: string
  assignedPriestName: string
  stipendReceived: boolean
  isFulfilled: boolean
  notes: string
}

export function massIntentionToFormValues(
  intention: MassIntentionRow | null | undefined
): MassIntentionFormValues {
  return {
    requesterName: intention?.requester_name ?? '',
    intentionText: intention?.intention_text ?? '',
    requestedDate: intention?.requested_date ?? '',
    assignedMassDate: intention?.assigned_mass_date ?? '',
    assignedPriestName: intention?.assigned_priest_name ?? '',
    stipendReceived: intention?.stipend_received ?? false,
    isFulfilled: intention?.is_fulfilled ?? false,
    notes: intention?.notes ?? '',
  }
}

export function formValuesToWriteInput(values: MassIntentionFormValues): MassIntentionWriteInput {
  return {
    requesterName: values.requesterName,
    intentionText: values.intentionText,
    requestedDate: values.requestedDate,
    assignedMassDate: values.assignedMassDate,
    assignedPriestName: values.assignedPriestName,
    stipendReceived: values.stipendReceived,
    isFulfilled: values.isFulfilled,
    notes: values.notes,
  }
}

export function MassIntentionForm({
  values,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  saving,
  message,
  priestOptions,
  idPrefix = 'intention',
}: {
  values: MassIntentionFormValues
  onChange: (next: MassIntentionFormValues) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel?: () => void
  submitLabel: string
  saving: boolean
  message?: string
  priestOptions: string[]
  idPrefix?: string
}) {
  function patch(partial: Partial<MassIntentionFormValues>) {
    onChange({ ...values, ...partial })
  }

  const priestSelectValue = values.assignedPriestName

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor={`${idPrefix}-requester`}>
            Requester name <span className="text-red-700">*</span>
          </label>
          <input
            id={`${idPrefix}-requester`}
            className={vineaInputFieldClassName}
            value={values.requesterName}
            onChange={(e) => patch({ requesterName: e.target.value })}
            required
            autoComplete="name"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor={`${idPrefix}-intention`}>
            Intention <span className="text-red-700">*</span>
          </label>
          <textarea
            id={`${idPrefix}-intention`}
            rows={4}
            className={vineaInputFieldClassName}
            value={values.intentionText}
            onChange={(e) => patch({ intentionText: e.target.value })}
            required
            placeholder="e.g. Repose of the soul of Helen Martinez"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-requested-date`}>
            Requested date
          </label>
          <input
            id={`${idPrefix}-requested-date`}
            type="date"
            className={vineaInputFieldClassName}
            value={values.requestedDate}
            onChange={(e) => patch({ requestedDate: e.target.value })}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-mass-date`}>
            Assigned Mass date
          </label>
          <input
            id={`${idPrefix}-mass-date`}
            type="date"
            className={vineaInputFieldClassName}
            value={values.assignedMassDate}
            onChange={(e) => patch({ assignedMassDate: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor={`${idPrefix}-priest`}>
            Assigned priest
          </label>
          {priestOptions.length > 0 ? (
            <select
              id={`${idPrefix}-priest`}
              className={vineaInputFieldClassName}
              value={priestSelectValue}
              onChange={(e) => patch({ assignedPriestName: e.target.value })}
            >
              <option value="">{assignmentDisplayLabel(null)}</option>
              {priestOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={`${idPrefix}-priest`}
              className={vineaInputFieldClassName}
              value={values.assignedPriestName}
              onChange={(e) => patch({ assignedPriestName: e.target.value })}
              placeholder="Priest name"
            />
          )}
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id={`${idPrefix}-stipend`}
            type="checkbox"
            checked={values.stipendReceived}
            onChange={(e) => patch({ stipendReceived: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label className="text-sm font-medium text-gray-800" htmlFor={`${idPrefix}-stipend`}>
            Stipend received
          </label>
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id={`${idPrefix}-fulfilled`}
            type="checkbox"
            checked={values.isFulfilled}
            onChange={(e) => patch({ isFulfilled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label className="text-sm font-medium text-gray-800" htmlFor={`${idPrefix}-fulfilled`}>
            Fulfilled (offered at Mass)
          </label>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor={`${idPrefix}-notes`}>
            Notes
          </label>
          <textarea
            id={`${idPrefix}-notes`}
            rows={3}
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
