import { formatSacramentalRecordType } from '@/lib/formatSacramentalRecordType'
import type { SacramentalRecordRow, SacramentalRecordType } from '@/lib/types/sacramentalRecords'

export type SacramentalRecordRevisionKind = 'correction' | 'notation'

export type SacramentalRecordRevisionStatus =
  | 'draft_for_staff_review'
  | 'ready_for_authorized_review'
  | 'approved_for_manual_entry'
  | 'entered_by_authorized_staff'
  | 'voided_or_superseded'

export type SacramentalRecordRevisionField =
  | 'person_name'
  | 'sacrament_date'
  | 'place'
  | 'minister'
  | 'book'
  | 'page'
  | 'line'
  | 'notes'
  | 'request_link'
  | 'person_link'
  | 'external_register_reference'

export type SacramentalRecordRevisionDtoInput = {
  record: SacramentalRecordRow
  kind: SacramentalRecordRevisionKind
  status: SacramentalRecordRevisionStatus
  actorLabel: string
  activeParishLabel: string
  now: Date
  affectedFields?: SacramentalRecordRevisionField[]
  requestLabel?: string | null
  reasonLabel?: string | null
  proposedChangeSummary?: string | null
  canonicalReviewerLabel?: string | null
}

export type SacramentalRecordRevisionDto = {
  featureId: 'sacramental_record_revision_v1'
  eventAction: 'sacramental_record_correction_reviewed' | 'sacramental_record_notation_reviewed'
  revisionKind: SacramentalRecordRevisionKind
  recordId: string
  requestId: string | null
  personLabel: string
  recordType: SacramentalRecordType
  recordTypeLabel: string
  status: SacramentalRecordRevisionStatus
  actorLabel: string
  activeParishLabel: string
  createdAt: string
  affectedFields: SacramentalRecordRevisionField[]
  reasonLabel: string | null
  proposedChangeSummary: string | null
  canonicalReviewerLabel: string | null
  requestContinuity: {
    linkedToRequest: boolean
    requestId: string | null
    requestLabel: string | null
    continuityLabel: string
  }
  staffReviewRequired: true
  authorizedRecordReviewRequired: true
  productOwnerApprovalRequiredForRuntime: true
  canonicalDecisionMade: false
  pastoralDecisionMade: false
  sacramentalEligibilityDecided: false
  mutatesSacramentalRecord: false
  generatesCertificateAutomatically: false
  runtimePersistenceApproved: false
  approvalBoundary: {
    allowsPlanningMetadata: true
    allowsRuntimeWrite: false
    allowsRegisterCorrection: false
    allowsCanonicalNotation: false
    requiresSeparateApproval: true
    message: string
  }
  auditMetadata: {
    feature_id: 'sacramental_record_revision_v1'
    event_action: 'sacramental_record_correction_reviewed' | 'sacramental_record_notation_reviewed'
    revision_kind: SacramentalRecordRevisionKind
    record_type: SacramentalRecordType
    status: SacramentalRecordRevisionStatus
    active_parish_label: string
    actor_label: string
    person_label: string
    affected_fields: SacramentalRecordRevisionField[]
    linked_request: boolean
    request_label: string | null
    staff_review_required: true
    authorized_record_review_required: true
    product_owner_approval_required_for_runtime: true
    canonical_decision_made: false
    pastoral_decision_made: false
    sacramental_eligibility_decided: false
    mutates_sacramental_record: false
    generates_certificate_automatically: false
    runtime_persistence_approved: false
    separate_correction_notation_approval_required: true
  }
}

export type SacramentalRecordRevisionDtoResult =
  | { ok: true; revision: SacramentalRecordRevisionDto }
  | { ok: false; error: string }

const SECRET_PATTERNS = [
  'postgresql://',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'GOOGLE_CLIENT_SECRET',
  'OPENAI_API_KEY',
  'access_token',
  'refresh_token',
  'eyJ',
]

const ALLOWED_FIELDS = new Set<SacramentalRecordRevisionField>([
  'person_name',
  'sacrament_date',
  'place',
  'minister',
  'book',
  'page',
  'line',
  'notes',
  'request_link',
  'person_link',
  'external_register_reference',
])

function clean(value: unknown, fallback: string, max = 160): string {
  const label = String(value ?? '').replace(/\s+/g, ' ').trim()
  return (label || fallback).slice(0, max)
}

function cleanNullable(value: unknown, max = 260): string | null {
  const label = String(value ?? '').replace(/\s+/g, ' ').trim()
  return label ? label.slice(0, max) : null
}

function containsSecretMaterial(value: string | null): boolean {
  if (!value) return false
  return SECRET_PATTERNS.some((pattern) => value.includes(pattern))
}

function normalizeAffectedFields(fields: SacramentalRecordRevisionField[] | undefined) {
  const unique = [...new Set(fields ?? [])]
  return unique.filter((field) => ALLOWED_FIELDS.has(field))
}

function actionForKind(kind: SacramentalRecordRevisionKind) {
  return kind === 'correction'
    ? 'sacramental_record_correction_reviewed'
    : 'sacramental_record_notation_reviewed'
}

function boundaryMessage(kind: SacramentalRecordRevisionKind) {
  return kind === 'correction'
    ? 'Correction DTOs describe staff-reviewed correction metadata only; they do not alter sacramental registers.'
    : 'Notation DTOs describe staff-reviewed notation metadata only; they do not add canonical notations.'
}

export function buildSacramentalRecordRevisionDto(
  input: SacramentalRecordRevisionDtoInput
): SacramentalRecordRevisionDtoResult {
  const personLabel = clean(input.record.person_name, 'Sacramental record')
  const actorLabel = clean(input.actorLabel, 'Staff')
  const activeParishLabel = clean(input.activeParishLabel, 'Selected parish')
  const requestLabel = cleanNullable(input.requestLabel)
  const reasonLabel = cleanNullable(input.reasonLabel)
  const proposedChangeSummary = cleanNullable(input.proposedChangeSummary)
  const canonicalReviewerLabel = cleanNullable(input.canonicalReviewerLabel)
  const affectedFields = normalizeAffectedFields(input.affectedFields)

  if (affectedFields.length === 0) {
    return { ok: false, error: 'At least one safe affected field is required.' }
  }

  for (const value of [
    personLabel,
    actorLabel,
    activeParishLabel,
    requestLabel,
    reasonLabel,
    proposedChangeSummary,
    canonicalReviewerLabel,
  ]) {
    if (containsSecretMaterial(value)) {
      return { ok: false, error: 'Sacramental record revision metadata contains unsafe material.' }
    }
  }

  const linkedToRequest = Boolean(input.record.request_id)
  const eventAction = actionForKind(input.kind)
  const requestContinuity = {
    linkedToRequest,
    requestId: input.record.request_id,
    requestLabel,
    continuityLabel: linkedToRequest
      ? 'Connected to the originating request for authorized staff review.'
      : 'No originating request link is present; authorized staff should verify continuity manually.',
  }

  return {
    ok: true,
    revision: {
      featureId: 'sacramental_record_revision_v1',
      eventAction,
      revisionKind: input.kind,
      recordId: input.record.id,
      requestId: input.record.request_id,
      personLabel,
      recordType: input.record.record_type,
      recordTypeLabel: formatSacramentalRecordType(input.record.record_type),
      status: input.status,
      actorLabel,
      activeParishLabel,
      createdAt: input.now.toISOString(),
      affectedFields,
      reasonLabel,
      proposedChangeSummary,
      canonicalReviewerLabel,
      requestContinuity,
      staffReviewRequired: true,
      authorizedRecordReviewRequired: true,
      productOwnerApprovalRequiredForRuntime: true,
      canonicalDecisionMade: false,
      pastoralDecisionMade: false,
      sacramentalEligibilityDecided: false,
      mutatesSacramentalRecord: false,
      generatesCertificateAutomatically: false,
      runtimePersistenceApproved: false,
      approvalBoundary: {
        allowsPlanningMetadata: true,
        allowsRuntimeWrite: false,
        allowsRegisterCorrection: false,
        allowsCanonicalNotation: false,
        requiresSeparateApproval: true,
        message: boundaryMessage(input.kind),
      },
      auditMetadata: {
        feature_id: 'sacramental_record_revision_v1',
        event_action: eventAction,
        revision_kind: input.kind,
        record_type: input.record.record_type,
        status: input.status,
        active_parish_label: activeParishLabel,
        actor_label: actorLabel,
        person_label: personLabel,
        affected_fields: affectedFields,
        linked_request: linkedToRequest,
        request_label: requestLabel,
        staff_review_required: true,
        authorized_record_review_required: true,
        product_owner_approval_required_for_runtime: true,
        canonical_decision_made: false,
        pastoral_decision_made: false,
        sacramental_eligibility_decided: false,
        mutates_sacramental_record: false,
        generates_certificate_automatically: false,
        runtime_persistence_approved: false,
        separate_correction_notation_approval_required: true,
      },
    },
  }
}
