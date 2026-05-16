import React from 'react'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import { maybeMissingValue, MissingValue } from '@/lib/missingValue'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { LabelValueGrid, LabelValueRow } from './LabelValueGrid'

export type CommunicationMethod =
  | 'email'
  | 'phone'
  | 'text'
  | 'in_person'
  | 'voicemail'
  | 'other'

export type CommunicationHistoryItem = {
  id: string
  contacted_at: string
  method: string
  notes: string | null
  created_at?: string
}

function formatWhenLabel(iso: string | null | undefined) {
  if (!iso) return 'Not set'
  const d = new Date(String(iso))
  if (Number.isNaN(d.getTime())) return 'Not set'
  return d.toLocaleString()
}

type SummaryProps = {
  lastContactedAtIso?: string | null
  lastContactMethod?: string | null
  communicationNotes?: string | null
}

export function CommunicationContactSummary({
  lastContactedAtIso,
  lastContactMethod,
  communicationNotes,
}: SummaryProps) {
  return (
    <LabelValueGrid>
      <LabelValueRow
        label="Last contacted"
        value={
          lastContactMethod ? (
            <>
              {maybeMissingValue(formatWhenLabel(lastContactedAtIso))} ({lastContactMethod})
            </>
          ) : (
            maybeMissingValue(formatWhenLabel(lastContactedAtIso))
          )
        }
      />
      <LabelValueRow
        label="Latest summary on file"
        value={maybeMissingValue(communicationNotes || '—')}
      />
    </LabelValueGrid>
  )
}

type LogProps = SummaryProps & {
  method: CommunicationMethod
  setMethod: (value: CommunicationMethod) => void
  contactedAtValue: string
  setContactedAtValue: (value: string) => void
  notes: string
  setNotes: (value: string) => void
  onLog: () => void
  saving: boolean
  message: string
}

export function CommunicationLogForm({
  method,
  setMethod,
  contactedAtValue,
  setContactedAtValue,
  notes,
  setNotes,
  onLog,
  saving,
  message,
}: Omit<LogProps, keyof SummaryProps>) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
        <select
          className="w-full min-w-0 rounded border border-gray-200 p-3 sm:w-auto sm:min-w-[10rem]"
          value={method}
          onChange={(e) => setMethod(e.target.value as CommunicationMethod)}
        >
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="text">Text</option>
          <option value="in_person">In person</option>
          <option value="voicemail">Voicemail</option>
          <option value="other">Other</option>
        </select>

        <input
          className="w-full min-w-0 flex-1 rounded border border-gray-200 p-3 sm:min-w-[12rem]"
          type="datetime-local"
          value={contactedAtValue}
          onChange={(e) => setContactedAtValue(e.target.value)}
        />
      </div>

      <textarea
        className="w-full rounded border border-gray-200 p-3"
        rows={4}
        placeholder="What was discussed, or the next step for the family…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button
        type="button"
        onClick={onLog}
        disabled={saving}
        className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
      >
        {saving ? 'Saving…' : 'Save communication'}
      </button>

      <InlineFormMessage message={message} className="!mt-2" />
    </div>
  )
}

export function CommunicationHistoryList({ history }: { history: CommunicationHistoryItem[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-gray-700">No touchpoints logged yet.</p>
  }

  return (
    <div className="divide-y divide-gray-200/80">
      {history.map((item) => (
        <div key={item.id} className="py-4 first:pt-0 last:pb-0">
          <p className="text-gray-800">
            <strong className="text-gray-900">
              {maybeMissingValue(formatWhenLabel(item.contacted_at))}
            </strong>{' '}
            <span className="text-sm text-gray-600">({item.method})</span>
          </p>
          {item.notes ? (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
              {item.notes}
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              <MissingValue>—</MissingValue>
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

/** Full communication block (log + history); prefer Communication Hub subsections on the detail page. */
export function CommunicationSection({
  lastContactedAtIso,
  lastContactMethod,
  communicationNotes,
  method,
  setMethod,
  contactedAtValue,
  setContactedAtValue,
  notes,
  setNotes,
  onLog,
  saving,
  message,
  history,
}: LogProps & { history: CommunicationHistoryItem[] }) {
  return (
    <div className="space-y-6">
      <CommunicationContactSummary
        lastContactedAtIso={lastContactedAtIso}
        lastContactMethod={lastContactMethod}
        communicationNotes={communicationNotes}
      />
      <CommunicationLogForm
        method={method}
        setMethod={setMethod}
        contactedAtValue={contactedAtValue}
        setContactedAtValue={setContactedAtValue}
        notes={notes}
        setNotes={setNotes}
        onLog={onLog}
        saving={saving}
        message={message}
      />
      <CommunicationHistoryList history={history} />
    </div>
  )
}
