import React from 'react'
import { InlineFormMessage } from '@/lib/inlineFormMessage'

export function AiToolsSection({
  aiLoading,
  aiSummary,
  replyDraft,
  copyMessage,
  onGenerateSummary,
  onGenerateReplyDraft,
  onCopyReplyDraft,
}: {
  aiLoading: boolean
  aiSummary: string
  replyDraft: string
  copyMessage: string
  onGenerateSummary: () => void
  onGenerateReplyDraft: () => void
  onCopyReplyDraft: () => void
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">AI Tools</h2>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={onGenerateSummary}
          className="inline-flex w-full items-center justify-center bg-purple-700 text-white px-4 py-2 rounded sm:w-auto"
        >
          Generate AI Summary
        </button>

        <button
          type="button"
          onClick={onGenerateReplyDraft}
          className="inline-flex w-full items-center justify-center bg-indigo-700 text-white px-4 py-2 rounded sm:w-auto"
        >
          Generate Reply Draft
        </button>
      </div>

      {aiLoading && (
        <div
          className="mb-4 flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm"
          aria-live="polite"
        >
          <span
            className="h-4 w-4 shrink-0 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin"
            aria-hidden
          />
          Generating…
        </div>
      )}

      {aiSummary && (
        <div className="border rounded p-4 mb-4 text-gray-800">
          <h3 className="font-semibold mb-2 text-gray-900">AI Summary</h3>
          <p className="whitespace-pre-wrap">{aiSummary}</p>
        </div>
      )}

      {replyDraft && (
        <div className="border rounded p-4 text-gray-800">
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-semibold text-gray-900">Reply Draft</h3>

            <button
              type="button"
              onClick={onCopyReplyDraft}
              className="inline-flex w-full shrink-0 items-center justify-center bg-gray-700 text-white px-3 py-2 rounded sm:w-auto"
            >
              Copy Reply Draft
            </button>
          </div>

          <InlineFormMessage message={copyMessage} className="!mt-0 !mb-2" />

          <p className="whitespace-pre-wrap">{replyDraft}</p>
        </div>
      )}
    </div>
  )
}

