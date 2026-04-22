import React from 'react'
import { Calendar } from 'lucide-react'
import { dangerButtonMd, primaryButtonMd } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import { MissingValue } from '@/lib/missingValue'
import { sectionHeadingClassName } from '@/lib/sectionHeader'

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
      <h2 className={`${sectionHeadingClassName} flex items-center gap-2`}>
        <Calendar className="h-4 w-4 shrink-0 text-brand" aria-hidden />
        Google Calendar
      </h2>

      <div className="space-y-4">
        <p className="text-sm font-medium text-gray-900">
          {synced ? (
            'Google Calendar Synced'
          ) : (
            <MissingValue>No calendar event</MissingValue>
          )}
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
              <p className="text-gray-800">
                <MissingValue>(No event link saved.)</MissingValue>
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={onCreate}
            disabled={createDisabled}
            className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
          >
            {creating ? 'Creating...' : 'Create Google Calendar Event'}
          </button>

          {synced && (
            <>
              <button
                type="button"
                onClick={onUpdate}
                disabled={updateDisabled}
                className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
              >
                {updating ? 'Updating...' : 'Update Calendar Event'}
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={deleteDisabled}
                className={`${dangerButtonMd} w-full justify-center sm:w-auto`}
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
