import { NextResponse, type NextRequest } from 'next/server'
import { loadFamilyPortalByToken } from '@/lib/server/requestPortalTokens'
import {
  REQUEST_DOCUMENT_MAX_FILE_BYTES,
  REQUEST_DOCUMENTS_BUCKET,
  safeRequestDocumentFilename,
} from '@/lib/requestDocuments'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

export const runtime = 'nodejs'

type RouteParams = { params: Promise<{ token: string }> }

function text(value: unknown): string {
  return String(value ?? '').trim()
}

export async function POST(request: NextRequest, context: RouteParams) {
  const { token } = await context.params
  try {
    const admin = createSupabaseServiceRoleClient()
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
    const { error: uploadError } = await admin.storage
      .from(REQUEST_DOCUMENTS_BUCKET)
      .upload(storagePath, buffer, { contentType, upsert: false })

    if (uploadError) {
      return NextResponse.json({ ok: false, error: uploadError.message }, { status: 500 })
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

    if (insertError) {
      await admin.storage.from(REQUEST_DOCUMENTS_BUCKET).remove([storagePath])
      return NextResponse.json({ ok: false, error: insertError.message }, { status: 500 })
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
        filename: originalFilename,
        summary: `Family uploaded ${step.title}`,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Could not upload document.'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
