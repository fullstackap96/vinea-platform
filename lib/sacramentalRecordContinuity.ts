import type {
  SacramentalRecordEventRow,
  SacramentalRecordRow,
  SacramentalRecordType,
} from '@/lib/types/sacramentalRecords'
import { safeDashboardHrefOrFallback } from './safeDashboardHref'

export type SacramentalRecordContinuityState =
  | 'linked_request_verified'
  | 'record_without_request_manual_review'

export type SacramentalRecordCertificateState =
  | 'certificate_activity_recorded'
  | 'baptism_certificate_available_for_review'
  | 'future_certificate_type_planned'

export type SacramentalRecordContinuityView = {
  state: SacramentalRecordContinuityState
  title: string
  summary: string
  linkedRequestHref: string | null
  certificateState: SacramentalRecordCertificateState
  certificateTitle: string
  certificateSummary: string
  staffGuidance: string[]
  boundaryNote: string
}

const CERTIFICATE_LABELS: Record<SacramentalRecordType, string> = {
  baptism: 'Baptism certificate',
  confirmation: 'Confirmation certificate',
  first_communion: 'First Communion certificate',
  marriage: 'Marriage certificate',
  ocia: 'OCIA initiation or reception certificate',
  rcic: 'RCIC initiation or reception certificate',
  funeral: 'Funeral record certificate or status letter',
}

function hasCertificateActivity(events: readonly Pick<SacramentalRecordEventRow, 'action'>[]) {
  return events.some(
    (event) => String(event.action ?? '').trim().toLowerCase() === 'certificate_generated'
  )
}

function certificateLabel(recordType: SacramentalRecordType) {
  return CERTIFICATE_LABELS[recordType] ?? 'Certificate or record extract'
}

export function buildSacramentalRecordContinuityView(input: {
  record: Pick<SacramentalRecordRow, 'request_id' | 'record_type'>
  events?: readonly Pick<SacramentalRecordEventRow, 'action'>[]
}): SacramentalRecordContinuityView {
  const requestId = String(input.record.request_id ?? '').trim()
  const linkedRequestHref = requestId
    ? safeDashboardHrefOrFallback(
        `/dashboard/requests/${encodeURIComponent(requestId)}`,
        '/dashboard/requests',
      )
    : null
  const certificateActivityRecorded = hasCertificateActivity(input.events ?? [])
  const certificateName = certificateLabel(input.record.record_type)

  const state: SacramentalRecordContinuityState = linkedRequestHref
    ? 'linked_request_verified'
    : 'record_without_request_manual_review'

  const certificateState: SacramentalRecordCertificateState = certificateActivityRecorded
    ? 'certificate_activity_recorded'
    : input.record.record_type === 'baptism'
      ? 'baptism_certificate_available_for_review'
      : 'future_certificate_type_planned'

  return {
    state,
    title: linkedRequestHref ? 'Linked request present' : 'No request link found',
    summary: linkedRequestHref
      ? 'This record is connected to an originating Vinea request. Staff can open the request to review preparation context and family communication history.'
      : 'This record does not have an originating Vinea request link. Please verify continuity manually before treating certificate work as ready.',
    linkedRequestHref,
    certificateState,
    certificateTitle: certificateActivityRecorded
      ? 'Certificate activity recorded'
      : input.record.record_type === 'baptism'
        ? 'Baptism certificate can be prepared for staff review'
        : `${certificateName} planning only`,
    certificateSummary: certificateActivityRecorded
      ? 'A certificate generation event exists for this record. Staff should review the activity history before reissuing, voiding, or replacing anything.'
      : input.record.record_type === 'baptism'
        ? 'Vinea can open the existing baptism certificate generator, but staff still review the register and parish policy before issuing anything.'
        : `${certificateName} support is planned but not live. Staff should use the parish's current manual process for now.`,
    staffGuidance: linkedRequestHref
      ? [
          'Open the linked request before issuing or reissuing a certificate.',
          'Confirm the register details against parish policy.',
          'Use staff judgment for any pastoral, canonical, or eligibility question.',
        ]
      : [
          'Verify the register manually before certificate work.',
          'Look for related people, household, or request history if needed.',
          'Do not assume a missing request link means the record is incomplete.',
        ],
    boundaryNote:
      'Vinea does not decide eligibility, canonical status, pastoral readiness, or whether a certificate should be issued.',
  }
}
