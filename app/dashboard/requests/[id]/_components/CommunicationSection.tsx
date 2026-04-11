import React from 'react'
import { InlineFormMessage } from '@/lib/inlineFormMessage'

export type CommunicationMethod =
  | 'email'
  | 'phone'
  | 'text'
  | 'in_person'
  | 'voicemail'
  | 'other'

function formatWhenLabel(iso: string | null | undefined) {
  if (!iso) return 'Not set'
  const d = new Date(String(iso))
  if (Number.isNaN(d.getTime())) return 'Not set'
  return d.toLocaleString()
}

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
}: {
  lastContactedAtIso?: string | null
  lastContactMethod?: string | null
  communicationNotes?: string | null
  method: CommunicationMethod
  setMethod: (value: CommunicationMethod) => void
  contactedAtValue: string
  setContactedAtValue: (value: string) => void
  notes: string
  setNotes: (value: string) => void
  onLog: () => void
  saving: boolean
  message: string
  history: Array<{
    id: string
    contacted_at: string
    method: string
    notes: string | null
    created_at?: string
  }>
}) {
  const lastLabel = lastContactMethod
    ? `${formatWhenLabel(lastContactedAtIso)} (${lastContactMethod})`
    : formatWhenLabel(lastContactedAtIso)

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2 text-gray-900">Communication</h2>

      <div className="border rounded p-4">
        <p className="mb-2 text-gray-800 [&_strong]:text-gray-900">
          <strong>Last contacted:</strong> {lastLabel}
        </p>
        <p className="text-sm text-gray-800 [&_strong]:text-gray-900">
          <strong>Latest notes:</strong> {communicationNotes || '—'}
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch">
            <select
              className="w-full min-w-0 border p-3 rounded sm:w-auto sm:min-w-[10rem]"
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
              className="w-full min-w-0 border p-3 rounded sm:flex-1 sm:min-w-[12rem]"
              type="datetime-local"
              value={contactedAtValue}
              onChange={(e) => setContactedAtValue(e.target.value)}
            />
          </div>

          <textarea
            className="w-full border p-3 rounded"
            rows={4}
            placeholder="What was discussed / next steps..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button
            type="button"
            onClick={onLog}
            disabled={saving}
            className="inline-flex w-full items-center justify-center bg-black text-white px-4 py-2 rounded sm:w-auto"
          >
            {saving ? 'Logging...' : 'Log communication'}
          </button>

          <InlineFormMessage message={message} className="!mt-2" />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-900">History</h3>
        {history.length === 0 ? (
          <p className="text-sm text-gray-800">No communication logged yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="border rounded p-3">
                <p className="text-gray-800">
                  <strong className="text-gray-900">{formatWhenLabel(item.contacted_at)}</strong>{' '}
                  <span className="text-sm text-gray-800">({item.method})</span>
                </p>
                {item.notes ? (
                  <p className="mt-2 whitespace-pre-wrap text-gray-800">{item.notes}</p>
                ) : (
                  <p className="mt-2 text-sm text-gray-800">—</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

