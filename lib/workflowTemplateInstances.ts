export type WorkflowTemplateStepForInstance = {
  id: string
  phase: string
  title: string
  description?: string | null
  owner_type?: string | null
  required?: boolean | null
  due_offset_days?: number | null
  sort_order?: number | null
}

export type RequestWorkflowStepInsert = {
  parish_id: string
  request_id: string
  template_step_id: string
  phase: string
  title: string
  description: string | null
  owner_type: string
  required: boolean
  due_date: string | null
  sort_order: number
}

const VALID_OWNER_TYPES = new Set(['staff', 'priest', 'deacon', 'family'])

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function dateOnly(value: Date): string {
  const year = value.getUTCFullYear()
  const month = String(value.getUTCMonth() + 1).padStart(2, '0')
  const day = String(value.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(base: Date, days: number): Date {
  const next = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()))
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

export function buildRequestWorkflowStepInserts(input: {
  parishId: string
  requestId: string
  templateSteps: readonly WorkflowTemplateStepForInstance[]
  today?: Date
}): RequestWorkflowStepInsert[] {
  const parishId = text(input.parishId)
  const requestId = text(input.requestId)
  if (!parishId || !requestId) return []

  const today = input.today ?? new Date()

  return input.templateSteps
    .map((step) => {
      const templateStepId = text(step.id)
      const phase = text(step.phase)
      const title = text(step.title)
      if (!templateStepId || !phase || !title) return null

      const owner = text(step.owner_type) || 'staff'
      const dueOffset =
        typeof step.due_offset_days === 'number' &&
        Number.isFinite(step.due_offset_days) &&
        step.due_offset_days >= 0
          ? Math.floor(step.due_offset_days)
          : null

      return {
        parish_id: parishId,
        request_id: requestId,
        template_step_id: templateStepId,
        phase,
        title,
        description: text(step.description) || null,
        owner_type: VALID_OWNER_TYPES.has(owner) ? owner : 'staff',
        required: step.required !== false,
        due_date: dueOffset === null ? null : dateOnly(addDays(today, dueOffset)),
        sort_order:
          typeof step.sort_order === 'number' && Number.isFinite(step.sort_order)
            ? Math.floor(step.sort_order)
            : 0,
      }
    })
    .filter((step): step is RequestWorkflowStepInsert => step !== null)
}
