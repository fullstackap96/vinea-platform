'use client'

import { useState } from 'react'
import { BookOpenCheck } from 'lucide-react'
import { applyWorkflowPlaybookChecklist } from '../../actions'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { chipBase } from '@/lib/chipStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import {
  buildWorkflowPlaybookSuggestion,
  type ChecklistLikeItem,
} from '@/lib/workflowPlaybooks'

export function WorkflowPlaybookBuilder({
  requestId,
  requestType,
  checklistItems,
  onApplied,
}: {
  requestId: string
  requestType: unknown
  checklistItems: readonly ChecklistLikeItem[]
  onApplied: () => void
}) {
  const [applying, setApplying] = useState(false)
  const [message, setMessage] = useState('')
  const suggestion = buildWorkflowPlaybookSuggestion({ requestType, checklistItems })

  if (!suggestion) return null

  async function applyPlaybook() {
    setApplying(true)
    setMessage('')
    const result = await applyWorkflowPlaybookChecklist({ requestId })
    setApplying(false)

    if (!result.ok) {
      setMessage(result.error)
      return
    }

    setMessage(
      result.addedCount === 0
        ? 'This playbook is already fully represented in the checklist.'
        : `Added ${result.addedCount} playbook ${result.addedCount === 1 ? 'item' : 'items'} to the checklist.`
    )
    onApplied()
  }

  return (
    <section
      className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4 sm:p-5"
      aria-labelledby="workflow-playbook-builder-heading"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-700 text-white"
            aria-hidden
          >
            <BookOpenCheck className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4
                id="workflow-playbook-builder-heading"
                className="text-sm font-semibold uppercase tracking-wide text-violet-950"
              >
                Workflow playbook
              </h4>
              <span className={`${chipBase} border-violet-200 bg-white text-violet-950`}>
                {suggestion.completionPercent}% applied
              </span>
            </div>
            <p className="mt-2 text-base font-semibold text-gray-950">
              {suggestion.playbook.title}
            </p>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-gray-700">
              {suggestion.playbook.description}
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={applying || suggestion.missingItems.length === 0}
          onClick={applyPlaybook}
          className={`${primaryButtonMd} w-full justify-center lg:w-auto`}
        >
          {applying
            ? 'Applying...'
            : suggestion.missingItems.length === 0
              ? 'Playbook applied'
              : `Add ${suggestion.missingItems.length} missing steps`}
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {suggestion.playbook.items.map((item) => {
          const isMissing = suggestion.missingItems.some((missing) => missing.key === item.key)
          return (
            <div
              key={item.key}
              className={`rounded-xl border px-4 py-3 ${
                isMissing
                  ? 'border-violet-200 bg-white text-gray-900'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-950'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide opacity-75">
                  {item.phase}
                </span>
                <span
                  className={`${chipBase} text-[10px] uppercase ${
                    isMissing
                      ? 'border-violet-200 bg-violet-50 text-violet-950'
                      : 'border-emerald-200 bg-white text-emerald-950'
                  }`}
                >
                  {isMissing ? 'Missing' : 'Already on checklist'}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold">{item.itemName}</p>
              <p className="mt-1 text-xs leading-relaxed opacity-80">{item.customerValue}</p>
            </div>
          )
        })}
      </div>
      {message ? <InlineFormMessage message={message} /> : null}
    </section>
  )
}
