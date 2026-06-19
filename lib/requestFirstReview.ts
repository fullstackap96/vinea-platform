import { formatRequestType } from '@/lib/formatRequestType'
import { getRequestDetailPrimaryHeading } from '@/lib/requestDetailIdentity'
import { type RequestScheduleRow } from '@/lib/requestConfirmedSchedule'
import {
  buildRequestWorkflowChecklist,
  type RequestWorkflowChecklistInput,
} from '@/lib/requestWorkflowChecklist'
import {
  resolveRequestWorkflowV2,
  type RequestWorkflowV2Input,
} from '@/lib/requestWorkflowV2'
import { buildWorkflowPlaybookSuggestion, type ChecklistLikeItem } from '@/lib/workflowPlaybooks'
import type { CareCadenceEvaluation } from '@/lib/careCadence'
import type { CommunicationCommitmentEvaluation } from '@/lib/communicationCommitments'

export type FirstReviewTone = 'urgent' | 'warning' | 'steady'

export type RequestFirstReview = {
  whatThisIs: string
  whyNow: string
  doFirst: string
  actionHref: string
  actionLabel: string
  tone: FirstReviewTone
  missingDetails: string[]
}

export type RequestFirstReviewInput = {
  request: (NonNullable<RequestWorkflowV2Input['request']> & {
    child_name?: unknown
    parishioner?: { full_name?: unknown; email?: unknown; phone?: unknown } | null
  }) | null | undefined
  scheduleRow: RequestScheduleRow
  checklistItems: readonly ChecklistLikeItem[]
  checklistIncomplete: boolean
  hasRecipientEmail: boolean
  careCadence?: CareCadenceEvaluation | null
  communicationCommitment?: CommunicationCommitmentEvaluation | null
  funeralDetail?: { deceased_name?: unknown } | null
  weddingDetail?: { partner_one_name?: unknown; partner_two_name?: unknown } | null
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function toneFrom(input: {
  workflowUrgency: string
  careCadence?: CareCadenceEvaluation | null
  communicationCommitment?: CommunicationCommitmentEvaluation | null
}): FirstReviewTone {
  if (input.careCadence?.level === 'urgent') return 'urgent'
  if (input.communicationCommitment?.tone === 'urgent') return 'urgent'
  if (input.workflowUrgency === 'overdue' || input.workflowUrgency === 'high') return 'warning'
  if (input.careCadence?.level === 'high') return 'warning'
  if (input.communicationCommitment?.tone === 'warning') return 'warning'
  return 'steady'
}

function buildWhatThisIs(input: RequestFirstReviewInput): string {
  const request = input.request ?? {}
  const requestTypeLabel = formatRequestType(request.request_type) || 'Request'
  const subject = getRequestDetailPrimaryHeading({
    request_type: request.request_type,
    child_name: request.child_name,
    parishioner: request.parishioner,
    funeralDetail: input.funeralDetail,
    weddingDetail: input.weddingDetail,
  })
  const contact = text(request.parishioner?.full_name)
  if (contact && contact.toLowerCase() !== subject.toLowerCase()) {
    return `${requestTypeLabel} request for ${subject} from ${contact}.`
  }
  return `${requestTypeLabel} request for ${subject}.`
}

function buildMissingDetails(input: RequestFirstReviewInput): string[] {
  const checklistInput: RequestWorkflowChecklistInput = {
    request: input.request ?? null,
    scheduleRow: input.scheduleRow,
    hasRecipientEmail: input.hasRecipientEmail,
  }
  const workflowMissing = buildRequestWorkflowChecklist(checklistInput)
    .filter((item) => item.state === 'incomplete')
    .map((item) => item.label)

  const playbookMissing =
    buildWorkflowPlaybookSuggestion({
      requestType: input.request?.request_type,
      checklistItems: input.checklistItems,
    })?.missingItems.map((item) => item.itemName) ?? []

  const all = [...workflowMissing, ...playbookMissing]
  const seen = new Set<string>()
  return all
    .filter((item) => {
      const key = item.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 4)
}

export function buildRequestFirstReview(input: RequestFirstReviewInput): RequestFirstReview {
  const workflow = resolveRequestWorkflowV2({
    request: input.request,
    scheduleRow: input.scheduleRow,
    checklistIncomplete: input.checklistIncomplete,
  })
  const communicationNeedsAttention =
    input.communicationCommitment && input.communicationCommitment.status !== 'clear'

  const whyNow = input.careCadence?.reason ||
    (communicationNeedsAttention ? input.communicationCommitment?.reason : '') ||
    workflow.reason

  const missingDetails = buildMissingDetails(input)

  return {
    whatThisIs: buildWhatThisIs(input),
    whyNow,
    doFirst: workflow.nextStepDescription,
    actionHref: `#${workflow.sectionAnchor}`,
    actionLabel: 'Start first review',
    tone: toneFrom({
      workflowUrgency: workflow.urgency,
      careCadence: input.careCadence,
      communicationCommitment: input.communicationCommitment,
    }),
    missingDetails,
  }
}
