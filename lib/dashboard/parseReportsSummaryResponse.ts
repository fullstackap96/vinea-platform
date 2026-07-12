import type { RequestAnalytics } from './buildRequestAnalytics'
import type { ParishInsights } from '@/lib/dashboardParishInsights'
import type { StaffWorkloadRow } from '@/lib/dashboardStaffWorkload'

export type ReportsSummary = {
  requestAnalytics: RequestAnalytics
  parishInsights: ParishInsights
  staffWorkloadRows: StaffWorkloadRow[]
}

export type ReportsSummaryResponse =
  | { ok: true; summary: ReportsSummary; warnings: string[] }
  | { ok: false; fetchFailed: boolean; error: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function nonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0
}

function parseRequestAnalytics(value: unknown): RequestAnalytics | null {
  if (!isRecord(value) || !Array.isArray(value.byType)) return null
  if (
    !nonNegativeInteger(value.totalRequests) ||
    !nonNegativeInteger(value.openRequests) ||
    !nonNegativeInteger(value.completedRequests) ||
    value.totalRequests !== value.openRequests + value.completedRequests
  ) {
    return null
  }
  const byType = [] as RequestAnalytics['byType']
  for (const rawRow of value.byType) {
    if (!isRecord(rawRow)) return null
    if (
      typeof rawRow.typeLabel !== 'string' ||
      !nonNegativeInteger(rawRow.open) ||
      !nonNegativeInteger(rawRow.complete) ||
      !nonNegativeInteger(rawRow.total) ||
      rawRow.total !== rawRow.open + rawRow.complete
    ) {
      return null
    }
    byType.push({
      typeLabel: rawRow.typeLabel,
      open: rawRow.open,
      complete: rawRow.complete,
      total: rawRow.total,
    })
  }
  if (byType.reduce((sum, row) => sum + row.total, 0) !== value.totalRequests) return null
  return {
    totalRequests: value.totalRequests,
    openRequests: value.openRequests,
    completedRequests: value.completedRequests,
    byType,
  }
}

function parseParishInsights(value: unknown): ParishInsights | null {
  if (!isRecord(value)) return null
  if (
    !nonNegativeInteger(value.totalOpenRequests) ||
    !nonNegativeInteger(value.submittedThisWeek) ||
    (value.averageOpenAgeDays !== null &&
      (typeof value.averageOpenAgeDays !== 'number' ||
        !Number.isFinite(value.averageOpenAgeDays) ||
        value.averageOpenAgeDays < 0)) ||
    (value.mostCommonRequestTypeLabel !== null &&
      typeof value.mostCommonRequestTypeLabel !== 'string') ||
    !nonNegativeInteger(value.overdueFollowUps) ||
    !nonNegativeInteger(value.unassignedOpenRequests)
  ) {
    return null
  }
  return value as ParishInsights
}

function parseStaffWorkload(value: unknown): StaffWorkloadRow[] | null {
  if (!Array.isArray(value)) return null
  const rows: StaffWorkloadRow[] = []
  for (const rawRow of value) {
    if (!isRecord(rawRow) || typeof rawRow.staffDisplay !== 'string') return null
    const countKeys = [
      'openRequests',
      'overdueFollowUps',
      'actionRequired',
      'blockedRequests',
      'agingRequests',
      'upcomingScheduled',
    ] as const
    if (countKeys.some((key) => !nonNegativeInteger(rawRow[key]))) return null
    rows.push(rawRow as StaffWorkloadRow)
  }
  return rows
}

export function parseReportsSummaryResponse(value: unknown): ReportsSummaryResponse | null {
  if (!isRecord(value) || typeof value.ok !== 'boolean') return null
  if (!value.ok) {
    if (typeof value.fetchFailed !== 'boolean' || typeof value.error !== 'string') return null
    return { ok: false, fetchFailed: value.fetchFailed, error: value.error }
  }
  if (!isRecord(value.summary) || !Array.isArray(value.warnings)) return null
  if (value.warnings.some((warning) => typeof warning !== 'string')) return null
  const requestAnalytics = parseRequestAnalytics(value.summary.requestAnalytics)
  const parishInsights = parseParishInsights(value.summary.parishInsights)
  const staffWorkloadRows = parseStaffWorkload(value.summary.staffWorkloadRows)
  if (!requestAnalytics || !parishInsights || !staffWorkloadRows) return null
  return {
    ok: true,
    summary: { requestAnalytics, parishInsights, staffWorkloadRows },
    warnings: value.warnings,
  }
}
