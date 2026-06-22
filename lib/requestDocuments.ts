export const REQUEST_DOCUMENTS_BUCKET = 'request-documents'
export const REQUEST_DOCUMENT_MAX_FILE_BYTES = 10 * 1024 * 1024
export const REQUEST_DOCUMENT_STORAGE_NOT_CONFIGURED_MESSAGE =
  'Request document storage is not configured yet. Apply the document portal migrations and storage bucket before uploading documents.'

export type RequestDocumentStatus = 'pending_review' | 'approved' | 'rejected'

export type RequestDocument = {
  id: string
  request_id: string
  workflow_step_id: string | null
  document_type: string | null
  original_filename: string
  content_type: string | null
  file_size_bytes: number | null
  status: RequestDocumentStatus
  uploaded_by_email: string | null
  reviewed_by_email: string | null
  reviewed_at: string | null
  review_note: string | null
  created_at: string
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}

export function isRequestDocumentsTableMissing(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false

  return (
    error.code === 'PGRST205' &&
    String(error.message ?? '').includes("public.request_documents")
  )
}

export function safeRequestDocumentFilename(value: unknown): string {
  const raw = text(value).replaceAll('\\', '/').split('/').pop() || 'document'
  const cleaned = raw
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^\.+/, '')
    .slice(0, 140)
  return cleaned || 'document'
}

export function normalizeRequestDocumentStatus(value: unknown): RequestDocumentStatus {
  const normalized = text(value)
  if (normalized === 'approved' || normalized === 'rejected') return normalized
  return 'pending_review'
}

export function requestDocumentStatusLabel(value: unknown): string {
  switch (normalizeRequestDocumentStatus(value)) {
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
    default:
      return 'Pending review'
  }
}

export function normalizeRequestDocumentRow(value: Record<string, unknown>): RequestDocument | null {
  const id = text(value.id)
  const requestId = text(value.request_id)
  const originalFilename = text(value.original_filename)
  const createdAt = text(value.created_at)
  if (!id || !requestId || !originalFilename || !createdAt) return null

  const fileSize = Number(value.file_size_bytes)
  return {
    id,
    request_id: requestId,
    workflow_step_id: text(value.workflow_step_id) || null,
    document_type: text(value.document_type) || null,
    original_filename: originalFilename,
    content_type: text(value.content_type) || null,
    file_size_bytes: Number.isFinite(fileSize) ? fileSize : null,
    status: normalizeRequestDocumentStatus(value.status),
    uploaded_by_email: text(value.uploaded_by_email) || null,
    reviewed_by_email: text(value.reviewed_by_email) || null,
    reviewed_at: text(value.reviewed_at) || null,
    review_note: text(value.review_note) || null,
    created_at: createdAt,
  }
}

export function formatRequestDocumentFileSize(bytes: number | null): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return 'Unknown size'
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(kb >= 10 ? 0 : 1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`
}
