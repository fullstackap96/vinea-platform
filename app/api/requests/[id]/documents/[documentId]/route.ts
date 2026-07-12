import { NextResponse, type NextRequest } from 'next/server'
import {
  isRequestDocumentsTableMissing,
  requestDocumentStatusLabel,
  REQUEST_DOCUMENTS_BUCKET,
  REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE,
} from '@/lib/requestDocuments'
import { ACTIVE_STAFF_PARISH_COOKIE } from '@/lib/server/activeStaffParishContext'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { readBoundedJsonBody } from '@/lib/server/boundedJsonBody'
import {
  loadStaffScopedRequestDocumentAccess,
  type StaffScopedRequestDocumentAccessOptions,
} from '@/lib/server/requestDocumentAccess'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { confirmedRequestDocumentSignedUrl } from '@/lib/server/requestDocumentSignedUrl'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type RouteParams = { params: Promise<{ id: string; documentId: string }> }

const MAX_BODY_BYTES = 32 * 1024

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
    const access = await loadStaffScopedRequestDocumentAccess(
      admin,
      requestId,
      activeParishDocumentAccessOptions(request, staff.supabase)
    )
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

    const signedUrl = confirmedRequestDocumentSignedUrl(data)
    if (error || !signedUrl) {
      logServerError('[request-document] signed-url failed', error, {
        route: '/api/requests/[id]/documents/[documentId]',
        hasRequestId: Boolean(requestId),
        hasDocumentId: Boolean(documentId),
        activeParishCookiePresent: Boolean(request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value),
        missingSignedUrl: !signedUrl,
      })
      return NextResponse.json(
        { ok: false, error: 'Could not prepare document download.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, url: signedUrl })
  } catch (error: unknown) {
    if (isRequestDocumentsTableMissing(error as { code?: string; message?: string } | null)) {
      return NextResponse.json(
        { ok: false, error: REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE },
        { status: 503 }
      )
    }
    logServerError('[request-document] download failed', error, {
      route: '/api/requests/[id]/documents/[documentId]',
      hasRequestId: Boolean(requestId),
      hasDocumentId: Boolean(documentId),
      activeParishCookiePresent: Boolean(request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not prepare document download.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const { id: requestId, documentId } = await context.params
  const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
  if (!parsedBody.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          parsedBody.reason === 'too_large'
            ? 'Document review is too large.'
            : 'Invalid JSON body.',
      },
      { status: parsedBody.reason === 'too_large' ? 413 : 400 }
    )
  }

  const body = parsedBody.value
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const input = body as Record<string, unknown>
  const status = text(input.status)
  if (status !== 'approved' && status !== 'rejected') {
    return NextResponse.json(
      { ok: false, error: 'Document status must be approved or rejected.' },
      { status: 400 }
    )
  }

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

    const document = await loadDocument(admin, {
      parishId: access.parishId,
      requestId: access.requestId,
      documentId,
    })
    if (!document) {
      return NextResponse.json({ ok: false, error: 'Document not found.' }, { status: 404 })
    }

    const reviewNote = text(input.reviewNote) || null
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
      logServerError('[request-document] review update failed', updateError, {
        route: '/api/requests/[id]/documents/[documentId]',
        hasRequestId: Boolean(requestId),
        hasDocumentId: Boolean(documentId),
        activeParishCookiePresent: Boolean(request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value),
        status,
      })
      return NextResponse.json({ ok: false, error: 'Could not review document.' }, { status: 500 })
    }

    await writeAuditEvent({
      parishId: access.parishId,
      actorEmail: staff.staff.email,
      action: 'request.document.reviewed',
      targetType: 'request_document',
      targetId: documentId,
      metadata: {
        requestId: access.requestId,
        status,
        summary: requestDocumentStatusLabel(status),
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
    logServerError('[request-document] review failed', error, {
      route: '/api/requests/[id]/documents/[documentId]',
      hasRequestId: Boolean(requestId),
      hasDocumentId: Boolean(documentId),
      activeParishCookiePresent: Boolean(request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value),
    })
    return NextResponse.json({ ok: false, error: 'Could not review document.' }, { status: 500 })
  }
}
