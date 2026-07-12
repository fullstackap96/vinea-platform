import type { SacramentalRecordRow } from '@/lib/types/sacramentalRecords'

export type SacramentalRecordsContinuityFilter =
  | ''
  | 'needs_review'
  | 'linked_request'
  | 'certificate_activity'

export type SacramentalRecordsContinuitySummary = {
  totalRecords: number
  linkedRequestCount: number
  needsReviewCount: number
  certificateActivityCount: number
  certificateActivityWithoutRequestLinkCount: number
  boundaryNote: string
}

type ContinuityRecord = Pick<SacramentalRecordRow, 'id' | 'request_id'>

const FILTER_VALUES = new Set<SacramentalRecordsContinuityFilter>([
  'needs_review',
  'linked_request',
  'certificate_activity',
])

export const EMPTY_SACRAMENTAL_RECORDS_CONTINUITY_SUMMARY: SacramentalRecordsContinuitySummary = {
  totalRecords: 0,
  linkedRequestCount: 0,
  needsReviewCount: 0,
  certificateActivityCount: 0,
  certificateActivityWithoutRequestLinkCount: 0,
  boundaryNote:
    'Vinea does not decide eligibility, canonical status, pastoral readiness, or whether a certificate should be issued.',
}

function hasRequestLink(record: Pick<SacramentalRecordRow, 'request_id'>) {
  return String(record.request_id ?? '').trim().length > 0
}

function normalizeRecordId(value: unknown) {
  return String(value ?? '').trim()
}

export function normalizeSacramentalRecordsContinuityFilter(
  value: unknown
): SacramentalRecordsContinuityFilter {
  const raw = Array.isArray(value) ? value[0] : value
  const key = String(raw ?? '').trim().toLowerCase()
  return FILTER_VALUES.has(key as SacramentalRecordsContinuityFilter)
    ? (key as SacramentalRecordsContinuityFilter)
    : ''
}

export function buildSacramentalRecordsContinuitySummary(input: {
  records: readonly ContinuityRecord[]
  certificateRecordIds?: Iterable<unknown>
}): SacramentalRecordsContinuitySummary {
  const certificateRecordIdSet = new Set(
    Array.from(input.certificateRecordIds ?? [])
      .map(normalizeRecordId)
      .filter(Boolean)
  )

  let linkedRequestCount = 0
  let certificateActivityCount = 0
  let certificateActivityWithoutRequestLinkCount = 0

  for (const record of input.records) {
    const linkedToRequest = hasRequestLink(record)
    if (linkedToRequest) {
      linkedRequestCount += 1
    }

    if (certificateRecordIdSet.has(normalizeRecordId(record.id))) {
      certificateActivityCount += 1
      if (!linkedToRequest) {
        certificateActivityWithoutRequestLinkCount += 1
      }
    }
  }

  return {
    ...EMPTY_SACRAMENTAL_RECORDS_CONTINUITY_SUMMARY,
    totalRecords: input.records.length,
    linkedRequestCount,
    needsReviewCount: input.records.length - linkedRequestCount,
    certificateActivityCount,
    certificateActivityWithoutRequestLinkCount,
  }
}

export function filterSacramentalRecordsByContinuity<
  TRecord extends Pick<SacramentalRecordRow, 'id' | 'request_id'>,
>(
  records: readonly TRecord[],
  filter: SacramentalRecordsContinuityFilter,
  certificateRecordIds?: Iterable<unknown>
): TRecord[] {
  if (!filter) return [...records]

  const certificateRecordIdSet = new Set(
    Array.from(certificateRecordIds ?? [])
      .map(normalizeRecordId)
      .filter(Boolean)
  )

  return records.filter((record) => {
    if (filter === 'needs_review') return !hasRequestLink(record)
    if (filter === 'linked_request') return hasRequestLink(record)
    if (filter === 'certificate_activity') {
      return certificateRecordIdSet.has(normalizeRecordId(record.id))
    }
    return true
  })
}
