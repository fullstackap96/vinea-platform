import React from 'react'
import { primaryButtonMd, secondaryButtonMd, secondaryButtonSm } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import {
  sectionHeadingClassName,
  sectionHeadingRowClassName,
  sectionHeadingTitleClassName,
  sectionSubheadingClassName,
} from '@/lib/sectionHeader'

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
      <h2 className={sectionHeadingClassName}>Reply Assistance</h2>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={onGenerateSummary}
          className={`${secondaryButtonMd} w-full justify-center sm:w-auto`}
        >
          Generate AI Summary
        </button>

        <button
          type="button"
          onClick={onGenerateReplyDraft}
          className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
        >
          Generate Reply Draft
        </button>
      </div>

      {aiLoading && (
        <div
          className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-900"
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
        <div className="mb-4 border-t border-gray-100 pt-4 text-gray-800">
          <h3 className={sectionSubheadingClassName}>AI Summary</h3>
          <p className="mt-2 whitespace-pre-wrap">{aiSummary}</p>
        </div>
      )}

      {replyDraft && (
        <div
          className={`text-gray-800 ${aiSummary ? 'border-t border-gray-100 pt-4' : 'mt-4 border-t border-gray-100 pt-4'}`}
        >
          <div className={sectionHeadingRowClassName}>
            <h3 className={sectionHeadingTitleClassName}>Reply Draft</h3>

            <button
              type="button"
              onClick={onCopyReplyDraft}
              className={`${secondaryButtonSm} w-full shrink-0 justify-center sm:w-auto`}
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

