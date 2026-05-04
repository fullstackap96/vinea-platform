import React from 'react'
import { Calendar } from 'lucide-react'
import { dangerButtonMd, primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import { MissingValue } from '@/lib/missingValue'
import { sectionSubheadingClassName } from '@/lib/sectionHeader'

type CalendarConflict = {
  summary: string | null
  start: string | null
  end: string | null
  htmlLink: string | null
}

export function GoogleCalendarSection({
  confirmedIso,
  eventId,
  eventLink,
  unconfirmedHint,
  onCreate,
  onForceCreate,
  onUpdate,
  onDelete,
  creating,
  updating,
  deleting,
  message,
  conflicts,
}: {
  confirmedIso?: string | null
  eventId?: string | null
  eventLink?: string | null
  unconfirmedHint?: string
  onCreate: () => void
  onForceCreate: () => void
  onUpdate: () => void
  onDelete: () => void
  creating: boolean
  updating: boolean
  deleting: boolean
  message: string
  conflicts?: CalendarConflict[] | null
}) {
  const hasConfirmed = Boolean(confirmedIso)
  const synced = Boolean(eventId)
  const busy = creating || updating || deleting

  const createDisabled = busy || !hasConfirmed || synced
  const updateDisabled = busy || !hasConfirmed || !synced
  const deleteDisabled = busy || !synced

  const hasConflicts = Boolean(conflicts?.length)
  const forceCreateDisabled = busy || !hasConfirmed || synced || !hasConflicts

  const formatRange = (startIso: string | null, endIso: string | null) => {
    if (!startIso || !endIso) return null
    const s = new Date(startIso)
    const e = new Date(endIso)
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null

    const dateFmt = new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    const timeFmt = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    })

    const sameDay =
      s.getFullYear() === e.getFullYear() &&
      s.getMonth() === e.getMonth() &&
      s.getDate() === e.getDate()

    if (sameDay) {
      return `${dateFmt.format(s)}, ${timeFmt.format(s)}–${timeFmt.format(e)}`
    }

    return `${dateFmt.format(s)}, ${timeFmt.format(s)}–${dateFmt.format(e)}, ${timeFmt.format(e)}`
  }

  return (
    <div>
      <h3 className={`${sectionSubheadingClassName} flex items-center gap-2`}>
        <Calendar className="h-4 w-4 shrink-0 text-brand" aria-hidden />
        Google Calendar
      </h3>

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

          {!synced && hasConflicts ? (
            <button
              type="button"
              onClick={onForceCreate}
              disabled={forceCreateDisabled}
              className={`${secondaryButtonMd} w-full justify-center sm:w-auto`}
            >
              Create anyway
            </button>
          ) : null}

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

        {conflicts?.length ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            <p className="font-medium">
              {conflicts.length === 1 ? 'Conflict found:' : 'Conflicts found:'}
            </p>
            <ul className="mt-2 space-y-2">
              {conflicts.map((c, idx) => {
                const title = (c.summary || 'Untitled event').trim() || 'Untitled event'
                const range = formatRange(c.start, c.end)
                return (
                  <li key={`${c.htmlLink || c.start || 'conflict'}-${idx}`}>
                    <div>
                      {range ? (
                        <span>
                          <strong>{title}</strong> is scheduled from <strong>{range}</strong>.
                        </span>
                      ) : (
                        <span>
                          <strong>{title}</strong> is scheduled at the requested time.
                        </span>
                      )}
                    </div>
                    {c.htmlLink ? (
                      <div className="mt-1">
                        <a
                          className="underline text-amber-950"
                          href={c.htmlLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View existing calendar event
                        </a>
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}
