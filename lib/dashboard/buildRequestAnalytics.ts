import { formatRequestType } from '@/lib/formatRequestType'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'

export type RequestTypeBreakdownRow = {
  typeLabel: string
  open: number
  complete: number
  total: number
}

export type RequestAnalytics = {
  totalRequests: number
  openRequests: number
  completedRequests: number
  byType: RequestTypeBreakdownRow[]
}

function isComplete(row: { status?: unknown }): boolean {
  return String(row.status ?? '').trim() === 'complete'
}

/**
 * Request counts by type and status from the loaded parish request list.
 */
export function buildRequestAnalytics(requests: readonly unknown[]): RequestAnalytics {
  const byType = new Map<string, { open: number; complete: number }>()
  let openRequests = 0
  let completedRequests = 0

  for (const raw of requests) {
    const r = raw as { status?: unknown; request_type?: unknown }
    const typeKey = requestTypeFromRow(r)
    const label = formatRequestType(typeKey)
    const bucket = byType.get(label) ?? { open: 0, complete: 0 }

    if (isComplete(r)) {
      completedRequests += 1
      bucket.complete += 1
    } else {
      openRequests += 1
      bucket.open += 1
    }

    byType.set(label, bucket)
  }

  const byTypeRows: RequestTypeBreakdownRow[] = [...byType.entries()]
    .map(([typeLabel, counts]) => ({
      typeLabel,
      open: counts.open,
      complete: counts.complete,
      total: counts.open + counts.complete,
    }))
    .sort((a, b) => b.total - a.total || a.typeLabel.localeCompare(b.typeLabel))

  return {
    totalRequests: requests.length,
    openRequests,
    completedRequests,
    byType: byTypeRows,
  }
}
