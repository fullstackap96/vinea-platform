import { hasConfirmedSchedule, type RequestScheduleRow } from '@/lib/requestConfirmedSchedule'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import { getWorkflowPlaybook, type WorkflowPlaybookRequestType } from '@/lib/workflowPlaybooks'

export type RequestPlaybookStep = {
  key: string
  phase: string
  label: string
  helper: string
  complete: boolean
  anchor: string
}

export type RequestPlaybookPhase = {
  name: string
  completeCount: number
  totalCount: number
  steps: RequestPlaybookStep[]
}

export type RequestPlaybookProgress = {
  requestType: WorkflowPlaybookRequestType
  title: string
  description: string
  completeCount: number
  totalCount: number
  completionPercent: number
  nextStep: RequestPlaybookStep | null
  phases: RequestPlaybookPhase[]
}

type ChecklistLikeItem = {
  item_name?: unknown
  is_complete?: unknown
}

type RequestLike = {
  status?: unknown
  request_type?: unknown
  child_name?: unknown
  assigned_staff_name?: unknown
  assigned_priest_name?: unknown
  assigned_deacon_name?: unknown
  next_follow_up_date?: unknown
  last_contacted_at?: unknown
  confirmed_baptism_date?: unknown
}

type PersonLike = {
  full_name?: unknown
  email?: unknown
  phone?: unknown
}

type DetailLike = Record<string, unknown> | null | undefined

export type RequestPlaybookProgressInput = {
  request: RequestLike | null | undefined
  parishioner?: PersonLike | null
  communications?: readonly unknown[]
  checklistItems?: readonly ChecklistLikeItem[]
  sacramentalRecord?: unknown
  funeralDetail?: DetailLike
  weddingDetail?: DetailLike
  ociaDetail?: DetailLike
  scheduleRow: RequestScheduleRow
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function hasText(value: unknown): boolean {
  return text(value).length > 0
}

function hasAnyText(...values: unknown[]): boolean {
  return values.some(hasText)
}

function hasAssignment(request: RequestLike | null | undefined): boolean {
  return hasAnyText(
    request?.assigned_staff_name,
    request?.assigned_priest_name,
    request?.assigned_deacon_name
  )
}

function normalize(value: unknown): string {
  return text(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function matchesIntent(a: string, b: string): boolean {
  const left = normalize(a)
  const right = normalize(b)
  if (!left || !right) return false
  if (left === right || left.includes(right) || right.includes(left)) return true

  const leftTokens = new Set(left.split(' ').filter((token) => token.length >= 4))
  const shared = right.split(' ').filter((token) => token.length >= 4 && leftTokens.has(token))
  return shared.length >= 2
}

function hasChecklistIntent(
  checklistItems: readonly ChecklistLikeItem[],
  ...intents: string[]
): boolean {
  return checklistItems.some((item) => {
    if (item.is_complete === false) return false
    const name = text(item.item_name)
    return intents.some((intent) => matchesIntent(name, intent))
  })
}

function hasContact(input: RequestPlaybookProgressInput): boolean {
  return hasText(input.request?.last_contacted_at) || Boolean(input.communications?.length)
}

function hasFollowUp(input: RequestPlaybookProgressInput): boolean {
  return hasText(input.request?.next_follow_up_date)
}

function hasContactMethod(input: RequestPlaybookProgressInput): boolean {
  return hasAnyText(input.parishioner?.email, input.parishioner?.phone)
}

function detailHasAny(detail: DetailLike, ...keys: string[]): boolean {
  return keys.some((key) => hasText(detail?.[key]))
}

function addStep(
  steps: RequestPlaybookStep[],
  step: Omit<RequestPlaybookStep, 'complete'> & { complete?: boolean }
): void {
  steps.push({ ...step, complete: Boolean(step.complete) })
}

function addCommonOpeningSteps(
  steps: RequestPlaybookStep[],
  input: RequestPlaybookProgressInput
): void {
  addStep(steps, {
    key: 'contact-method',
    phase: 'Intake',
    label: 'Primary contact is on file',
    helper: 'Add an email or phone number so staff can reach the family quickly.',
    complete: hasContactMethod(input),
    anchor: 'contact-information',
  })
  addStep(steps, {
    key: 'owner',
    phase: 'Intake',
    label: 'Request has an owner',
    helper: 'Assign staff, a priest, or a deacon so everyone knows who is responsible.',
    complete: hasAssignment(input.request),
    anchor: 'assignment',
  })
  addStep(steps, {
    key: 'first-contact',
    phase: 'Preparation',
    label: 'First contact has been logged',
    helper: 'Log the first call, email, or conversation so the office has a clear record.',
    complete: hasContact(input),
    anchor: 'communication',
  })
}

function buildFuneralSteps(input: RequestPlaybookProgressInput): RequestPlaybookStep[] {
  const checklist = input.checklistItems ?? []
  const detail = input.funeralDetail
  const steps: RequestPlaybookStep[] = []
  addCommonOpeningSteps(steps, input)
  addStep(steps, {
    key: 'funeral-details',
    phase: 'Preparation',
    label: 'Deceased and funeral home details are captured',
    helper: 'Record the deceased name, funeral home, director contact, and family relationship.',
    complete:
      detailHasAny(detail, 'deceased_name') &&
      (detailHasAny(detail, 'funeral_home', 'funeral_director_contact') ||
        hasChecklistIntent(checklist, 'Coordinate date, time, and logistics with funeral home')),
    anchor: 'request-details',
  })
  addStep(steps, {
    key: 'confirmed-service',
    phase: 'Scheduling',
    label: 'Funeral service date and time are confirmed',
    helper: 'Set the confirmed service time once the parish, family, and funeral home agree.',
    complete: hasConfirmedSchedule(input.scheduleRow),
    anchor: 'confirmed-time',
  })
  addStep(steps, {
    key: 'liturgy-details',
    phase: 'Documents',
    label: 'Liturgy and committal notes are ready',
    helper: 'Capture readings, music, worship aid notes, cemetery, cremation, or committal details.',
    complete:
      detailHasAny(detail, 'readings_music_notes', 'cemetery_or_committal') ||
      hasChecklistIntent(
        checklist,
        'Collect readings, music, and worship aid details',
        'Confirm cemetery, cremation, or committal arrangements'
      ),
    anchor: 'request-details',
  })
  addStep(steps, {
    key: 'post-funeral-care',
    phase: 'Follow-up',
    label: 'Post-funeral family follow-up is planned',
    helper: 'Set a pastoral follow-up so care continues after the service.',
    complete: detailHasAny(detail, 'post_funeral_follow_up_date') || hasFollowUp(input),
    anchor: 'next-follow-up',
  })
  return steps
}

function buildWeddingSteps(input: RequestPlaybookProgressInput): RequestPlaybookStep[] {
  const checklist = input.checklistItems ?? []
  const detail = input.weddingDetail
  const steps: RequestPlaybookStep[] = []
  addCommonOpeningSteps(steps, input)
  addStep(steps, {
    key: 'couple-details',
    phase: 'Preparation',
    label: 'Couple and preparation details are captured',
    helper: 'Record the couple names, proposed date, and any preparation notes.',
    complete: detailHasAny(detail, 'partner_one_name') || hasChecklistIntent(checklist, 'Contact couple'),
    anchor: 'request-details',
  })
  addStep(steps, {
    key: 'confirmed-ceremony',
    phase: 'Scheduling',
    label: 'Wedding ceremony date and time are confirmed',
    helper: 'Confirm parish and clergy availability before treating the date as final.',
    complete: hasConfirmedSchedule(input.scheduleRow),
    anchor: 'confirmed-time',
  })
  addStep(steps, {
    key: 'marriage-documents',
    phase: 'Documents',
    label: 'Marriage preparation documents are tracked',
    helper: 'Use checklist items for forms, certificates, prep sessions, and canonical requirements.',
    complete: hasChecklistIntent(
      checklist,
      'Collect marriage preparation documents and certificates',
      'Track required marriage preparation sessions'
    ),
    anchor: 'checklist',
  })
  addStep(steps, {
    key: 'ceremony-plan',
    phase: 'Ceremony',
    label: 'Ceremony, rehearsal, and final details are planned',
    helper: 'Capture ceremony notes, readings, music, rehearsal, and final confirmation details.',
    complete:
      detailHasAny(detail, 'ceremony_notes') ||
      hasChecklistIntent(checklist, 'Finalize liturgy, readings, music, and rehearsal details'),
    anchor: 'request-details',
  })
  addStep(steps, {
    key: 'wedding-follow-up',
    phase: 'Follow-up',
    label: 'Next follow-up with the couple is set',
    helper: 'Set the next date staff should check in with the couple.',
    complete: hasFollowUp(input),
    anchor: 'next-follow-up',
  })
  return steps
}

function buildBaptismSteps(input: RequestPlaybookProgressInput): RequestPlaybookStep[] {
  const checklist = input.checklistItems ?? []
  const steps: RequestPlaybookStep[] = []
  addCommonOpeningSteps(steps, input)
  addStep(steps, {
    key: 'child-details',
    phase: 'Preparation',
    label: 'Child and family details are captured',
    helper: 'Confirm the child name and basic family information before scheduling.',
    complete: hasText(input.request?.child_name),
    anchor: 'request-details',
  })
  addStep(steps, {
    key: 'baptism-documents',
    phase: 'Documents',
    label: 'Birth certificate and godparent items are tracked',
    helper: 'Track paperwork so sponsor and record details are clear before the baptism.',
    complete: hasChecklistIntent(
      checklist,
      'Collect child birth certificate',
      'Collect godparent information and eligibility paperwork'
    ),
    anchor: 'checklist',
  })
  addStep(steps, {
    key: 'prep-class',
    phase: 'Preparation',
    label: 'Baptism preparation is accounted for',
    helper: 'Confirm whether the parents need a class or have completed preparation.',
    complete: hasChecklistIntent(checklist, 'Confirm parent baptism preparation class completion'),
    anchor: 'checklist',
  })
  addStep(steps, {
    key: 'confirmed-baptism',
    phase: 'Scheduling',
    label: 'Baptism date and time are confirmed',
    helper: 'Set the confirmed baptism date once the parish and family agree.',
    complete: hasConfirmedSchedule(input.scheduleRow),
    anchor: 'confirmed-time',
  })
  addStep(steps, {
    key: 'baptism-record',
    phase: 'Follow-up',
    label: 'Record and certificate details are ready',
    helper: 'Prepare the sacramental record and certificate details for completion.',
    complete:
      Boolean(input.sacramentalRecord) ||
      hasChecklistIntent(checklist, 'Prepare sacramental record and certificate details'),
    anchor: 'checklist',
  })
  return steps
}

function buildOciaSteps(input: RequestPlaybookProgressInput): RequestPlaybookStep[] {
  const checklist = input.checklistItems ?? []
  const detail = input.ociaDetail
  const steps: RequestPlaybookStep[] = []
  addCommonOpeningSteps(steps, input)
  addStep(steps, {
    key: 'ocia-background',
    phase: 'Preparation',
    label: 'Sacramental background is reviewed',
    helper: 'Capture what the inquirer is seeking and any sacramental history.',
    complete:
      detailHasAny(detail, 'sacramental_background', 'seeking') ||
      hasChecklistIntent(checklist, 'Review sacramental background and current parish status'),
    anchor: 'request-details',
  })
  addStep(steps, {
    key: 'first-meeting',
    phase: 'Scheduling',
    label: 'First OCIA meeting is scheduled',
    helper: 'Set the confirmed OCIA meeting or next session time.',
    complete: hasConfirmedSchedule(input.scheduleRow),
    anchor: 'confirmed-time',
  })
  addStep(steps, {
    key: 'materials-and-team',
    phase: 'Documents',
    label: 'Materials, sponsor, or team next step is tracked',
    helper: 'Track inquiry materials and who will accompany the inquirer next.',
    complete: hasChecklistIntent(
      checklist,
      'Share inquiry or evangelization materials',
      'Identify sponsor, mentor, or team member for follow-up'
    ),
    anchor: 'checklist',
  })
  addStep(steps, {
    key: 'ocia-follow-up',
    phase: 'Follow-up',
    label: 'Next OCIA follow-up is set',
    helper: 'Set the next conversation, session, or coordinator follow-up.',
    complete: hasFollowUp(input),
    anchor: 'next-follow-up',
  })
  return steps
}

const PHASE_ORDER = ['Intake', 'Preparation', 'Scheduling', 'Documents', 'Ceremony', 'Follow-up']

export function buildRequestPlaybookProgress(
  input: RequestPlaybookProgressInput
): RequestPlaybookProgress | null {
  const requestType = requestTypeFromRow({
    request_type: input.request?.request_type ?? input.scheduleRow.request_type,
  })
  const playbook = getWorkflowPlaybook(requestType)
  if (!playbook) return null

  const stepsByType: Record<WorkflowPlaybookRequestType, RequestPlaybookStep[]> = {
    funeral: buildFuneralSteps(input),
    wedding: buildWeddingSteps(input),
    baptism: buildBaptismSteps(input),
    ocia: buildOciaSteps(input),
  }
  const steps = stepsByType[playbook.requestType]
  const totalCount = steps.length
  const completeCount = steps.filter((step) => step.complete).length
  const completionPercent = totalCount > 0 ? Math.round((completeCount / totalCount) * 100) : 0
  const phases = PHASE_ORDER.map((name) => {
    const phaseSteps = steps.filter((step) => step.phase === name)
    return {
      name,
      completeCount: phaseSteps.filter((step) => step.complete).length,
      totalCount: phaseSteps.length,
      steps: phaseSteps,
    }
  }).filter((phase) => phase.totalCount > 0)

  return {
    requestType: playbook.requestType,
    title: playbook.title,
    description: playbook.description,
    completeCount,
    totalCount,
    completionPercent,
    nextStep: steps.find((step) => !step.complete) ?? null,
    phases,
  }
}
