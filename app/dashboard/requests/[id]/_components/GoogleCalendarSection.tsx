import React from 'react'
import { InlineFormMessage } from '@/lib/inlineFormMessage'

export function GoogleCalendarSection({
  confirmedIso,
  eventId,
  eventLink,
  unconfirmedHint,
  onCreate,
  onUpdate,
  onDelete,
  creating,
  updating,
  deleting,
  message,
}: {
  confirmedIso?: string | null
  eventId?: string | null
  eventLink?: string | null
  unconfirmedHint?: string
  onCreate: () => void
  onUpdate: () => void
  onDelete: () => void
  creating: boolean
  updating: boolean
  deleting: boolean
  message: string
}) {
  const hasConfirmed = Boolean(confirmedIso)
  const synced = Boolean(eventId)
  const busy = creating || updating || deleting

  const createDisabled = busy || !hasConfirmed || synced
  const updateDisabled = busy || !hasConfirmed || !synced
  const deleteDisabled = busy || !synced

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">Google Calendar</h2>

      <div className="border rounded p-4 space-y-3">
        <p className="text-sm font-medium text-gray-900">
          {synced ? 'Google Calendar Synced' : 'No Calendar Event Created'}
        </p>

        {!hasConfirmed && (
          <p className="text-sm text-gray-800">
            {unconfirmedHint ||
              'Set a confirmed baptism date first to create or update a calendar event.'}
          </p>
        )}

        {synced && (
          <div className="text-sm text-gray-800">
            {eventLink ? (
              <p>
                <a
                  className="underline text-gray-900"
                  href={eventLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Google Calendar event
                </a>
              </p>
            ) : (
              <p className="text-gray-800">(No event link saved.)</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={onCreate}
            disabled={createDisabled}
            className="inline-flex w-full items-center justify-center bg-black text-white px-4 py-2 rounded disabled:opacity-50 sm:w-auto"
          >
            {creating ? 'Creating...' : 'Create Google Calendar Event'}
          </button>

          {synced && (
            <>
              <button
                type="button"
                onClick={onUpdate}
                disabled={updateDisabled}
                className="inline-flex w-full items-center justify-center bg-black text-white px-4 py-2 rounded disabled:opacity-50 sm:w-auto"
              >
                {updating ? 'Updating...' : 'Update Calendar Event'}
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={deleteDisabled}
                className="inline-flex w-full items-center justify-center border border-red-700 text-red-800 px-4 py-2 rounded disabled:opacity-50 sm:w-auto"
              >
                {deleting ? 'Deleting...' : 'Delete Calendar Event'}
              </button>
            </>
          )}
        </div>

        <InlineFormMessage message={message} className="!mt-0" />
      </div>
    </div>
  )
}
