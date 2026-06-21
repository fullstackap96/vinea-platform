import { NextResponse, type NextRequest } from 'next/server'
import { writeAuditEvent } from '@/lib/server/auditLog'
import {
  loadStaffScopedRequestDocumentAccess,
  workflowStepBelongsToRequest,
} from '@/lib/server/requestDocumentAccess'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import {
  normalizeRequestDocumentRow,
  REQUEST_DOCUMENT_MAX_FILE_BYTES,
  REQUEST_DOCUMENTS_BUCKET,
  safeRequestDocumentFilename,
} from '@/lib/requestDocuments'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

export const runtime = 'nodejs'

type RouteParams = { params: Promise<{ id: string }> }

function text(value: unknown): string {
  return String(value ?? '').trim()
}

export async function GET(request: NextRequest, context: RouteParams) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const { id: requestId } = await context.params
  try {
    const admin = createSupabaseServiceRoleClient()
    const access = await loadStaffScopedRequestDocumentAccess(admin, requestId)
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
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      documents: (data ?? [])
        .map((row) => normalizeRequestDocumentRow(row as Record<string, unknown>))
        .filter(Boolean),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Could not load documents.'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: RouteParams) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const { id: requestId } = await context.params
  try {
    const admin = createSupabaseServiceRoleClient()
    const access = await loadStaffScopedRequestDocumentAccess(admin, requestId)
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
    const { error: uploadError } = await admin.storage
      .from(REQUEST_DOCUMENTS_BUCKET)
      .upload(storagePath, buffer, { contentType, upsert: false })

    if (uploadError) {
      return NextResponse.json({ ok: false, error: uploadError.message }, { status: 500 })
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

    if (insertError) {
      await admin.storage.from(REQUEST_DOCUMENTS_BUCKET).remove([storagePath])
      return NextResponse.json({ ok: false, error: insertError.message }, { status: 500 })
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
        filename: originalFilename,
        documentType: text(form.get('documentType')) || null,
      },
    })

    return NextResponse.json({
      ok: true,
      document: normalizeRequestDocumentRow(inserted as Record<string, unknown>),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Could not upload document.'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
