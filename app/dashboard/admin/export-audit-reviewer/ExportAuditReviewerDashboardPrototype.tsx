'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { secondaryButtonSm } from '@/lib/buttonStyles'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import {
  vineaEmptyStateClassName,
  vineaSectionShellClassName,
  vineaSpinnerClassName,
} from '@/lib/vineaUi'

const EXPORT_AUDIT_REVIEWER_READ_TIMEOUT_MS = 15_000

const savedFilterLabels: Record<string, string> = {
  exports_downloaded_recent: 'Downloaded',
  exports_denied_recent: 'Denied',
  exports_blocked_field_attempts: 'Blocked fields',
  exports_cross_parish_or_forged_scope: 'Cross-parish',
  exports_family_or_unauthenticated: 'Family or anonymous',
  exports_after_rollback: 'After rollback',
  exports_metadata_incomplete: 'Incomplete metadata',
  document_manifest_safety_review: 'Document manifest',
  request_list_basic_safety_review: 'Request list',
  repeated_denials_by_actor: 'Repeated denials',
}

type Severity = 'none' | 'severity_3' | 'severity_2' | 'severity_1'

type ReviewerRow = {
  event_action?: string
  export_route_id?: string
  export_preset_id?: string
  target_object_type?: string
  target_object_id_label?: string
  decision?: string
  http_status?: number | null
  denied_reason_code?: string | null
  runtime_gate_state?: string
  runtime_environment_label?: string
  staff_email_label?: string
  active_parish_name_label?: string
  parish_ids_included_count?: number | null
  membership_scope_status?: string
  request_ownership_status?: string
  requested_active_parish_cookie_present?: boolean
  requested_fields_count?: number | null
  blocked_fields_requested_count?: number | null
  disallowed_fields_count?: number | null
  row_count_bucket?: string
  delivery_format?: string
  csv_header_approved?: boolean | null
  manifest_only?: boolean
  safe_metadata_only?: boolean
  secret_marker_scan_status?: string
  file_material_marker_scan_status?: string
  family_or_unauthenticated_boundary?: boolean
  cross_parish_boundary?: boolean
  blocked_field_boundary?: boolean
  post_rollback_boundary?: boolean
  metadata_completeness_status?: string
  review_status?: string
  severity?: Severity
  reviewer_label?: string
  evidence_reference?: string
  follow_up_reference?: string | null
  rollback_required?: boolean
  incident_response_required?: boolean
  saved_filters?: string[]
  suspicious_rules?: string[]
}

type SeverityCount = {
  severity?: Severity
  count?: number
}

type ReviewerResponse = {
  ok?: boolean
  prototype?: {
    state?: string
    environment?: string
    productionExports?: string
  }
  scope?: {
    activeParishName?: string
    source?: string
  }
  filters?: {
    available?: string[]
    selected?: string | null
    rowCount?: number
    severityCounts?: SeverityCount[]
  }
  rows?: ReviewerRow[]
  error?: string
}

type Counts = {
  downloaded: number
  denied: number
  blockedFields: number
  crossParish: number
  familyOrAnonymous: number
  incompleteMetadata: number
}

function cleanText(value: unknown, fallback = 'Not recorded') {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  return text || fallback
}

function yesNo(value: unknown) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return 'Not recorded'
}

function severityClassName(severity: Severity | undefined) {
  if (severity === 'severity_1') return 'border-red-200 bg-red-50 text-red-900'
  if (severity === 'severity_2') return 'border-amber-200 bg-amber-50 text-amber-900'
  if (severity === 'severity_3') return 'border-blue-200 bg-blue-50 text-blue-900'
  return 'border-emerald-200 bg-emerald-50 text-emerald-900'
}

function badgeClassName(value: string) {
  if (value === 'denied') return 'border-amber-200 bg-amber-50 text-amber-900'
  if (value === 'downloaded') return 'border-blue-200 bg-blue-50 text-blue-900'
  if (value === 'needs_escalation') return 'border-red-200 bg-red-50 text-red-900'
  if (value === 'needs_review') return 'border-amber-200 bg-amber-50 text-amber-900'
  return 'border-gray-200 bg-gray-50 text-gray-700'
}

function summarizeCounts(rows: ReviewerRow[]): Counts {
  return rows.reduce<Counts>(
    (counts, row) => ({
      downloaded: counts.downloaded + (row.decision === 'downloaded' ? 1 : 0),
      denied: counts.denied + (row.decision === 'denied' ? 1 : 0),
      blockedFields: counts.blockedFields + (row.blocked_field_boundary ? 1 : 0),
      crossParish: counts.crossParish + (row.cross_parish_boundary ? 1 : 0),
      familyOrAnonymous:
        counts.familyOrAnonymous + (row.family_or_unauthenticated_boundary ? 1 : 0),
      incompleteMetadata:
        counts.incompleteMetadata + (row.metadata_completeness_status === 'incomplete' ? 1 : 0),
    }),
    {
      downloaded: 0,
      denied: 0,
      blockedFields: 0,
      crossParish: 0,
      familyOrAnonymous: 0,
      incompleteMetadata: 0,
    }
  )
}

function countCard(label: string, value: number) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm" key={label}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-950">{value}</p>
    </div>
  )
}

export function ExportAuditReviewerDashboardPrototype() {
  const [data, setData] = useState<ReviewerResponse | null>(null)
  const [selectedFilter, setSelectedFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadedAt, setLoadedAt] = useState('')
  const loadSequenceRef = useRef(0)
  const loadAbortRef = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    const loadSequence = ++loadSequenceRef.current
    loadAbortRef.current?.abort()
    const controller = new AbortController()
    loadAbortRef.current = controller
    const isLatestLoad = () => loadSequence === loadSequenceRef.current
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      EXPORT_AUDIT_REVIEWER_READ_TIMEOUT_MS,
    )

    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (selectedFilter) params.set('filter', selectedFilter)
      const response = await fetch(`/api/export-audit-reviewer?${params.toString()}`, {
        credentials: 'include',
        cache: 'no-store',
        signal: controller.signal,
      })
      const body = (await response.json().catch(() => ({}))) as ReviewerResponse
      controller.signal.throwIfAborted()
      if (!isLatestLoad()) return
      if (!response.ok || !body.ok) {
        setData(null)
        setError('Export audit reviewer is unavailable for this staff session.')
        return
      }
      setData(body)
      setLoadedAt(new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }))
    } catch {
      if (!isLatestLoad()) return
      setData(null)
      setError('Export audit reviewer is unavailable for this staff session.')
    } finally {
      window.clearTimeout(timeoutId)
      if (isLatestLoad()) setLoading(false)
      if (loadAbortRef.current === controller) loadAbortRef.current = null
    }
  }, [selectedFilter])

  function selectFilter(nextFilter: string) {
    if (nextFilter === selectedFilter) return
    loadSequenceRef.current += 1
    loadAbortRef.current?.abort()
    loadAbortRef.current = null
    setSelectedFilter(nextFilter)
  }

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) void load()
    })
    return () => {
      cancelled = true
      loadSequenceRef.current += 1
      loadAbortRef.current?.abort()
      loadAbortRef.current = null
    }
  }, [load])

  const rows = useMemo(() => (Array.isArray(data?.rows) ? data.rows : []), [data?.rows])
  const counts = useMemo(() => summarizeCounts(rows), [rows])
  const availableFilters = Array.isArray(data?.filters?.available) ? data.filters.available : []
  const severityCounts = Array.isArray(data?.filters?.severityCounts)
    ? data.filters.severityCounts
    : []

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Non-production prototype
        </p>
        <h1 className={`${sectionHeadingClassName} mt-1`}>Export Audit Reviewer</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
          Review safe summaries of export audit activity for the selected parish. This prototype
          reads only from the protected export audit reviewer API.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-950">
            Parish scope: {cleanText(data?.scope?.activeParishName, loading ? 'Loading' : 'Unavailable')}
          </span>
          <span className="inline-flex rounded-full border border-purple-100 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-950">
            Prototype: {cleanText(data?.prototype?.state, 'Flag gated')}
          </span>
          <span className="inline-flex rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-950">
            Production exports: {cleanText(data?.prototype?.productionExports, 'NO-GO')}
          </span>
          {loadedAt ? (
            <span className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
              Loaded {loadedAt}
            </span>
          ) : null}
        </div>
      </div>

      <section className={vineaSectionShellClassName} aria-busy={loading}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => selectFilter('')}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                selectedFilter === ''
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              All
            </button>
            {availableFilters.map((filterId) => (
              <button
                key={filterId}
                type="button"
                onClick={() => selectFilter(filterId)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                  selectedFilter === filterId
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {savedFilterLabels[filterId] ?? filterId.replaceAll('_', ' ')}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => void load()} className={secondaryButtonSm}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="mt-6 flex items-center gap-3 text-sm font-medium text-gray-700">
            <span className={vineaSpinnerClassName} aria-hidden />
            Loading export audit reviewer...
          </div>
        ) : error ? (
          <div
            className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            role="alert"
          >
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div className={`${vineaEmptyStateClassName} mt-6`}>
            <p className="font-semibold text-gray-900">No export audit summaries found.</p>
            <p className="mt-2 text-sm text-gray-600">
              Try a different saved filter or confirm the non-production reviewer API has safe
              audit events for the selected parish.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              {countCard('Downloaded', counts.downloaded)}
              {countCard('Denied', counts.denied)}
              {countCard('Blocked fields', counts.blockedFields)}
              {countCard('Cross-parish', counts.crossParish)}
              {countCard('Family/anonymous', counts.familyOrAnonymous)}
              {countCard('Incomplete', counts.incompleteMetadata)}
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
              {severityCounts.map((item) => (
                <span
                  key={item.severity ?? 'unknown'}
                  className={`inline-flex rounded-full border px-3 py-1 font-medium ${severityClassName(
                    item.severity
                  )}`}
                >
                  {cleanText(item.severity)}: {Number(item.count ?? 0)}
                </span>
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Decision</th>
                      <th className="px-4 py-3">Route</th>
                      <th className="px-4 py-3">Scope</th>
                      <th className="px-4 py-3">Safety</th>
                      <th className="px-4 py-3">Review</th>
                      <th className="px-4 py-3">Follow-up</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((row, index) => {
                      const decision = cleanText(row.decision, 'malformed')
                      const reviewStatus = cleanText(row.review_status)
                      return (
                        <tr key={`${row.export_preset_id ?? 'row'}-${index}`} className="align-top">
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClassName(
                                decision
                              )}`}
                            >
                              {decision}
                            </span>
                            <p className="mt-2 text-xs text-gray-500">
                              HTTP {cleanText(row.http_status)}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-medium text-gray-950">
                              {cleanText(row.export_preset_id)}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {cleanText(row.export_route_id)}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Target: {cleanText(row.target_object_type)} /{' '}
                              {cleanText(row.target_object_id_label)}
                            </p>
                          </td>
                          <td className="px-4 py-4 text-gray-700">
                            <p>Parish: {cleanText(row.active_parish_name_label)}</p>
                            <p className="mt-1">Membership: {cleanText(row.membership_scope_status)}</p>
                            <p className="mt-1">
                              Ownership: {cleanText(row.request_ownership_status)}
                            </p>
                            <p className="mt-1">
                              Active parish cookie: {yesNo(row.requested_active_parish_cookie_present)}
                            </p>
                          </td>
                          <td className="px-4 py-4 text-gray-700">
                            <p>Safe metadata: {yesNo(row.safe_metadata_only)}</p>
                            <p className="mt-1">
                              Secret scan: {cleanText(row.secret_marker_scan_status)}
                            </p>
                            <p className="mt-1">
                              File scan: {cleanText(row.file_material_marker_scan_status)}
                            </p>
                            <p className="mt-1">Manifest only: {yesNo(row.manifest_only)}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${severityClassName(
                                row.severity
                              )}`}
                            >
                              {cleanText(row.severity)}
                            </span>
                            <p className="mt-2 text-sm text-gray-700">{reviewStatus}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              Metadata: {cleanText(row.metadata_completeness_status)}
                            </p>
                          </td>
                          <td className="px-4 py-4 text-gray-700">
                            <p>Rollback: {yesNo(row.rollback_required)}</p>
                            <p className="mt-1">Incident response: {yesNo(row.incident_response_required)}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              Rules: {row.suspicious_rules?.length ?? 0}
                            </p>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
