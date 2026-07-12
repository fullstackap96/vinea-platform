import { NextResponse, type NextRequest } from 'next/server'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import {
  buildExportAuditReviewerReadModel,
  type ExportAuditReviewerReadModelRow,
  type ExportAuditReviewerSavedFilterId,
  type ExportAuditReviewerSeverity,
  type ExportAuditReviewerSourceEvent,
} from '@/lib/server/exportAuditReviewerReadModel'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

export const runtime = 'nodejs'

type AdminClient = ReturnType<typeof createSupabaseServiceRoleClient>
type StaffSupabaseClient = Parameters<typeof resolveActiveStaffParishContext>[0]

const REVIEWER_PROTOTYPE_FLAG = 'VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE'
const REVIEWER_PROTOTYPE_ACK_FLAG = 'VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK'
const REVIEWER_PROTOTYPE_ENV_FLAG = 'VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV'
const REVIEWER_PROTOTYPE_ENABLED_VALUE = 'ENABLED'
const REVIEWER_PROTOTYPE_ACK_VALUE = 'APPROVED_EXPORT_AUDIT_REVIEWER_QA'
const REVIEWER_PROTOTYPE_NON_PRODUCTION_VALUE = 'NON_PRODUCTION'

const approvedExportAuditActions = [
  'export.request_list_basic.downloaded',
  'export.request_list_basic.denied',
  'export.request_document_manifest.downloaded',
  'export.request_document_manifest.denied',
] as const

const savedFilterIds: readonly ExportAuditReviewerSavedFilterId[] = [
  'exports_downloaded_recent',
  'exports_denied_recent',
  'exports_blocked_field_attempts',
  'exports_cross_parish_or_forged_scope',
  'exports_family_or_unauthenticated',
  'exports_after_rollback',
  'exports_metadata_incomplete',
  'document_manifest_safety_review',
  'request_list_basic_safety_review',
  'repeated_denials_by_actor',
] as const

const severityIds: readonly ExportAuditReviewerSeverity[] = [
  'none',
  'severity_3',
  'severity_2',
  'severity_1',
] as const

const genericReviewerBlockedReason = 'Export audit reviewer is unavailable.'

type ReviewerPrototypeGateState =
  | 'disabled'
  | 'enabled_non_production'
  | 'blocked_missing_ack'
  | 'blocked_wrong_environment'
  | 'blocked_production_environment'

type ReviewerPrototypeGate = {
  enabled: boolean
  state: ReviewerPrototypeGateState
}

type ReviewerPrototypeEnv = Record<string, string | undefined>

function activeParishCookie(request: NextRequest): string | null {
  return request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
}

function isProductionEnvironment(env: ReviewerPrototypeEnv): boolean {
  return env.NODE_ENV === 'production' || env.VERCEL_ENV === 'production'
}

function getReviewerPrototypeGate(env: ReviewerPrototypeEnv = process.env): ReviewerPrototypeGate {
  const runtimeEnabled = env[REVIEWER_PROTOTYPE_FLAG] === REVIEWER_PROTOTYPE_ENABLED_VALUE
  const ackApproved = env[REVIEWER_PROTOTYPE_ACK_FLAG] === REVIEWER_PROTOTYPE_ACK_VALUE
  const nonProductionApproved =
    env[REVIEWER_PROTOTYPE_ENV_FLAG] === REVIEWER_PROTOTYPE_NON_PRODUCTION_VALUE

  let state: ReviewerPrototypeGateState = 'disabled'

  if (runtimeEnabled && isProductionEnvironment(env)) {
    state = 'blocked_production_environment'
  } else if (runtimeEnabled && !ackApproved) {
    state = 'blocked_missing_ack'
  } else if (runtimeEnabled && !nonProductionApproved) {
    state = 'blocked_wrong_environment'
  } else if (runtimeEnabled) {
    state = 'enabled_non_production'
  }

  return {
    enabled: state === 'enabled_non_production',
    state,
  }
}

function parseLimit(value: string | null): number {
  if (!value) return 100
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 100
  return Math.min(Math.max(Math.trunc(parsed), 1), 200)
}

function parseSavedFilter(value: string | null): ExportAuditReviewerSavedFilterId | null {
  if (!value) return null
  return savedFilterIds.includes(value as ExportAuditReviewerSavedFilterId)
    ? (value as ExportAuditReviewerSavedFilterId)
    : null
}

function applySavedFilter(
  rows: readonly ExportAuditReviewerReadModelRow[],
  filterId: ExportAuditReviewerSavedFilterId | null
): readonly ExportAuditReviewerReadModelRow[] {
  if (!filterId) return rows
  return rows.filter((row) => row.saved_filters.includes(filterId))
}

function severityCounts(rows: readonly ExportAuditReviewerReadModelRow[]) {
  const counts: Record<ExportAuditReviewerSeverity, number> = {
    none: 0,
    severity_3: 0,
    severity_2: 0,
    severity_1: 0,
  }

  for (const row of rows) {
    counts[row.severity] += 1
  }

  return severityIds.map((severity) => ({ severity, count: counts[severity] }))
}

async function resolveReviewerParishContext(
  supabase: StaffSupabaseClient,
  requestedParishId: string | null
) {
  const activeParishContext = await resolveActiveStaffParishContext(supabase, {
    requestedParishId,
  })

  if (!activeParishContext.ok) return activeParishContext
  if (activeParishContext.source !== 'membership') {
    return {
      ok: false as const,
      source: activeParishContext.source,
      error: genericReviewerBlockedReason,
      technicalDetail: 'Export audit reviewer requires membership-backed parish authorization.',
      requestedParishId,
    }
  }
  if (requestedParishId && activeParishContext.activeParishId !== requestedParishId) {
    return {
      ok: false as const,
      source: activeParishContext.source,
      error: genericReviewerBlockedReason,
      technicalDetail:
        activeParishContext.ignoredRequestedParishReason ??
        'Requested parish did not resolve to the active staff parish.',
      requestedParishId,
    }
  }

  return activeParishContext
}

function toSourceEvent(row: unknown): ExportAuditReviewerSourceEvent {
  const event = row && typeof row === 'object' ? (row as Record<string, unknown>) : {}
  return {
    id: event.id,
    created_at: event.created_at,
    action: event.action,
    actor_email: event.actor_email,
    parish_id: event.parish_id,
    target_type: event.target_type,
    target_id: event.target_id,
    metadata: event.metadata,
  }
}

async function queryAuditEvents(
  admin: AdminClient,
  activeParishId: string,
  limit: number
): Promise<readonly ExportAuditReviewerSourceEvent[]> {
  const { data, error } = await admin
    .from('audit_events')
    .select('id, created_at, action, actor_email, parish_id, target_type, target_id, metadata')
    .eq('parish_id', activeParishId)
    .in('action', [...approvedExportAuditActions])
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []).map(toSourceEvent)
}

export async function GET(request: NextRequest) {
  const gate = getReviewerPrototypeGate(process.env)
  if (!gate.enabled) {
    return NextResponse.json({ ok: false, error: 'export_audit_reviewer_unavailable' }, { status: 404 })
  }

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const requestedParishId = activeParishCookie(request)
  const activeParishContext = await resolveReviewerParishContext(staff.supabase, requestedParishId)
  if (!activeParishContext.ok) {
    return NextResponse.json({ ok: false, error: genericReviewerBlockedReason }, { status: 403 })
  }

  const url = new URL(request.url)
  const selectedFilterId = parseSavedFilter(url.searchParams.get('filter'))
  const limit = parseLimit(url.searchParams.get('limit'))
  const admin = createSupabaseServiceRoleClient()
  const sourceEvents = await queryAuditEvents(admin, activeParishContext.activeParishId, limit)
  const rows = buildExportAuditReviewerReadModel(sourceEvents, {
    reviewerLabel: 'non_production_export_audit_reviewer',
    evidenceReference: 'non-production export audit reviewer prototype',
  })
  const filteredRows = applySavedFilter(rows, selectedFilterId)

  return NextResponse.json(
    {
      ok: true,
      prototype: {
        state: gate.state,
        environment: 'non_production',
        productionExports: 'NO_GO',
      },
      scope: {
        activeParishId: activeParishContext.activeParishId,
        activeParishName: activeParishContext.activeParish.name,
        source: activeParishContext.source,
      },
      filters: {
        available: savedFilterIds,
        selected: selectedFilterId,
        rowCount: filteredRows.length,
        severityCounts: severityCounts(filteredRows),
      },
      rows: filteredRows,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}

export const exportAuditReviewerRouteTestInternals = {
  activeParishCookie,
  applySavedFilter,
  approvedExportAuditActions,
  genericReviewerBlockedReason,
  getReviewerPrototypeGate,
  parseLimit,
  parseSavedFilter,
  queryAuditEvents,
  savedFilterIds,
  severityCounts,
}
