'use client'

import { Check, Circle, Minus, PlayCircle } from 'lucide-react'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import {
  groupRequestWorkflowSteps,
  workflowStepOwnerLabel,
  workflowStepStatusLabel,
  type RequestWorkflowStep,
  type RequestWorkflowStepStatus,
} from '@/lib/requestWorkflowSteps'
import { MissingValue } from '@/lib/missingValue'

function formatDueDate(value: string | null): string {
  if (!value) return 'No due date'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function StatusIcon({ status }: { status: RequestWorkflowStepStatus }) {
  if (status === 'complete') {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
        <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
      </span>
    )
  }
  if (status === 'skipped') {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
        <Minus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
      </span>
    )
  }
  if (status === 'in_progress') {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-800">
        <PlayCircle className="h-4 w-4" strokeWidth={2.5} aria-hidden />
      </span>
    )
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-amber-300 bg-amber-50 text-amber-800">
      <Circle className="h-2.5 w-2.5 fill-current" aria-hidden />
    </span>
  )
}

export function RequestWorkflowStepsSection({
  steps,
  updatingStepId,
  onUpdateStatus,
}: {
  steps: RequestWorkflowStep[]
  updatingStepId: string
  onUpdateStatus: (stepId: string, status: RequestWorkflowStepStatus) => void
}) {
  if (steps.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
        No workflow steps are attached to this request yet. New Baptism, Wedding, Funeral, and OCIA
        requests will use the active workflow template.
      </div>
    )
  }

  const groups = groupRequestWorkflowSteps(steps)

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.phase} className="rounded-xl border border-gray-200 bg-white p-4">
          <h4 className="text-sm font-semibold text-gray-900">{group.phase}</h4>
          <div className="mt-3 divide-y divide-gray-100">
            {group.steps.map((step) => {
              const isUpdating = updatingStepId === step.id
              return (
                <div key={step.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex gap-3">
                    <StatusIcon status={step.status} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                          {step.description ? (
                            <p className="mt-1 text-sm leading-relaxed text-gray-600">
                              {step.description}
                            </p>
                          ) : null}
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            step.required
                              ? 'bg-amber-50 text-amber-900'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {step.required ? 'Required' : 'Optional'}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                        <span className="rounded-full bg-slate-50 px-2 py-1">
                          Owner: {workflowStepOwnerLabel(step.owner_type)}
                        </span>
                        <span className="rounded-full bg-slate-50 px-2 py-1">
                          Status: {workflowStepStatusLabel(step.status)}
                        </span>
                        <span className="rounded-full bg-slate-50 px-2 py-1">
                          Due: {step.due_date ? formatDueDate(step.due_date) : <MissingValue>No due date</MissingValue>}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pl-10 sm:flex-row sm:flex-wrap">
                    {step.status !== 'complete' ? (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(step.id, 'complete')}
                        disabled={isUpdating}
                        className={`${primaryButtonMd} justify-center`}
                      >
                        {isUpdating ? 'Saving...' : 'Mark complete'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(step.id, 'not_started')}
                        disabled={isUpdating}
                        className={`${secondaryButtonMd} justify-center`}
                      >
                        {isUpdating ? 'Saving...' : 'Reopen'}
                      </button>
                    )}
                    {step.status !== 'in_progress' && step.status !== 'complete' ? (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(step.id, 'in_progress')}
                        disabled={isUpdating}
                        className={`${secondaryButtonMd} justify-center`}
                      >
                        Start
                      </button>
                    ) : null}
                    {!step.required && step.status !== 'skipped' && step.status !== 'complete' ? (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(step.id, 'skipped')}
                        disabled={isUpdating}
                        className={`${secondaryButtonMd} justify-center`}
                      >
                        Skip optional
                      </button>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
