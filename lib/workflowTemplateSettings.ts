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
