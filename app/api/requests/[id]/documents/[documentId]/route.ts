import { NextResponse, type NextRequest } from 'next/server'
import {
  isRequestDocumentsTableMissing,
  requestDocumentStatusLabel,
  REQUEST_DOCUMENTS_BUCKET,
  REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE,
} from '@/lib/requestDocuments'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { loadStaffScopedRequestDocumentAccess } from '@/lib/server/requestDocumentAccess'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type RouteParams = { params: Promise<{ id: string; documentId: string }> }

function text(value: unknown): string {
  return String(value ?? '').trim()
}

async function loadDocument(
  admin: ReturnType<typeof createSupabaseServiceRoleClient>,
  input: { parishId: string; requestId: string; documentId: string }
) {
  const { data, error } = await admin
    .from('request_documents')
    .select('id, request_id, parish_id, storage_bucket, storage_path, original_filename, status')
    .eq('id', input.documentId)
    .eq('request_id', input.requestId)
    .eq('parish_id', input.parishId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function GET(request: NextRequest, context: RouteParams) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const { id: requestId, documentId } = await context.params
  try {
    const admin = createSupabaseServiceRoleClient()
    const access = await loadStaffScopedRequestDocumentAccess(admin, requestId)
    if (!access) {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const document = await loadDocument(admin, {
      parishId: access.parishId,
      requestId: access.requestId,
      documentId,
    })
    if (!document) {
      return NextResponse.json({ ok: false, error: 'Document not found.' }, { status: 404 })
    }

    const bucket = text(document.storage_bucket) || REQUEST_DOCUMENTS_BUCKET
    const { data, error } = await admin.storage
      .from(bucket)
      .createSignedUrl(String(document.storage_path), 60)

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, url: data.signedUrl })
  } catch (error: unknown) {
    if (isRequestDocumentsTableMissing(error as { code?: string; message?: string } | null)) {
      return NextResponse.json(
        { ok: false, error: REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE },
        { status: 503 }
      )
    }
    const message = error instanceof Error ? error.message : 'Could not prepare document download.'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const { id: requestId, documentId } = await context.params
  const body = await request.json().catch(() => null as Record<string, unknown> | null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const status = text(body.status)
  if (status !== 'approved' && status !== 'rejected') {
    return NextResponse.json(
      { ok: false, error: 'Document status must be approved or rejected.' },
      { status: 400 }
    )
  }

  try {
    const admin = createSupabaseServiceRoleClient()
    const access = await loadStaffScopedRequestDocumentAccess(admin, requestId)
    if (!access) {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const document = await loadDocument(admin, {
      parishId: access.parishId,
      requestId: access.requestId,
      documentId,
    })
    if (!document) {
      return NextResponse.json({ ok: false, error: 'Document not found.' }, { status: 404 })
    }

    const reviewNote = text(body.reviewNote) || null
    const reviewedAt = new Date().toISOString()
    const { data: updated, error: updateError } = await admin
      .from('request_documents')
      .update({
        status,
        reviewed_by: staff.user.id,
        reviewed_by_email: staff.staff.email,
        reviewed_at: reviewedAt,
        review_note: reviewNote,
      })
      .eq('id', documentId)
      .eq('request_id', access.requestId)
      .eq('parish_id', access.parishId)
      .select(
        'id, request_id, workflow_step_id, document_type, original_filename, content_type, file_size_bytes, status, uploaded_by_email, reviewed_by_email, reviewed_at, review_note, created_at'
      )
      .single()

    if (updateError) {
      if (isRequestDocumentsTableMissing(updateError)) {
        return NextResponse.json(
          { ok: false, error: REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE },
          { status: 503 }
        )
      }
      return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 })
    }

    await writeAuditEvent({
      parishId: access.parishId,
      actorEmail: staff.staff.email,
      action: 'request.document.reviewed',
      targetType: 'request_document',
      targetId: documentId,
      metadata: {
        requestId: access.requestId,
        filename: document.original_filename,
        status,
        summary: `${requestDocumentStatusLabel(status)}: ${document.original_filename}`,
      },
    })

    return NextResponse.json({ ok: true, document: updated })
  } catch (error: unknown) {
    if (isRequestDocumentsTableMissing(error as { code?: string; message?: string } | null)) {
      return NextResponse.json(
        { ok: false, error: REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE },
        { status: 503 }
      )
    }
    const message = error instanceof Error ? error.message : 'Could not review document.'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
