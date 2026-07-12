import { findHouseholdDuplicateCandidates } from '@/lib/householdDuplicateReview'
import { findPersonDuplicateCandidates } from '@/lib/personDuplicateReview'
import { recordIdsWithCertificateEvent } from '@/lib/relationshipIntelligence/suggestCertificateForRecord'
import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'
import type { CertificateReadyReminderSignal, DuplicateReviewReminderSignal } from '@/lib/workflowReminderDtos'
import type { HouseholdRow } from '@/lib/types/households'
import type { PersonRow } from '@/lib/types/people'
import type { SacramentalRecordRow } from '@/lib/types/sacramentalRecords'

export type DailyOperatingSystemHealthSignals = {
  duplicateCandidateCount: number
  incompleteSacramentalRecordCount: number
  certificateReadyCount: number
  linkedSacramentalRecordCount: number
  unlinkedSacramentalRecordCount: number
  certificateActivityCount: number
}

export type DailyOperatingSystemSignals = {
  duplicateReview: DuplicateReviewReminderSignal | null
  certificateReady: CertificateReadyReminderSignal[]
  healthSignals: DailyOperatingSystemHealthSignals
}

export type DailyOperatingSystemRecordEventSignal = {
  sacramental_record_id: string
  action: string
}

export function emptyDailyOperatingSystemSignals(): DailyOperatingSystemSignals {
  return {
    duplicateReview: null,
    certificateReady: [],
    healthSignals: {
      duplicateCandidateCount: 0,
      incompleteSacramentalRecordCount: 0,
      certificateReadyCount: 0,
      linkedSacramentalRecordCount: 0,
      unlinkedSacramentalRecordCount: 0,
      certificateActivityCount: 0,
    },
  }
}

function hasText(value: unknown): boolean {
  return String(value ?? '').trim().length > 0
}

function isIncompleteSacramentalRecord(record: SacramentalRecordRow): boolean {
  return (
    !hasText(record.person_name) ||
    !hasText(record.sacrament_date) ||
    !hasText(record.book) ||
    !hasText(record.page) ||
    !hasText(record.line)
  )
}

function isCertificateReviewCandidate(
  record: SacramentalRecordRow,
  recordIdsWithCertificate: ReadonlySet<string>
): boolean {
  return (
    record.record_type === 'baptism' &&
    !recordIdsWithCertificate.has(record.id) &&
    hasText(record.person_name) &&
    hasText(record.sacrament_date) &&
    hasText(record.book) &&
    hasText(record.page) &&
    hasText(record.line)
  )
}

function certificateRecordHref(recordId: string): string {
  return safeDashboardHrefOrFallback(
    `/dashboard/records/${encodeURIComponent(recordId)}`,
    '/dashboard/records'
  )
}

function duplicateReviewHref(input: {
  peopleDuplicateCount: number
  householdDuplicateCount: number
}): string {
  return safeDashboardHrefOrFallback(
    input.peopleDuplicateCount > 0 ? '/dashboard/people/duplicates' : '/dashboard/households/duplicates',
    '/dashboard/people'
  )
}

export function buildDailyOperatingSystemSignals(input: {
  people: readonly PersonRow[]
  households: readonly HouseholdRow[]
  sacramentalRecords: readonly SacramentalRecordRow[]
  sacramentalRecordEvents: readonly DailyOperatingSystemRecordEventSignal[]
  certificateReadyLimit?: number
}): DailyOperatingSystemSignals {
  const peopleDuplicateCount = findPersonDuplicateCandidates([...input.people]).length
  const householdDuplicateCount = findHouseholdDuplicateCandidates([...input.households]).length
  const duplicateCandidateCount = peopleDuplicateCount + householdDuplicateCount

  const recordIdsWithCertificate = recordIdsWithCertificateEvent(input.sacramentalRecordEvents)
  const linkedSacramentalRecordCount = input.sacramentalRecords.filter((record) =>
    hasText(record.request_id)
  ).length
  const unlinkedSacramentalRecordCount =
    input.sacramentalRecords.length - linkedSacramentalRecordCount
  const incompleteSacramentalRecordCount = input.sacramentalRecords.filter(
    isIncompleteSacramentalRecord
  ).length
  const certificateReadyRecords = input.sacramentalRecords.filter((record) =>
    isCertificateReviewCandidate(record, recordIdsWithCertificate)
  )

  const certificateReadyLimit = input.certificateReadyLimit ?? 6
  const certificateReady = certificateReadyRecords
    .slice(0, certificateReadyLimit)
    .map<CertificateReadyReminderSignal>((record) => ({
      id: record.id,
      label: record.person_name || 'Baptism record',
      href: certificateRecordHref(record.id),
      certificateType: 'Baptism',
      ownerLabel: 'Sacramental Coordinator',
      dueAt: record.sacrament_date,
    }))

  return {
    duplicateReview:
      duplicateCandidateCount > 0
        ? {
            peopleCandidateCount: peopleDuplicateCount,
            householdCandidateCount: householdDuplicateCount,
            href: duplicateReviewHref({ peopleDuplicateCount, householdDuplicateCount }),
          }
        : null,
    certificateReady,
    healthSignals: {
      duplicateCandidateCount,
      incompleteSacramentalRecordCount,
      certificateReadyCount: certificateReadyRecords.length,
      linkedSacramentalRecordCount,
      unlinkedSacramentalRecordCount,
      certificateActivityCount: recordIdsWithCertificate.size,
    },
  }
}
