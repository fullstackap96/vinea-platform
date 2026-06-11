'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  createPersonFromRequestParishioner,
  linkRequestToExistingPerson,
} from '@/app/dashboard/requests/actions'
import { WorkflowSectionCard } from './WorkflowSectionCard'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import { formatPersonDisplayName, parsePersonRow } from '@/lib/people'
import { supabase } from '@/lib/supabase'

type LinkedPerson = {
  id: string
  displayName: string
}

type Props = {
  requestId: string
  personId: string | null | undefined
  parishionerId: string | null | undefined
  onLinked: () => void | Promise<void>
}

export function RequestPersonLinkSection({
  requestId,
  personId,
  parishionerId,
  onLinked,
}: Props) {
  const [linkedPerson, setLinkedPerson] = useState<LinkedPerson | null>(null)
  const [existingForParishioner, setExistingForParishioner] = useState<LinkedPerson | null>(
    null
  )
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const resolvedPersonId = personId != null ? String(personId).trim() : ''
  const resolvedParishionerId =
    parishionerId != null ? String(parishionerId).trim() : ''

  useEffect(() => {
    let cancelled = false

    async function loadPersonLinks() {
      let nextLinked: LinkedPerson | null = null
      let nextExisting: LinkedPerson | null = null

      if (resolvedPersonId) {
        const { data } = await supabase
          .from('people')
          .select('id, first_name, middle_name, last_name')
          .eq('id', resolvedPersonId)
          .maybeSingle()

        if (data) {
          const parsed = parsePersonRow(data as Record<string, unknown>)
          nextLinked = {
            id: parsed.id,
            displayName: formatPersonDisplayName(parsed),
          }
        }
      } else if (resolvedParishionerId) {
        const { data } = await supabase
          .from('people')
          .select('id, first_name, middle_name, last_name')
          .eq('parishioner_id', resolvedParishionerId)
          .maybeSingle()

        if (data) {
          const parsed = parsePersonRow(data as Record<string, unknown>)
          nextExisting = {
            id: parsed.id,
            displayName: formatPersonDisplayName(parsed),
          }
        }
      }

      if (cancelled) return

      setLinkedPerson(nextLinked)
      setExistingForParishioner(nextExisting)
    }

    void loadPersonLinks()
    return () => {
      cancelled = true
    }
  }, [resolvedPersonId, resolvedParishionerId])

  async function handleLinkExisting() {
    setBusy(true)
    setMessage('')
    const result = await linkRequestToExistingPerson(requestId)
    setBusy(false)

    if (!result.ok) {
      setMessage(result.error)
      return
    }

    setMessage('Linked to existing person profile.')
    await onLinked()
  }

  async function handleCreatePerson() {
    setBusy(true)
    setMessage('')
    const result = await createPersonFromRequestParishioner(requestId)
    setBusy(false)

    if (!result.ok) {
      setMessage(result.error)
      return
    }

    setMessage('Person profile created and linked.')
    await onLinked()
  }

  return (
    <WorkflowSectionCard
      id="people-directory"
      title="People directory"
      description="Connect this request to a parishioner profile in your People directory."
    >
      {resolvedPersonId && linkedPerson ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Linked person:</span>{' '}
            {linkedPerson.displayName}
          </p>
          <Link
            href={`/dashboard/people/${linkedPerson.id}`}
            className="inline-block text-sm font-medium text-blue-800 underline underline-offset-2 hover:text-blue-950"
          >
            View profile →
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
                {busy ? 'Linking…' : 'Link existing person'}
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
                {busy ? 'Creating…' : 'Create person profile'}
              </button>
            </div>
          )}
        </div>
      )}

      {message ? <InlineFormMessage message={message} /> : null}
    </WorkflowSectionCard>
  )
}
