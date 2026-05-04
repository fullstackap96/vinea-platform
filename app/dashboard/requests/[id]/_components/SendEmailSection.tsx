import React, { useId, useState } from 'react'
import { maybeMissingValue } from '@/lib/missingValue'
import { LabelValueGrid, LabelValueRow } from './LabelValueGrid'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import type { VineaEmailTemplateId } from '@/lib/vineaEmailTemplates'

export function SendEmailSection({
  toEmail,
  subject,
  setSubject,
  body,
  setBody,
  templateOptions,
  onApplyTemplate,
  onSend,
  sending,
  message,
}: {
  toEmail: string
  subject: string
  setSubject: (value: string) => void
  body: string
  setBody: (value: string) => void
  templateOptions: Array<{ id: VineaEmailTemplateId; label: string }>
  onApplyTemplate: (id: VineaEmailTemplateId) => void | Promise<void>
  onSend: () => void
  sending: boolean
  message: string
}) {
  const canSend = Boolean(toEmail && subject && body) && !sending
  const selectId = useId()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [applying, setApplying] = useState(false)

  async function handleApplyTemplate() {
    if (!selectedTemplateId) return
    setApplying(true)
    try {
      await onApplyTemplate(selectedTemplateId as VineaEmailTemplateId)
    } finally {
      setApplying(false)
    }
  }

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

        {templateOptions.length > 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-3 sm:p-4">
            <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-gray-900">
              Email template (Vinea)
            </label>
            <p className="mb-2 text-xs leading-relaxed text-gray-600">
              Choose a template to prefill the subject and body. You can edit everything before
              sending. AI reply drafts below are unchanged.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
              <select
                id={selectId}
                className="w-full min-w-0 flex-1 border border-gray-300 bg-white p-2.5 text-sm text-gray-900 rounded-md sm:max-w-md"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
              >
                <option value="">Select a template…</option>
                {templateOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedTemplateId || applying}
                onClick={handleApplyTemplate}
                className={`${secondaryButtonMd} w-full shrink-0 justify-center sm:w-auto`}
              >
                {applying ? 'Applying…' : 'Apply template'}
              </button>
            </div>
          </div>
        ) : null}

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
          <label htmlFor="send-email-body" className="mb-1 block text-sm font-medium text-gray-900">
            Email body
          </label>
          <p className="mb-2 text-xs text-gray-600 leading-relaxed">
            Use a Vinea template or generate an AI reply draft above, then edit here before sending.
          </p>
          <textarea
            id="send-email-body"
            className="min-h-[200px] w-full border border-gray-300 p-3 text-sm text-gray-900 rounded-md font-sans leading-relaxed"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Compose your message, or apply a template / AI draft first."
            spellCheck
          />
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
