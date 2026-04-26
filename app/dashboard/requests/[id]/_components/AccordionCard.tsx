'use client'

import React, { type ReactNode } from 'react'
import { CheckCircle2, ChevronDown } from 'lucide-react'

export function AccordionCard({
  title,
  open,
  onToggle,
  helperText,
  statusSummary,
  isComplete,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  helperText?: string
  statusSummary?: string
  isComplete?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {helperText ? (
            <p className="mt-1 text-xs leading-relaxed text-gray-500">{helperText}</p>
          ) : null}
        </div>
        <div className="mt-0.5 flex shrink-0 items-center gap-2">
          {isComplete ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden />
              Done
            </span>
          ) : null}
          {statusSummary ? (
            <span className="max-w-[14rem] truncate text-xs text-gray-500 sm:max-w-[18rem]">
              {statusSummary}
            </span>
          ) : null}
          <ChevronDown
            className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
            aria-hidden
          />
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </div>
  )
}

