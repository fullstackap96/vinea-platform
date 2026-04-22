import React from 'react'
import { maybeMissingValue } from '@/lib/missingValue'
import { LabelValueGrid, LabelValueRow } from './LabelValueGrid'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'

export function SendEmailSection({
  toEmail,
  subject,
  setSubject,
  body,
  onSend,
  sending,
  message,
}: {
  toEmail: string
  subject: string
  setSubject: (value: string) => void
  body: string
  onSend: () => void
  sending: boolean
  message: string
}) {
  const canSend = Boolean(toEmail && subject && body) && !sending

  return (
    <div>
      <h2 className={sectionHeadingClassName}>Send Email</h2>

      <div className="space-y-4">
        <LabelValueGrid>
          <LabelValueRow
            label="To"
            value={maybeMissingValue(String(toEmail ?? '').trim() ? String(toEmail) : '—')}
          />
        </LabelValueGrid>

        <div>
          <label htmlFor="send-email-subject" className="mb-1 block text-sm text-gray-500">
            Email subject
          </label>
          <input
            id="send-email-subject"
            className="w-full border p-3 rounded"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">Email body</label>
          <p className="mb-2 text-xs text-gray-600 leading-relaxed">
            Drafted by AI. Review before sending.
          </p>
          <div className="rounded-lg border border-gray-200 p-3 text-gray-800">
            {body ? (
              <p className="whitespace-pre-wrap">{body}</p>
            ) : (
              <p className="text-sm text-gray-800">
                Generate a reply draft first, then send it.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
        >
          {sending ? 'Sending...' : 'Send email'}
        </button>

        <InlineFormMessage message={message} className="!mt-0" />
      </div>
    </div>
  )
}

