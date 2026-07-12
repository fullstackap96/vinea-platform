import type { SacramentalRecordRow } from '@/lib/types/sacramentalRecords'
import { safeDashboardHrefOrFallback } from './safeDashboardHref'

export type SacramentalRecordContinuityHandoff = {
  personName: string
  searchHref: string
  reviewQueueHref: string
  title: string
  summary: string
  staffGuidance: string[]
  boundaryNote: string
}

function normalizePersonName(value: unknown) {
  return String(value ?? '').trim().replace(/\s+/g, ' ')
}

function pathWithQuery(pathname: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) searchParams.set(key, value)
  }

  const query = searchParams.toString()
  return query ? `${pathname}?${query}` : pathname
}

export function buildSacramentalRecordContinuityHandoff(
  record: Pick<SacramentalRecordRow, 'request_id' | 'person_name'>
): SacramentalRecordContinuityHandoff | null {
  if (String(record.request_id ?? '').trim()) return null

  const personName = normalizePersonName(record.person_name)
  if (!personName) return null

  return {
    personName,
    searchHref: safeDashboardHrefOrFallback(
      pathWithQuery('/dashboard/search', { q: personName }),
      '/dashboard/search',
    ),
    reviewQueueHref: safeDashboardHrefOrFallback(
      pathWithQuery('/dashboard/records', {
        continuity: 'needs_review',
        q: personName,
      }),
      '/dashboard/records?continuity=needs_review',
    ),
    title: 'Continuity handoff',
    summary:
      'Search existing parish request and person records for possible context before deciding how to handle this unlinked register entry.',
    staffGuidance: [
      'Compare names, dates, family context, and request history before treating anything as related.',
      'Open any possible match for review; do not assume a match from name alone.',
      'Leave the sacramental record unchanged unless an approved staff workflow says otherwise.',
    ],
    boundaryNote:
      'This handoff is read-only. It does not link requests, change records, generate certificates, or decide whether anything should be issued.',
  }
}
