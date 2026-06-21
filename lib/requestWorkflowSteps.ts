export type RequestWorkflowStepStatus = 'not_started' | 'in_progress' | 'complete' | 'skipped'

export type RequestWorkflowStep = {
  id: string
  phase: string
  title: string
  description: string | null
  owner_type: string
  required: boolean
  status: RequestWorkflowStepStatus
  due_date: string | null
  sort_order: number
}

export type RequestWorkflowStepPhaseGroup = {
  phase: string
  steps: RequestWorkflowStep[]
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}

export function normalizeRequestWorkflowStep(value: Record<string, unknown>): RequestWorkflowStep | null {
  const id = text(value.id)
  const phase = text(value.phase)
  const title = text(value.title)
  if (!id || !phase || !title) return null

  const statusRaw = text(value.status)
  const status: RequestWorkflowStepStatus =
    statusRaw === 'in_progress' ||
    statusRaw === 'complete' ||
    statusRaw === 'skipped' ||
    statusRaw === 'not_started'
      ? statusRaw
      : 'not_started'

  return {
    id,
    phase,
    title,
    description: text(value.description) || null,
    owner_type: text(value.owner_type) || 'staff',
    required: value.required !== false,
    status,
    due_date: text(value.due_date) || null,
    sort_order: Number.isFinite(Number(value.sort_order)) ? Number(value.sort_order) : 0,
  }
}

export function groupRequestWorkflowSteps(
  steps: readonly RequestWorkflowStep[]
): RequestWorkflowStepPhaseGroup[] {
  const groups = new Map<string, RequestWorkflowStep[]>()
  for (const step of [...steps].sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title))) {
    groups.set(step.phase, [...(groups.get(step.phase) ?? []), step])
  }
  return Array.from(groups.entries()).map(([phase, phaseSteps]) => ({ phase, steps: phaseSteps }))
}

export function countIncompleteRequiredWorkflowSteps(
  steps: readonly RequestWorkflowStep[]
): number {
  return steps.filter((step) => step.required && step.status !== 'complete').length
}

export function workflowStepOwnerLabel(value: unknown): string {
  switch (text(value)) {
    case 'priest':
      return 'Priest'
    case 'deacon':
      return 'Deacon'
    case 'family':
      return 'Family'
    default:
      return 'Staff'
  }
}

export function workflowStepStatusLabel(value: unknown): string {
  switch (text(value)) {
    case 'in_progress':
      return 'In progress'
    case 'complete':
      return 'Complete'
    case 'skipped':
      return 'Skipped'
    default:
      return 'Not started'
  }
}
