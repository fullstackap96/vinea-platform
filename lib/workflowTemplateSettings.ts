export const WORKFLOW_TEMPLATE_OWNER_TYPES = ['staff', 'priest', 'deacon', 'family'] as const

export type WorkflowTemplateOwnerType = (typeof WORKFLOW_TEMPLATE_OWNER_TYPES)[number]

export type WorkflowTemplateStepPatch = {
  title: string
  description: string | null
  phase: string
  owner_type: WorkflowTemplateOwnerType
  required: boolean
  sort_order: number
  due_offset_days: number | null
}

export type WorkflowTemplateStepReadModel = WorkflowTemplateStepPatch & {
  id: string
  template_id: string
}

export type WorkflowTemplateReadModel = {
  id: string
  request_type: string
  name: string
  description: string | null
  active: boolean
  steps: WorkflowTemplateStepReadModel[]
}

type UnknownRecord = Record<string, unknown>

function record(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null
}

function requiredString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

function nullableString(value: unknown): string | null | undefined {
  return value === null ? null : typeof value === 'string' ? value : undefined
}

function parseWorkflowTemplateStepReadModel(
  value: unknown,
  expectedTemplateId: string | null,
): WorkflowTemplateStepReadModel | null {
  const source = record(value)
  const id = requiredString(source?.id)
  const templateId = requiredString(source?.template_id)
  const phase = requiredString(source?.phase)
  const title = requiredString(source?.title)
  const description = nullableString(source?.description)
  const dueOffsetDays = source?.due_offset_days
  if (
    !source ||
    !id ||
    !templateId ||
    (expectedTemplateId && templateId !== expectedTemplateId) ||
    !phase ||
    !title ||
    description === undefined ||
    !WORKFLOW_TEMPLATE_OWNER_TYPES.includes(source.owner_type as WorkflowTemplateOwnerType) ||
    typeof source.required !== 'boolean' ||
    (dueOffsetDays !== null &&
      (typeof dueOffsetDays !== 'number' ||
        !Number.isInteger(dueOffsetDays) ||
        dueOffsetDays < 0 ||
        dueOffsetDays > 365)) ||
    typeof source.sort_order !== 'number' ||
    !Number.isInteger(source.sort_order) ||
    source.sort_order < 0 ||
    source.sort_order > 1000
  ) {
    return null
  }
  return {
    id,
    template_id: templateId,
    phase,
    title,
    description,
    owner_type: source.owner_type as WorkflowTemplateOwnerType,
    required: source.required,
    due_offset_days: dueOffsetDays,
    sort_order: source.sort_order,
  }
}

export function parseWorkflowTemplatesResponse(
  value: unknown,
  expectedParishId: string | null,
): { activeParishId: string; templates: WorkflowTemplateReadModel[] } | null {
  const source = record(value)
  const activeParishId = requiredString(source?.activeParishId)
  if (
    !source ||
    source.ok !== true ||
    !activeParishId ||
    (expectedParishId && activeParishId !== expectedParishId) ||
    !Array.isArray(source.templates)
  ) {
    return null
  }

  const templates: WorkflowTemplateReadModel[] = []
  const templateIds = new Set<string>()
  const requestTypes = new Set<string>()
  const stepIds = new Set<string>()
  for (const value of source.templates) {
    const template = record(value)
    const id = requiredString(template?.id)
    const requestType = requiredString(template?.request_type)
    const name = requiredString(template?.name)
    const description = nullableString(template?.description)
    if (
      !template ||
      !id ||
      !requestType ||
      !name ||
      description === undefined ||
      typeof template.active !== 'boolean' ||
      !Array.isArray(template.steps) ||
      templateIds.has(id) ||
      requestTypes.has(requestType)
    ) {
      return null
    }

    const steps: WorkflowTemplateStepReadModel[] = []
    for (const stepValue of template.steps) {
      const step = parseWorkflowTemplateStepReadModel(stepValue, id)
      if (!step || stepIds.has(step.id)) return null
      stepIds.add(step.id)
      steps.push(step)
    }
    templateIds.add(id)
    requestTypes.add(requestType)
    templates.push({ id, request_type: requestType, name, description, active: template.active, steps })
  }
  return { activeParishId, templates }
}

export function parseWorkflowTemplateStepResponse(
  value: unknown,
  expectedStepId: string,
): WorkflowTemplateStepReadModel | null {
  const source = record(value)
  if (!source || source.ok !== true) return null
  const step = parseWorkflowTemplateStepReadModel(source.step, null)
  return step?.id === expectedStepId ? step : null
}

function text(value: unknown, max: number): string {
  return String(value ?? '').trim().slice(0, max)
}

function boundedInteger(value: unknown, fallback: number, min: number, max: number): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, Math.round(n)))
}

function nullableBoundedInteger(value: unknown, min: number, max: number): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return Math.max(min, Math.min(max, Math.round(n)))
}

export function normalizeWorkflowTemplateStepPatch(
  value: unknown
): { ok: true; patch: WorkflowTemplateStepPatch } | { ok: false; error: string } {
  const source =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}

  const title = text(source.title, 160)
  const phase = text(source.phase, 120)
  if (!title) return { ok: false, error: 'Step title is required.' }
  if (!phase) return { ok: false, error: 'Step phase is required.' }

  const ownerRaw = text(source.owner_type, 40)
  const owner_type = WORKFLOW_TEMPLATE_OWNER_TYPES.includes(ownerRaw as WorkflowTemplateOwnerType)
    ? (ownerRaw as WorkflowTemplateOwnerType)
    : 'staff'

  return {
    ok: true,
    patch: {
      title,
      description: text(source.description, 1000) || null,
      phase,
      owner_type,
      required: source.required !== false,
      sort_order: boundedInteger(source.sort_order, 0, 0, 1000),
      due_offset_days: nullableBoundedInteger(source.due_offset_days, 0, 365),
    },
  }
}
