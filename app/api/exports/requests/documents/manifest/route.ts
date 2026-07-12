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

const REQUEST_DOCUMENT_MANIFEST_EXPORT_FIELDS = [
  'request_reference',
  'request_type',
  'request_status',
  'workflow_phase',
  'workflow_step_title',
  'workflow_step_required',
  'document_label',
  'document_status',
  'submitted_date',
  'reviewed_date',
  'reviewer_display',
  'missing_received',
] as const

const SACRAMENTAL_CANONICAL_EXPORT_MARKERS = ['sacramental', 'canonical'] as const

type RequestDocumentManifestExportField =
  (typeof REQUEST_DOCUMENT_MANIFEST_EXPORT_FIELDS)[number]

type RequestDocumentManifestExportRow = Record<RequestDocumentManifestExportField, string>

type RequestRow = {
  id: unknown
  request_type: unknown
  status: unknown
  created_at: unknown
}

type WorkflowStepRow = {
  id: unknown
  request_id: unknown
  phase: unknown
  title: unknown
  required: unknown
  sort_order: unknown
}

type DocumentManifestRow = {
  id: unknown
  request_id: unknown
  workflow_step_id: unknown
  document_type: unknown
  status: unknown
  reviewed_at: unknown
  reviewed_by_email: unknown
  created_at: unknown
}

const genericExportBlockedReason = 'Export request cannot be completed.'
const routeId = 'app/api/exports/requests/documents/manifest'
const exportPresetId = 'request_document_manifest'
const targetObjectType = 'request_documents'

function activeParishCookie(request: NextRequest): string | null {
  return request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
}

function normalizeFieldName(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')
}

function parseRequestedExportFields(rawFields: string | null):
  | { ok: true; requestedFields: readonly RequestDocumentManifestExportField[] }
  | { ok: false; requestedFields: readonly string[]; disallowedFields: readonly string[] } {
  if (!rawFields) return { ok: true, requestedFields: REQUEST_DOCUMENT_MANIFEST_EXPORT_FIELDS }

  const requestedFields = Array.from(
    new Set(
      rawFields
        .split(',')
        .map(normalizeFieldName)
        .filter(Boolean)
    )
  )

  if (requestedFields.length === 0) {
    return { ok: true, requestedFields: REQUEST_DOCUMENT_MANIFEST_EXPORT_FIELDS }
  }

  const allowed = new Set<string>(REQUEST_DOCUMENT_MANIFEST_EXPORT_FIELDS)
  const disallowedFields = requestedFields.filter((field) => !allowed.has(field))
  if (disallowedFields.length > 0) {
    return { ok: false, requestedFields, disallowedFields }
  }

  return {
    ok: true,
    requestedFields: requestedFields as RequestDocumentManifestExportField[],
  }
}

function staffExportRoles(staffRole: StaffParishRole): readonly ExportRoleId[] {
  return staffRole === 'admin' ? ['parish_admin'] : ['parish_secretary']
}

async function resolveRequestDocumentManifestExportParishContext(
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

function containsSacramentalCanonicalExportMarker(value: unknown): boolean {
  const normalized = String(value ?? '').toLowerCase()
  return SACRAMENTAL_CANONICAL_EXPORT_MARKERS.some((marker) => normalized.includes(marker))
}

function isSafeManifestExportRow(row: RequestDocumentManifestExportRow): boolean {
  return !REQUEST_DOCUMENT_MANIFEST_EXPORT_FIELDS.some((field) =>
    containsSacramentalCanonicalExportMarker(row[field])
  )
}

export async function GET(request: NextRequest) {
  const gate = getExportRuntimeGate(process.env)
  if (!gate.enabled) {
    return NextResponse.json({ ok: false, error: 'export_unavailable' }, { status: 404 })
  }

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) {
    await writeDeniedExportAuditEvent({
      action: 'export.request_document_manifest.denied',
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
  const activeParishContext = await resolveRequestDocumentManifestExportParishContext(
    staff.supabase,
    requestedParishId
  )
  if (!activeParishContext.ok) {
    await writeDeniedExportAuditEvent({
      action: 'export.request_document_manifest.denied',
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
    logServerError('[request-document-manifest-export] selected-parish role lookup failed', error, {
      route: routeId,
      hasActiveParishCookie: Boolean(requestedParishId),
    })
  }

  if (!selectedParishRole) {
    await writeDeniedExportAuditEvent({
      action: 'export.request_document_manifest.denied',
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
      filtersSummary: 'Same-parish request document manifest export for selected active parish.',
      estimatedRowCount: null,
      reason: null,
      familyPortalSurface: false,
    },
    timestamp: new Date().toISOString(),
  })

  if (!exportPermission.ok) {
    await writeDeniedExportAuditEvent({
      action: 'export.request_document_manifest.denied',
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
      action: 'export.request_document_manifest.denied',
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
    action: 'export.request_document_manifest.downloaded',
    targetType: 'export',
    targetId: exportPresetId,
    metadata: auditMetadataTemplate,
  })
  if (!auditWritten) {
    return NextResponse.json({ ok: false, error: genericExportBlockedReason }, { status: 503 })
  }

  try {
    const admin = createSupabaseServiceRoleClient()
    const rows = await queryExportRows(admin, activeParishId)
    return returnExportFile(rows)
  } catch {
    return NextResponse.json({ ok: false, error: genericExportBlockedReason }, { status: 500 })
  }
}

async function queryExportRows(
  admin: AdminClient,
  activeParishId: string
): Promise<RequestDocumentManifestExportRow[]> {
  const { data: parishioners, error: parishionersError } = await admin
    .from('parishioners')
    .select('id')
    .eq('parish_id', activeParishId)

  if (parishionersError) throw parishionersError

  const parishionerIds = (parishioners ?? []).map((row) => String(row.id)).filter(Boolean)
  if (parishionerIds.length === 0) return []

  const { data: requests, error: requestsError } = await admin
    .from('requests')
    .select('id, request_type, status, created_at')
    .in('parishioner_id', parishionerIds)
    .order('created_at', { ascending: false })
    .limit(5000)

  if (requestsError) throw requestsError

  const requestRows = (requests ?? []) as RequestRow[]
  const requestIds = requestRows.map((row) => String(row.id)).filter(Boolean)
  if (requestIds.length === 0) return []

  const [workflowStepsByRequestId, documentsByRequestId] = await Promise.all([
    loadWorkflowStepsByRequestId(admin, activeParishId, requestIds),
    loadDocumentsByRequestId(admin, activeParishId, requestIds),
  ])

  const rows: RequestDocumentManifestExportRow[] = []
  const pushSafeRow = (row: RequestDocumentManifestExportRow) => {
    if (isSafeManifestExportRow(row)) rows.push(row)
  }

  for (const requestRow of requestRows) {
    if (containsSacramentalCanonicalExportMarker(requestRow.request_type)) continue

    const requestId = String(requestRow.id)
    const workflowSteps = workflowStepsByRequestId.get(requestId) ?? []
    const documents = documentsByRequestId.get(requestId) ?? []
    const documentsByStepId = new Map<string, DocumentManifestRow[]>()
    const documentsWithoutStep: DocumentManifestRow[] = []

    for (const document of documents) {
      const workflowStepId = String(document.workflow_step_id ?? '').trim()
      if (!workflowStepId) {
        documentsWithoutStep.push(document)
        continue
      }
      const existing = documentsByStepId.get(workflowStepId) ?? []
      existing.push(document)
      documentsByStepId.set(workflowStepId, existing)
    }

    for (const step of workflowSteps) {
      const stepId = String(step.id)
      const stepDocuments = documentsByStepId.get(stepId) ?? []
      if (stepDocuments.length === 0) {
        pushSafeRow(rowFromRequestStepAndDocument(requestRow, step, null))
        continue
      }
      for (const document of stepDocuments) {
        pushSafeRow(rowFromRequestStepAndDocument(requestRow, step, document))
      }
    }

    for (const document of documentsWithoutStep) {
      pushSafeRow(rowFromRequestStepAndDocument(requestRow, null, document))
    }
  }

  return rows
}

async function loadWorkflowStepsByRequestId(
  admin: AdminClient,
  activeParishId: string,
  requestIds: readonly string[]
): Promise<Map<string, WorkflowStepRow[]>> {
  const stepsByRequestId = new Map<string, WorkflowStepRow[]>()
  if (requestIds.length === 0) return stepsByRequestId

  const { data: steps, error } = await admin
    .from('request_workflow_steps')
    .select('id, request_id, phase, title, required, sort_order')
    .eq('parish_id', activeParishId)
    .in('request_id', requestIds)
    .order('sort_order', { ascending: true })

  if (error) throw error

  for (const step of (steps ?? []) as WorkflowStepRow[]) {
    const requestId = String(step.request_id)
    const existing = stepsByRequestId.get(requestId) ?? []
    existing.push(step)
    stepsByRequestId.set(requestId, existing)
  }

  return stepsByRequestId
}

async function loadDocumentsByRequestId(
  admin: AdminClient,
  activeParishId: string,
  requestIds: readonly string[]
): Promise<Map<string, DocumentManifestRow[]>> {
  const documentsByRequestId = new Map<string, DocumentManifestRow[]>()
  if (requestIds.length === 0) return documentsByRequestId

  const { data: documents, error } = await admin
    .from('request_documents')
    .select('id, request_id, workflow_step_id, document_type, status, reviewed_at, reviewed_by_email, created_at')
    .eq('parish_id', activeParishId)
    .in('request_id', requestIds)
    .order('created_at', { ascending: false })

  if (error) throw error

  for (const document of (documents ?? []) as DocumentManifestRow[]) {
    const requestId = String(document.request_id)
    const existing = documentsByRequestId.get(requestId) ?? []
    existing.push(document)
    documentsByRequestId.set(requestId, existing)
  }

  return documentsByRequestId
}

function rowFromRequestStepAndDocument(
  request: RequestRow,
  step: WorkflowStepRow | null,
  document: DocumentManifestRow | null
): RequestDocumentManifestExportRow {
  const stepTitle = text(step?.title)
  const documentLabel = text(document?.document_type) || stepTitle || 'Document'
  const documentStatus = text(document?.status) || 'missing'
  const reviewerDisplay = text(document?.reviewed_by_email) ? 'Staff reviewer' : ''

  return {
    request_reference: text(request.id),
    request_type: text(request.request_type),
    request_status: text(request.status),
    workflow_phase: text(step?.phase),
    workflow_step_title: stepTitle,
    workflow_step_required: step?.required === true ? 'required' : step ? 'optional' : '',
    document_label: documentLabel,
    document_status: documentStatus,
    submitted_date: text(document?.created_at),
    reviewed_date: text(document?.reviewed_at),
    reviewer_display: reviewerDisplay,
    missing_received: document ? 'received' : 'missing',
  }
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function csvCell(value: string): string {
  const textValue = String(value ?? '')
  if (!/[",\r\n]/.test(textValue)) return textValue
  return `"${textValue.replace(/"/g, '""')}"`
}

function returnExportFile(rows: readonly RequestDocumentManifestExportRow[]) {
  const header = REQUEST_DOCUMENT_MANIFEST_EXPORT_FIELDS.join(',')
  const body = rows.map((row) =>
    REQUEST_DOCUMENT_MANIFEST_EXPORT_FIELDS.map((field) => csvCell(row[field])).join(',')
  )
  const csv = [header, ...body].join('\r\n')

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="vinea-request-document-manifest.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}

export const requestDocumentManifestExportRouteTestInternals = {
  activeParishCookie,
  containsSacramentalCanonicalExportMarker,
  exportDtoAllowsRuntimeGate,
  genericExportBlockedReason,
  isSafeManifestExportRow,
  parseRequestedExportFields,
  queryExportRows,
  requestDocumentManifestExportFields: REQUEST_DOCUMENT_MANIFEST_EXPORT_FIELDS,
  resolveRequestDocumentManifestExportParishContext,
  returnExportFile,
  safeAuditMetadata,
  staffExportRoles,
}
