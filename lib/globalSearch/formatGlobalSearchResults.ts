import { formatSacramentalRecordType } from '@/lib/formatSacramentalRecordType'
import { formatRequestType } from '@/lib/formatRequestType'
import { formatHouseholdAddressLine } from '@/lib/households'
import { formatPersonDisplayName } from '@/lib/people'
import { getRequestDetailPrimaryHeading } from '@/lib/requestDetailIdentity'
import { getStatusLabel } from '@/lib/requestStatus'
import { formatSacramentDateDisplay } from '@/lib/sacramentalRecords'
import type {
  GlobalSearchGroupedResults,
  GlobalSearchLoadResult,
  GlobalSearchRawData,
  GlobalSearchResultItem,
} from './types'

function formatPersonContext(person: GlobalSearchRawData['people'][number]): string {
  const contact = [person.email, person.phone].filter(Boolean).join(' · ')
  if (contact && person.primaryHouseholdName) {
    return `${contact} · ${person.primaryHouseholdName} household`
  }
  if (contact) return contact
  if (person.primaryHouseholdName) return `${person.primaryHouseholdName} household`
  return 'Parishioner profile'
}

function formatHouseholdContext(household: GlobalSearchRawData['households'][number]): string {
  const address = formatHouseholdAddressLine(household)
  const memberLabel =
    household.memberCount === 1
      ? '1 member'
      : `${household.memberCount} members`
  if (address) return `${address} · ${memberLabel}`
  return memberLabel
}

function formatRecordContext(record: GlobalSearchRawData['records'][number]): string {
  const dateLabel = formatSacramentDateDisplay(record.sacrament_date)
  if (dateLabel) return `Sacrament date: ${dateLabel}`
  return 'Sacramental register entry'
}

function formatRequestContext(request: GlobalSearchRawData['requests'][number]): string {
  const statusLabel = getStatusLabel(request.status)
  const contact =
    String(request.parishioner?.full_name ?? '').trim() ||
    String(request.parishioner?.email ?? '').trim() ||
    'Contact on file'
  return `${statusLabel} · Contact: ${contact}`
}

export function formatGlobalSearchGroupedResults(
  raw: GlobalSearchRawData
): GlobalSearchGroupedResults {
  return {
    requests: raw.requests.map(
      (request): GlobalSearchResultItem => ({
        title: getRequestDetailPrimaryHeading({
          request_type: request.request_type,
          child_name: request.child_name,
          parishioner: request.parishioner,
          funeralDetail: request.funeral_detail,
          weddingDetail: request.wedding_detail,
        }),
        typeLabel: `${formatRequestType(request.request_type)} request`,
        context: formatRequestContext(request),
        href: `/dashboard/requests/${request.id}`,
      })
    ),
    people: raw.people.map(
      (person): GlobalSearchResultItem => ({
        title: formatPersonDisplayName(person),
        typeLabel: 'Person',
        context: formatPersonContext(person),
        href: `/dashboard/people/${person.id}`,
      })
    ),
    households: raw.households.map(
      (household): GlobalSearchResultItem => ({
        title: household.name,
        typeLabel: 'Household',
        context: formatHouseholdContext(household),
        href: `/dashboard/households/${household.id}`,
      })
    ),
    records: raw.records.map(
      (record): GlobalSearchResultItem => ({
        title: record.person_name,
        typeLabel: `${formatSacramentalRecordType(record.record_type)} record`,
        context: formatRecordContext(record),
        href: `/dashboard/records/${record.id}`,
      })
    ),
  }
}

export function formatGlobalSearchResponse(loadResult: GlobalSearchLoadResult): {
  query: string
  errorMessage: string
  totalCount: number
  results: GlobalSearchGroupedResults
} {
  return {
    query: loadResult.query,
    errorMessage: loadResult.errorMessage,
    totalCount: loadResult.totalCount,
    results: formatGlobalSearchGroupedResults(loadResult.raw),
  }
}
