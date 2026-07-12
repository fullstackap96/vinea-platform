import { NextResponse, type NextRequest } from 'next/server'
import { writeAuditEvent } from '@/lib/server/auditLog'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
} from '@/lib/server/activeStaffParishContext'
import {
  loadStaffScopedRequestDocumentAccess,
  type StaffScopedRequestDocumentAccessOptions,
  workflowStepBelongsToRequest,
} from '@/lib/server/requestDocumentAccess'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { cleanupFailedRequestDocumentUpload } from '@/lib/server/requestDocumentUploadCleanup'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'
import {
  normalizeRequestDocumentRow,
  isRequestDocumentsTableMissing,
  REQUEST_DOCUMENT_MAX_FILE_BYTES,
  REQUEST_DOCUMENTS_BUCKET,
  REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE,
  safeRequestDocumentFilename,
} from '@/lib/requestDocuments'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

export const runtime = 'nodejs'

type RouteParams = { params: Promise<{ id: string }> }

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function activeParishDocumentAccessOptions(
  request: NextRequest,
  staffSupabase: StaffScopedRequestDocumentAccessOptions['staffSupabase']
): StaffScopedRequestDocumentAccessOptions {
  const activeParishId = request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null

  return {
    staffSupabase,
    activeParishId,
    allowPrimaryParishFallback: !activeParishId,
  }
}

export async function GET(request: NextRequest, context: RouteParams) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const { id: requestId } = await context.params
  try {
    const admin = createSupabaseServiceRoleClient()
    const access = await loadStaffScopedRequestDocumentAccess(
      admin,
      requestId,
      activeParishDocumentAccessOptions(request, staff.supabase)
    )
    if (!access) {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const { data, error } = await admin
      .from('request_documents')
      .select(
        'id, request_id, workflow_step_id, document_type, original_filename, content_type, file_size_bytes, status, uploaded_by_email, reviewed_by_email, reviewed_at, review_note, created_at'
      )
      .eq('request_id', access.requestId)
      .eq('parish_id', access.parishId)
      .order('created_at', { ascending: false })

    if (error) {
      if (isRequestDocumentsTableMissing(error)) {
        return NextResponse.json(
          { ok: false, error: REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE },
          { status: 503 }
        )
      }
      logServerError('[request-documents] list failed', error, {
        route: '/api/requests/[id]/documents',
        hasRequestId: Boolean(requestId),
        activeParishCookiePresent: Boolean(request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value),
      })
      return NextResponse.json({ ok: false, error: 'Could not load documents.' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      documents: (data ?? [])
        .map((row) => normalizeRequestDocumentRow(row as Record<string, unknown>))
        .filter(Boolean),
    })
  } catch (error: unknown) {
    logServerError('[request-documents] list failed', error, {
      route: '/api/requests/[id]/documents',
      hasRequestId: Boolean(requestId),
      activeParishCookiePresent: Boolean(request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value),
    })
    return NextResponse.json({ ok: false, error: 'Could not load documents.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: RouteParams) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const { id: requestId } = await context.params
  try {
    const admin = createSupabaseServiceRoleClient()
    const access = await loadStaffScopedRequestDocumentAccess(
      admin,
      requestId,
      activeParishDocumentAccessOptions(request, staff.supabase)
    )
    if (!access) {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File) || file.size <= 0) {
      return NextResponse.json({ ok: false, error: 'Choose a document to upload.' }, { status: 400 })
    }
    if (file.size > REQUEST_DOCUMENT_MAX_FILE_BYTES) {
      return NextResponse.json(
        { ok: false, error: 'Documents must be 10 MB or smaller.' },
        { status: 400 }
      )
    }

    const workflowStepId = text(form.get('workflowStepId'))
    if (workflowStepId) {
      const belongs = await workflowStepBelongsToRequest(admin, {
        parishId: access.parishId,
        requestId: access.requestId,
        workflowStepId,
      })
      if (!belongs) {
        return NextResponse.json(
          { ok: false, error: 'Workflow step not found for this request.' },
          { status: 400 }
        )
      }
    }

    const originalFilename = safeRequestDocumentFilename(file.name)
    const storagePath = [
      access.parishId,
      access.requestId,
      `${crypto.randomUUID()}-${originalFilename}`,
    ].join('/')
    const contentType = text(file.type) || 'application/octet-stream'
    const buffer = Buffer.from(await file.arrayBuffer())
    const { data: uploaded, error: uploadError } = await admin.storage
      .from(REQUEST_DOCUMENTS_BUCKET)
      .upload(storagePath, buffer, { contentType, upsert: false })

    if (uploadError || uploaded?.path !== storagePath) {
      logServerError('[request-documents] upload storage failed', uploadError, {
        route: '/api/requests/[id]/documents',
        hasRequestId: Boolean(requestId),
        activeParishCookiePresent: Boolean(request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value),
        hasWorkflowStepId: Boolean(workflowStepId),
        fileSizeBytes: file.size,
      })
      return NextResponse.json({ ok: false, error: 'Could not upload document.' }, { status: 500 })
    }

    const { data: inserted, error: insertError } = await admin
      .from('request_documents')
      .insert({
        parish_id: access.parishId,
        request_id: access.requestId,
        workflow_step_id: workflowStepId || null,
        storage_bucket: REQUEST_DOCUMENTS_BUCKET,
        storage_path: storagePath,
        document_type: text(form.get('documentType')) || null,
        original_filename: originalFilename,
        content_type: contentType,
        file_size_bytes: file.size,
        status: 'pending_review',
        uploaded_by: staff.user.id,
        uploaded_by_email: staff.staff.email,
      })
      .select(
        'id, request_id, workflow_step_id, document_type, original_filename, content_type, file_size_bytes, status, uploaded_by_email, reviewed_by_email, reviewed_at, review_note, created_at'
      )
      .single()

    if (insertError || !inserted?.id) {
      const cleanup = await cleanupFailedRequestDocumentUpload({
        storage: admin.storage,
        bucket: REQUEST_DOCUMENTS_BUCKET,
        storagePath,
        source: 'staff',
      })
      if (isRequestDocumentsTableMissing(insertError)) {
        return NextResponse.json(
          { ok: false, error: REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE },
          { status: 503 }
        )
      }
      logServerError('[request-documents] upload insert failed', insertError, {
        route: '/api/requests/[id]/documents',
        hasRequestId: Boolean(requestId),
        activeParishCookiePresent: Boolean(request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value),
        hasWorkflowStepId: Boolean(workflowStepId),
        fileSizeBytes: file.size,
        storageCleanupAttempted: true,
        storageCleanupComplete: cleanup.ok,
      })
      return NextResponse.json(
        {
          ok: false,
          error: cleanup.ok
            ? 'Could not upload document.'
            : 'Document upload could not be completed, and storage cleanup could not be confirmed. Ask an administrator to review document storage before retrying.',
        },
        { status: 500 },
      )
    }

    await writeAuditEvent({
      parishId: access.parishId,
      actorEmail: staff.staff.email,
      action: 'request.document.uploaded',
      targetType: 'request_document',
      targetId: String(inserted.id),
      metadata: {
        requestId: access.requestId,
        workflowStepId: workflowStepId || null,
        documentType: text(form.get('documentType')) || null,
        fileSizeBytes: file.size,
      },
    })

    return NextResponse.json({
      ok: true,
      document: normalizeRequestDocumentRow(inserted as Record<string, unknown>),
    })
  } catch (error: unknown) {
    if (isRequestDocumentsTableMissing(error as { code?: string; message?: string } | null)) {
      return NextResponse.json(
        { ok: false, error: REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE },
        { status: 503 }
      )
    }
    logServerError('[request-documents] upload failed', error, {
      route: '/api/requests/[id]/documents',
      hasRequestId: Boolean(requestId),
      activeParishCookiePresent: Boolean(request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value),
    })
    return NextResponse.json({ ok: false, error: 'Could not upload document.' }, { status: 500 })
  }
}
