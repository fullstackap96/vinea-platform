'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  createPersonFromRequestParishioner,
  linkRequestToExistingPerson,
} from '@/app/dashboard/requests/actions'
import { WorkflowSectionCard } from './WorkflowSectionCard'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { personDetailHref } from '@/lib/dashboardEntityNavigation'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import { requestDetailClientServerActionErrorMessage } from '@/lib/requestDetailClientMessages'

type LinkedPerson = {
  id: string
  displayName: string
}

type RelationshipSuggestionResponse =
  | {
      ok: true
      linkedPerson: LinkedPerson | null
      existingForParishioner: LinkedPerson | null
    }
  | { ok: false; error: string }

type Props = {
  requestId: string
  personId: string | null | undefined
  parishionerId: string | null | undefined
  requestParishId: string | null | undefined
  onLinked: () => void | Promise<void>
}

export function RequestPersonLinkSection({
  requestId,
  personId,
  parishionerId,
  requestParishId,
  onLinked,
}: Props) {
  const [linkedPerson, setLinkedPerson] = useState<LinkedPerson | null>(null)
  const [existingForParishioner, setExistingForParishioner] = useState<LinkedPerson | null>(
    null
  )
  const [busy, setBusy] = useState(false)
  const actionInFlightRef = useRef(false)
  const [message, setMessage] = useState('')
  const [lookupStatus, setLookupStatus] = useState<'loading' | 'ready' | 'unavailable'>(
    'loading'
  )

  const resolvedPersonId = personId != null ? String(personId).trim() : ''
  const resolvedParishionerId =
    parishionerId != null ? String(parishionerId).trim() : ''
  const resolvedRequestParishId =
    requestParishId != null ? String(requestParishId).trim() : ''

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function loadPersonLinks() {
      setLookupStatus('loading')

      if (!resolvedRequestParishId) {
        if (!cancelled) {
          setLinkedPerson(null)
          setExistingForParishioner(null)
          setLookupStatus('ready')
        }
        return
      }

      try {
        const response = await fetch(`/api/requests/${requestId}/relationship-suggestions`, {
          credentials: 'include',
          signal: controller.signal,
        })
        const payload = (await response.json().catch(() => null)) as
          | RelationshipSuggestionResponse
          | null

        if (cancelled || controller.signal.aborted) return

        if (!response.ok || !payload?.ok) {
          setLinkedPerson(null)
          setExistingForParishioner(null)
          setLookupStatus('unavailable')
          return
        }

        setLinkedPerson(payload.linkedPerson)
        setExistingForParishioner(payload.existingForParishioner)
        setLookupStatus('ready')
      } catch {
        if (cancelled || controller.signal.aborted) return
        setLinkedPerson(null)
        setExistingForParishioner(null)
        setLookupStatus('unavailable')
      }
    }

    void loadPersonLinks()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [requestId, resolvedPersonId, resolvedParishionerId, resolvedRequestParishId])

  async function handleLinkExisting() {
    if (actionInFlightRef.current || lookupStatus !== 'ready') return

    actionInFlightRef.current = true
    setBusy(true)
    setMessage('')
    try {
      const result = await linkRequestToExistingPerson(requestId)
      if (!result.ok) {
        setMessage(requestDetailClientServerActionErrorMessage('linkExistingPerson', result.error))
        return
      }

      setMessage('Linked to existing person profile.')
      try {
        await onLinked()
      } catch {
        setMessage(
          'Person profile was linked, but the refreshed request could not load. Refresh this page before trying another action.'
        )
      }
    } catch (error: unknown) {
      setMessage(requestDetailClientServerActionErrorMessage('linkExistingPerson', error))
    } finally {
      actionInFlightRef.current = false
      setBusy(false)
    }
  }

  async function handleCreatePerson() {
    if (actionInFlightRef.current || lookupStatus !== 'ready') return

    actionInFlightRef.current = true
    setBusy(true)
    setMessage('')
    try {
      const result = await createPersonFromRequestParishioner(requestId)
      if (!result.ok) {
        setMessage(requestDetailClientServerActionErrorMessage('createPersonProfile', result.error))
        return
      }

      setMessage('Person profile created and linked.')
      try {
        await onLinked()
      } catch {
        setMessage(
          'Person profile was created and linked, but the refreshed request could not load. Refresh this page before trying another action.'
        )
      }
    } catch (error: unknown) {
      setMessage(requestDetailClientServerActionErrorMessage('createPersonProfile', error))
    } finally {
      actionInFlightRef.current = false
      setBusy(false)
    }
  }

  return (
    <WorkflowSectionCard
      id="people-directory"
      title="People directory"
      description="Connect this request to a parishioner profile in your People directory."
    >
      {lookupStatus === 'loading' ? (
        <p className="text-sm text-gray-600" role="status" aria-live="polite">
          Checking the People directory...
        </p>
      ) : lookupStatus === 'unavailable' ? (
        <div
          role="alert"
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-relaxed text-amber-950"
        >
          People directory status could not be checked. Refresh this request before linking or
          creating a profile.
        </div>
      ) : resolvedPersonId && linkedPerson ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Linked person:</span>{' '}
            {linkedPerson.displayName}
          </p>
          <Link
            href={personDetailHref(linkedPerson.id)}
            className="inline-block text-sm font-medium text-blue-800 underline underline-offset-2 hover:text-blue-950"
          >
            View profile
          </Link>
        </div>
      ) : !resolvedParishionerId ? (
        <p className="text-sm text-gray-700">No intake contact on file for this request.</p>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            No person profile is linked to this request yet.
          </p>
          {existingForParishioner ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                A profile already exists for this intake contact:{' '}
                <span className="font-medium text-gray-900">
                  {existingForParishioner.displayName}
                </span>
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleLinkExisting()}
                className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
              >
                {busy ? 'Linking...' : 'Link existing person'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-gray-600">
                Create a People directory profile using this intake contact.
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleCreatePerson()}
                className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
              >
                {busy ? 'Creating...' : 'Create person profile'}
              </button>
            </div>
          )}
        </div>
      )}

      {message ? <InlineFormMessage message={message} /> : null}
    </WorkflowSectionCard>
  )
}
