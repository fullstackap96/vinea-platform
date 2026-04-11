import React from 'react'
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
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">Send Email</h2>

      <div className="border rounded p-4 space-y-3">
        <p className="text-gray-800 [&_strong]:text-gray-900">
          <strong>To:</strong> {toEmail || '—'}
        </p>

        <input
          className="w-full border p-3 rounded"
          placeholder="Email subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <div className="border rounded p-3 bg-gray-50 text-gray-800">
          <p className="text-sm mb-2 [&_strong]:text-gray-900">
            <strong>Body (from AI reply draft):</strong>
          </p>
          {body ? (
            <p className="whitespace-pre-wrap">{body}</p>
          ) : (
            <p className="text-sm text-gray-800">
              Generate a reply draft first, then send it.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          className="inline-flex w-full items-center justify-center bg-black text-white px-4 py-2 rounded disabled:opacity-50 sm:w-auto"
        >
          {sending ? 'Sending...' : 'Send email'}
        </button>

        <InlineFormMessage message={message} className="!mt-0" />
      </div>
    </div>
  )
}

