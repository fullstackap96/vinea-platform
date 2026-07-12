import { formatSacramentalRecordType } from '@/lib/formatSacramentalRecordType'
import type { SacramentalRecordRow, SacramentalRecordType } from '@/lib/types/sacramentalRecords'

export type CertificateIssuanceStatus =
  | 'ready_for_staff_review'
  | 'generated_for_review'
  | 'issued_to_requester'
  | 'voided_or_replaced'

export type CertificateDeliveryMethod =
  | 'printed'
  | 'picked_up'
  | 'mailed'
  | 'emailed_by_staff'
  | 'internal_review_only'

export type CertificateIssuanceDtoInput = {
  record: SacramentalRecordRow
  certificateType?: string | null
  status: CertificateIssuanceStatus
  deliveryMethod?: CertificateDeliveryMethod | null
  actorLabel: string
  activeParishLabel: string
  now: Date
  requestLabel?: string | null
  staffNote?: string | null
}

export type CertificateIssuanceDto = {
  featureId: 'certificate_issuance_logging_v1'
  eventAction: 'certificate_issuance_reviewed'
  recordId: string
  requestId: string | null
  personLabel: string
  recordType: SacramentalRecordType
  certificateType: string
  status: CertificateIssuanceStatus
  deliveryMethod: CertificateDeliveryMethod | null
  actorLabel: string
  activeParishLabel: string
  createdAt: string
  requestContinuity: {
    linkedToRequest: boolean
    requestId: string | null
    requestLabel: string | null
    continuityLabel: string
  }
  staffNote: string | null
  staffReviewRequired: true
  canonicalDecisionMade: false
  sacramentalEligibilityDecided: false
  certificateGeneratedAutomatically: false
  mutatesSacramentalRecord: false
  correctionOrNotationBoundary: {
    allowsCorrection: false
    allowsNotation: false
    requiresSeparateApproval: true
    message: string
  }
  auditMetadata: {
    feature_id: 'certificate_issuance_logging_v1'
    event_action: 'certificate_issuance_reviewed'
    record_type: SacramentalRecordType
    certificate_type: string
    status: CertificateIssuanceStatus
    delivery_method: CertificateDeliveryMethod | null
    active_parish_label: string
    actor_label: string
    person_label: string
    linked_request: boolean
    request_label: string | null
    staff_review_required: true
    canonical_decision_made: false
    sacramental_eligibility_decided: false
    certificate_generated_automatically: false
    mutates_sacramental_record: false
    correction_or_notation_requires_separate_approval: true
  }
}

export type CertificateIssuanceDtoResult =
  | { ok: true; issuance: CertificateIssuanceDto }
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

function clean(value: unknown, fallback: string, max = 140): string {
  const label = String(value ?? '').replace(/\s+/g, ' ').trim()
  return (label || fallback).slice(0, max)
}

function cleanNullable(value: unknown, max = 240): string | null {
  const label = String(value ?? '').replace(/\s+/g, ' ').trim()
  return label ? label.slice(0, max) : null
}

function containsSecretMaterial(value: string | null): boolean {
  if (!value) return false
  return SECRET_PATTERNS.some((pattern) => value.includes(pattern))
}

function defaultCertificateType(recordType: SacramentalRecordType): string {
  return `${formatSacramentalRecordType(recordType) || 'Sacramental'} certificate`
}

export function buildCertificateIssuanceDto(
  input: CertificateIssuanceDtoInput
): CertificateIssuanceDtoResult {
  const personLabel = clean(input.record.person_name, 'Sacramental record')
  const certificateType = clean(
    input.certificateType,
    defaultCertificateType(input.record.record_type)
  )
  const actorLabel = clean(input.actorLabel, 'Staff')
  const activeParishLabel = clean(input.activeParishLabel, 'Selected parish')
  const requestLabel = cleanNullable(input.requestLabel)
  const staffNote = cleanNullable(input.staffNote)

  for (const value of [personLabel, certificateType, actorLabel, activeParishLabel, requestLabel, staffNote]) {
    if (containsSecretMaterial(value)) {
      return { ok: false, error: 'Certificate issuance metadata contains unsafe material.' }
    }
  }

  const requestId = input.record.request_id
  const linkedToRequest = Boolean(requestId)
  const continuityLabel = linkedToRequest
    ? 'Connected to the originating request for staff review.'
    : 'No originating request link is present; staff should verify continuity manually.'

  return {
    ok: true,
    issuance: {
      featureId: 'certificate_issuance_logging_v1',
      eventAction: 'certificate_issuance_reviewed',
      recordId: input.record.id,
      requestId,
      personLabel,
      recordType: input.record.record_type,
      certificateType,
      status: input.status,
      deliveryMethod: input.deliveryMethod ?? null,
      actorLabel,
      activeParishLabel,
      createdAt: input.now.toISOString(),
      requestContinuity: {
        linkedToRequest,
        requestId,
        requestLabel,
        continuityLabel,
      },
      staffNote,
      staffReviewRequired: true,
      canonicalDecisionMade: false,
      sacramentalEligibilityDecided: false,
      certificateGeneratedAutomatically: false,
      mutatesSacramentalRecord: false,
      correctionOrNotationBoundary: {
        allowsCorrection: false,
        allowsNotation: false,
        requiresSeparateApproval: true,
        message:
          'Certificate issuance logging does not correct sacramental registers or add canonical notations.',
      },
      auditMetadata: {
        feature_id: 'certificate_issuance_logging_v1',
        event_action: 'certificate_issuance_reviewed',
        record_type: input.record.record_type,
        certificate_type: certificateType,
        status: input.status,
        delivery_method: input.deliveryMethod ?? null,
        active_parish_label: activeParishLabel,
        actor_label: actorLabel,
        person_label: personLabel,
        linked_request: linkedToRequest,
        request_label: requestLabel,
        staff_review_required: true,
        canonical_decision_made: false,
        sacramental_eligibility_decided: false,
        certificate_generated_automatically: false,
        mutates_sacramental_record: false,
        correction_or_notation_requires_separate_approval: true,
      },
    },
  }
}
