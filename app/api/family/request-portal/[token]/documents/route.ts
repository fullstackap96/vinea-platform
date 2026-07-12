import { NextResponse, type NextRequest } from 'next/server'
import { loadFamilyPortalByToken } from '@/lib/server/requestPortalTokens'
import {
  isRequestDocumentsTableMissing,
  REQUEST_DOCUMENT_MAX_FILE_BYTES,
  REQUEST_DOCUMENTS_BUCKET,
  REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE,
  safeRequestDocumentFilename,
} from '@/lib/requestDocuments'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { checkDurableRateLimit } from '@/lib/server/durableRateLimit'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { cleanupFailedRequestDocumentUpload } from '@/lib/server/requestDocumentUploadCleanup'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'
import { durableRateLimitKeyFromRequest } from '@/lib/server/simpleRateLimit'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

export const runtime = 'nodejs'

const RATE_LIMIT = { limit: 20, windowMs: 15 * 60_000 }

type RouteParams = { params: Promise<{ token: string }> }

function text(value: unknown): string {
  return String(value ?? '').trim()
}

export async function POST(request: NextRequest, context: RouteParams) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  let hasPortalToken = false
  try {
    const { token } = await context.params
    hasPortalToken = Boolean(token)
    const admin = createSupabaseServiceRoleClient()
    const rateLimit = await checkDurableRateLimit({
      admin,
      key: durableRateLimitKeyFromRequest(request, 'family-document-upload'),
      ...RATE_LIMIT,
    }).catch((error: unknown) => {
      logServerError('[family-portal-documents] rate limit check failed', error, {
        route: '/api/family/request-portal/[token]/documents',
        hasPortalToken,
      })
      return null
    })

    if (!rateLimit) {
      return NextResponse.json(
        { ok: false, error: 'Could not upload document. Please try again later.' },
        { status: 503 }
      )
    }

    if (!rateLimit.ok) {
      return NextResponse.json(
        { ok: false, error: 'Too many upload attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        }
      )
    }

    const portal = await loadFamilyPortalByToken(admin, token)
    if (!portal) {
      return NextResponse.json(
        { ok: false, error: 'This upload link is invalid or expired.' },
        { status: 404 }
      )
    }

    const form = await request.formData()
    const workflowStepId = text(form.get('workflowStepId'))
    const step = portal.familySteps.find((candidate) => candidate.id === workflowStepId)
    if (!step) {
      return NextResponse.json(
        { ok: false, error: 'Choose a document request from the list.' },
        { status: 400 }
      )
    }

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

    const originalFilename = safeRequestDocumentFilename(file.name)
    const storagePath = [
      portal.parish.id,
      portal.request.id,
      'family',
      `${crypto.randomUUID()}-${originalFilename}`,
    ].join('/')
    const contentType = text(file.type) || 'application/octet-stream'
    const buffer = Buffer.from(await file.arrayBuffer())
    const { data: uploaded, error: uploadError } = await admin.storage
      .from(REQUEST_DOCUMENTS_BUCKET)
      .upload(storagePath, buffer, { contentType, upsert: false })

    if (uploadError || uploaded?.path !== storagePath) {
      logServerError('[family-portal-documents] upload storage failed', uploadError, {
        route: '/api/family/request-portal/[token]/documents',
        hasPortalToken: Boolean(token),
        hasWorkflowStepId: Boolean(workflowStepId),
        fileSizeBytes: file.size,
      })
      return NextResponse.json({ ok: false, error: 'Could not upload document.' }, { status: 500 })
    }

    const { data: inserted, error: insertError } = await admin
      .from('request_documents')
      .insert({
        parish_id: portal.parish.id,
        request_id: portal.request.id,
        workflow_step_id: step.id,
        storage_bucket: REQUEST_DOCUMENTS_BUCKET,
        storage_path: storagePath,
        document_type: step.title,
        original_filename: originalFilename,
        content_type: contentType,
        file_size_bytes: file.size,
        status: 'pending_review',
        uploaded_by: null,
        uploaded_by_email: 'Family portal',
      })
      .select('id')
      .single()

    if (insertError || !inserted?.id) {
      const cleanup = await cleanupFailedRequestDocumentUpload({
        storage: admin.storage,
        bucket: REQUEST_DOCUMENTS_BUCKET,
        storagePath,
        source: 'family_portal',
      })
      if (isRequestDocumentsTableMissing(insertError)) {
        return NextResponse.json(
          { ok: false, error: REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE },
          { status: 503 }
        )
      }
      logServerError('[family-portal-documents] upload insert failed', insertError, {
        route: '/api/family/request-portal/[token]/documents',
        hasPortalToken: Boolean(token),
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
            : 'We could not complete this upload. Please contact the parish office before trying again.',
        },
        { status: 500 },
      )
    }

    await writeAuditEvent({
      parishId: portal.parish.id,
      actorEmail: null,
      action: 'request.document.family_uploaded',
      targetType: 'request_document',
      targetId: String(inserted.id),
      metadata: {
        requestId: portal.request.id,
        workflowStepId: step.id,
        documentType: step.title,
        fileSizeBytes: file.size,
        uploadSource: 'family_portal',
        summary: 'Family uploaded a requested document.',
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    if (isRequestDocumentsTableMissing(error as { code?: string; message?: string } | null)) {
      return NextResponse.json(
        { ok: false, error: REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE },
        { status: 503 }
      )
    }
    logServerError('[family-portal-documents] upload failed', error, {
      route: '/api/family/request-portal/[token]/documents',
      hasPortalToken,
    })
    return NextResponse.json({ ok: false, error: 'Could not upload document.' }, { status: 500 })
  }
}
