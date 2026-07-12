import { NextResponse, type NextRequest } from 'next/server'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { writeDeniedExportAuditEvent } from '@/lib/server/exportDeniedAudit'
import { getExportRuntimeGate } from '@/lib/server/exportRuntimeGate'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { logServerError } from '@/lib/server/safeErrorLogging'
import {
  loadAuthenticatedStaffRoleForParish,
  type StaffParishRole,
} from '@/lib/server/staffParishRole'
import {
  buildExportPermissionEvaluationDto,
  type ExportPermissionEvaluationDto,
  type ExportRoleId,
} from '@/lib/exportAccessControl'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

export const runtime = 'nodejs'

type AdminClient = ReturnType<typeof createSupabaseServiceRoleClient>
type StaffSupabaseClient = Parameters<typeof resolveActiveStaffParishContext>[0]

const REQUEST_LIST_BASIC_EXPORT_FIELDS = [
  'request_reference',
  'request_type',
  'request_status',
  'workflow_phase',
  'assigned_staff',
  'follow_up_date',
  'created_date',
  'updated_date',
  'required_steps_incomplete',
  'optional_steps_incomplete',
] as const

type RequestListBasicExportField = (typeof REQUEST_LIST_BASIC_EXPORT_FIELDS)[number]

type RequestListBasicExportRow = Record<RequestListBasicExportField, string | number>

const genericExportBlockedReason = 'Export request cannot be completed.'
const routeId = 'app/api/exports/requests/basic'
const exportPresetId = 'request_list_basic'
const targetObjectType = 'requests'

function activeParishCookie(request: NextRequest): string | null {
  return request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
}

function normalizeFieldName(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')
}

function parseRequestedExportFields(rawFields: string | null):
  | { ok: true; requestedFields: readonly RequestListBasicExportField[] }
  | { ok: false; requestedFields: readonly string[]; disallowedFields: readonly string[] } {
  if (!rawFields) return { ok: true, requestedFields: REQUEST_LIST_BASIC_EXPORT_FIELDS }

  const requestedFields = Array.from(
    new Set(
      rawFields
        .split(',')
        .map(normalizeFieldName)
        .filter(Boolean)
    )
  )

  if (requestedFields.length === 0) {
    return { ok: true, requestedFields: REQUEST_LIST_BASIC_EXPORT_FIELDS }
  }

  const allowed = new Set<string>(REQUEST_LIST_BASIC_EXPORT_FIELDS)
  const disallowedFields = requestedFields.filter((field) => !allowed.has(field))
  if (disallowedFields.length > 0) {
    return { ok: false, requestedFields, disallowedFields }
  }

  return {
    ok: true,
    requestedFields: requestedFields as RequestListBasicExportField[],
  }
}

function staffExportRoles(staffRole: StaffParishRole): readonly ExportRoleId[] {
  return staffRole === 'admin' ? ['parish_admin'] : ['parish_secretary']
}

async function resolveRequestListExportParishContext(
  supabase: StaffSupabaseClient,
  requestedParishId: string | null
) {
  const activeParishContext = await resolveActiveStaffParishContext(supabase, {
    requestedParishId,
  })

  if (!activeParishContext.ok) return activeParishContext
  if (requestedParishId && activeParishContext.activeParishId !== requestedParishId) {
    return {
      ok: false as const,
      source: activeParishContext.source,
      error: genericExportBlockedReason,
      technicalDetail:
        activeParishContext.ignoredRequestedParishReason ??
        'Requested parish did not resolve to the active staff parish.',
      requestedParishId,
    }
  }
  if (requestedParishId && activeParishContext.source !== 'membership') {
    return {
      ok: false as const,
      source: activeParishContext.source,
      error: genericExportBlockedReason,
      technicalDetail: 'Active parish cookie requires membership-backed parish authorization.',
      requestedParishId,
    }
  }

  return activeParishContext
}

function exportDtoAllowsRuntimeGate(dto: ExportPermissionEvaluationDto): boolean {
  return (
    dto.decision === 'allowed_non_runtime' ||
    (dto.decision === 'disabled_non_runtime' && dto.blockedReason === 'runtime_export_not_enabled')
  )
}

function safeAuditMetadata(input: {
  dto: ExportPermissionEvaluationDto
  runtimeGateState: string
  routeId: string
}) {
  return {
    ...input.dto.auditMetadataTemplate,
    routeId: input.routeId,
    runtimeGateState: input.runtimeGateState,
    permissionDecisionBeforeRuntimeGate: input.dto.decision,
    permissionBlockedReasonBeforeRuntimeGate: input.dto.blockedReason,
  }
}

export async function GET(request: NextRequest) {
  const gate = getExportRuntimeGate(process.env)
  if (!gate.enabled) {
    return NextResponse.json({ ok: false, error: 'export_unavailable' }, { status: 404 })
  }

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) {
    await writeDeniedExportAuditEvent({
      action: 'export.request_list_basic.denied',
      presetId: exportPresetId,
      routeId,
      runtimeGateState: gate.state,
      deniedReasonCode: 'unauthenticated_or_non_staff',
      httpStatus: staff.response.status,
      targetObjectType,
      requestedActiveParishCookiePresent: Boolean(activeParishCookie(request)),
    })
    return staff.response
  }

  const requestedParishId = activeParishCookie(request)
  const activeParishContext = await resolveRequestListExportParishContext(
    staff.supabase,
    requestedParishId
  )
  if (!activeParishContext.ok) {
    await writeDeniedExportAuditEvent({
      action: 'export.request_list_basic.denied',
      actorEmail: staff.staff.email,
      presetId: exportPresetId,
      routeId,
      runtimeGateState: gate.state,
      deniedReasonCode: 'active_parish_scope_denied',
      httpStatus: 403,
      targetObjectType,
      requestedActiveParishCookiePresent: Boolean(requestedParishId),
    })
    return NextResponse.json({ ok: false, error: genericExportBlockedReason }, { status: 403 })
  }

  const activeParishId = activeParishContext.activeParishId
  const membershipParishIds = activeParishContext.parishIds
  const url = new URL(request.url)
  const parsedFields = parseRequestedExportFields(url.searchParams.get('fields'))
  const requestedFields = parsedFields.ok ? parsedFields.requestedFields : parsedFields.requestedFields

  let selectedParishRole: StaffParishRole | null = null
  try {
    selectedParishRole = await loadAuthenticatedStaffRoleForParish(staff.supabase, {
      parishId: activeParishId,
      email: staff.staff.email,
    })
  } catch (error: unknown) {
    logServerError('[request-list-export] selected-parish role lookup failed', error, {
      route: routeId,
      hasActiveParishCookie: Boolean(requestedParishId),
    })
  }

  if (!selectedParishRole) {
    await writeDeniedExportAuditEvent({
      action: 'export.request_list_basic.denied',
      actorEmail: staff.staff.email,
      parishId: activeParishId,
      presetId: exportPresetId,
      routeId,
      runtimeGateState: gate.state,
      deniedReasonCode: 'selected_parish_role_denied',
      httpStatus: 403,
      targetObjectType,
      requestedActiveParishCookiePresent: Boolean(requestedParishId),
      requestedFieldsCount: requestedFields.length,
    })
    return NextResponse.json({ ok: false, error: genericExportBlockedReason }, { status: 403 })
  }

  const exportPermission = buildExportPermissionEvaluationDto({
    staff: {
      userId: staff.user.id,
      email: staff.staff.email,
      roles: staffExportRoles(selectedParishRole),
    },
    scope: {
      activeParishId,
      membershipParishIds,
      targetParishIds: [activeParishId],
      selectedParishName: activeParishContext.activeParish.name,
    },
    request: {
      presetId: exportPresetId,
      targetObjectType,
      requestedFields,
      filtersSummary: 'Same-parish basic request-list export for selected active parish.',
      estimatedRowCount: null,
      reason: null,
      familyPortalSurface: false,
    },
    timestamp: new Date().toISOString(),
  })

  if (!exportPermission.ok) {
    await writeDeniedExportAuditEvent({
      action: 'export.request_list_basic.denied',
      actorEmail: staff.staff.email,
      parishId: activeParishId,
      presetId: exportPresetId,
      routeId,
      runtimeGateState: gate.state,
      deniedReasonCode: 'export_permission_denied',
      httpStatus: 403,
      targetObjectType,
      requestedActiveParishCookiePresent: Boolean(requestedParishId),
      requestedFieldsCount: requestedFields.length,
    })
    return NextResponse.json({ ok: false, error: genericExportBlockedReason }, { status: 403 })
  }

  const blockedFieldsRequested = exportPermission.dto.blockedFieldsRequested
  const familyPortalSurface = exportPermission.dto.familyPortalSurface
  if (
    blockedFieldsRequested.length > 0 ||
    familyPortalSurface ||
    !parsedFields.ok ||
    !exportDtoAllowsRuntimeGate(exportPermission.dto)
  ) {
    await writeDeniedExportAuditEvent({
      action: 'export.request_list_basic.denied',
      actorEmail: staff.staff.email,
      parishId: activeParishId,
      presetId: exportPresetId,
      routeId,
      runtimeGateState: gate.state,
      deniedReasonCode: 'blocked_or_disallowed_fields',
      httpStatus: 403,
      targetObjectType,
      requestedActiveParishCookiePresent: Boolean(requestedParishId),
      requestedFieldsCount: requestedFields.length,
      blockedFieldsRequestedCount: blockedFieldsRequested.length,
      disallowedFieldsCount: parsedFields.ok ? 0 : parsedFields.disallowedFields.length,
      permissionDto: exportPermission.dto,
    })
    return NextResponse.json({ ok: false, error: genericExportBlockedReason }, { status: 403 })
  }

  const auditMetadataTemplate = safeAuditMetadata({
    dto: exportPermission.dto,
    runtimeGateState: gate.state,
    routeId,
  })
  const auditWritten = await writeAuditEvent({
    parishId: activeParishId,
    actorEmail: staff.staff.email,
    action: 'export.request_list_basic.downloaded',
    targetType: 'export',
    targetId: exportPresetId,
    metadata: auditMetadataTemplate,
  })
  if (!auditWritten) {
    return NextResponse.json({ ok: false, error: genericExportBlockedReason }, { status: 503 })
  }

  const admin = createSupabaseServiceRoleClient()
  const rows = await queryExportRows(admin, activeParishId)
  return returnExportFile(rows)
}

async function queryExportRows(admin: AdminClient, activeParishId: string): Promise<RequestListBasicExportRow[]> {
  const { data: parishioners, error: parishionersError } = await admin
    .from('parishioners')
    .select('id')
    .eq('parish_id', activeParishId)

  if (parishionersError) throw parishionersError

  const parishionerIds = (parishioners ?? []).map((row) => String(row.id)).filter(Boolean)
  if (parishionerIds.length === 0) return []

  const { data: requests, error: requestsError } = await admin
    .from('requests')
    .select(
      'id, request_type, status, assigned_staff_name, assigned_priest_name, assigned_deacon_name, next_follow_up_date, created_at'
    )
    .in('parishioner_id', parishionerIds)
    .order('created_at', { ascending: false })
    .limit(5000)

  if (requestsError) throw requestsError

  const requestRows = requests ?? []
  const requestIds = requestRows.map((row) => String(row.id)).filter(Boolean)
  const workflowSummaryByRequestId = await loadWorkflowStepSummary(admin, activeParishId, requestIds)

  return requestRows.map((request) => {
    const id = String(request.id)
    const workflow = workflowSummaryByRequestId.get(id)
    const assignedStaff =
      [request.assigned_staff_name, request.assigned_priest_name, request.assigned_deacon_name]
        .map((value) => String(value ?? '').trim())
        .filter(Boolean)
        .join('; ') || ''

    return {
      request_reference: id,
      request_type: String(request.request_type ?? ''),
      request_status: String(request.status ?? ''),
      workflow_phase: workflow?.phase ?? '',
      assigned_staff: assignedStaff,
      follow_up_date: String(request.next_follow_up_date ?? ''),
      created_date: String(request.created_at ?? ''),
      updated_date: '',
      required_steps_incomplete: workflow?.requiredIncomplete ?? 0,
      optional_steps_incomplete: workflow?.optionalIncomplete ?? 0,
    }
  })
}

async function loadWorkflowStepSummary(
  admin: AdminClient,
  activeParishId: string,
  requestIds: readonly string[]
): Promise<Map<string, { phase: string; requiredIncomplete: number; optionalIncomplete: number }>> {
  const summary = new Map<string, { phase: string; requiredIncomplete: number; optionalIncomplete: number }>()
  if (requestIds.length === 0) return summary

  const { data: steps, error } = await admin
    .from('request_workflow_steps')
    .select('request_id, phase, required, status, sort_order')
    .eq('parish_id', activeParishId)
    .in('request_id', requestIds)
    .order('sort_order', { ascending: true })

  if (error) throw error

  for (const step of steps ?? []) {
    const requestId = String(step.request_id)
    const existing =
      summary.get(requestId) ?? { phase: '', requiredIncomplete: 0, optionalIncomplete: 0 }
    const complete = step.status === 'completed'
    if (!complete && !existing.phase) {
      existing.phase = String(step.phase ?? '')
    }
    if (!complete && step.required === true) {
      existing.requiredIncomplete += 1
    }
    if (!complete && step.required !== true) {
      existing.optionalIncomplete += 1
    }
    summary.set(requestId, existing)
  }

  return summary
}

function csvCell(value: string | number): string {
  const text = String(value ?? '')
  if (!/[",\r\n]/.test(text)) return text
  return `"${text.replace(/"/g, '""')}"`
}

function returnExportFile(rows: readonly RequestListBasicExportRow[]) {
  const header = REQUEST_LIST_BASIC_EXPORT_FIELDS.join(',')
  const body = rows.map((row) =>
    REQUEST_LIST_BASIC_EXPORT_FIELDS.map((field) => csvCell(row[field])).join(',')
  )
  const csv = [header, ...body].join('\r\n')

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="vinea-request-list-basic.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}

export const requestListBasicExportRouteTestInternals = {
  activeParishCookie,
  exportDtoAllowsRuntimeGate,
  genericExportBlockedReason,
  parseRequestedExportFields,
  queryExportRows,
  requestListBasicExportFields: REQUEST_LIST_BASIC_EXPORT_FIELDS,
  resolveRequestListExportParishContext,
  returnExportFile,
  safeAuditMetadata,
  staffExportRoles,
}
