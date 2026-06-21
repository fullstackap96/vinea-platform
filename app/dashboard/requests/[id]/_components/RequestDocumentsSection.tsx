'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Download, FileText, Upload } from 'lucide-react'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import {
  formatRequestDocumentFileSize,
  normalizeRequestDocumentRow,
  requestDocumentStatusLabel,
  type RequestDocument,
  type RequestDocumentStatus,
} from '@/lib/requestDocuments'
import type { RequestWorkflowStep } from '@/lib/requestWorkflowSteps'
import { InlineFormMessage } from '@/lib/inlineFormMessage'

function statusClasses(status: RequestDocumentStatus): string {
  if (status === 'approved') return 'bg-emerald-50 text-emerald-800'
  if (status === 'rejected') return 'bg-rose-50 text-rose-800'
  return 'bg-amber-50 text-amber-900'
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function RequestDocumentsSection({
  requestId,
  workflowSteps,
}: {
  requestId: string
  workflowSteps: RequestWorkflowStep[]
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [documents, setDocuments] = useState<RequestDocument[]>([])
  const [documentType, setDocumentType] = useState('')
  const [workflowStepId, setWorkflowStepId] = useState('')
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [reviewingId, setReviewingId] = useState('')
  const [downloadingId, setDownloadingId] = useState('')
  const [creatingPortalLink, setCreatingPortalLink] = useState(false)
  const [portalLink, setPortalLink] = useState('')

  const stepTitleById = useMemo(() => {
    const map = new Map<string, string>()
    for (const step of workflowSteps) map.set(step.id, step.title)
    return map
  }, [workflowSteps])

  const loadDocuments = useCallback(async () => {
    if (!requestId) return
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(`/api/requests/${requestId}/documents`)
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || 'Could not load documents.')
      }
      setDocuments(
        (payload.documents ?? [])
          .map((row: Record<string, unknown>) => normalizeRequestDocumentRow(row))
          .filter((document: RequestDocument | null): document is RequestDocument => Boolean(document))
      )
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not load documents.')
    } finally {
      setLoading(false)
    }
  }, [requestId])

  useEffect(() => {
    void loadDocuments()
  }, [loadDocuments])

  async function uploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setMessage('Choose a document to upload.')
      return
    }

    setUploading(true)
    setMessage('')
    try {
      const formData = new FormData()
      formData.set('file', file)
      formData.set('documentType', documentType)
      formData.set('workflowStepId', workflowStepId)
      const response = await fetch(`/api/requests/${requestId}/documents`, {
        method: 'POST',
        body: formData,
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || 'Could not upload document.')
      }
      setDocumentType('')
      setWorkflowStepId('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      setMessage('Document uploaded for staff review.')
      await loadDocuments()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not upload document.')
    } finally {
      setUploading(false)
    }
  }

  async function reviewDocument(documentId: string, status: 'approved' | 'rejected') {
    setReviewingId(documentId)
    setMessage('')
    try {
      const response = await fetch(`/api/requests/${requestId}/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewNote: reviewNotes[documentId] ?? '' }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || 'Could not review document.')
      }
      setMessage(status === 'approved' ? 'Document approved.' : 'Document rejected.')
      await loadDocuments()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not review document.')
    } finally {
      setReviewingId('')
    }
  }

  async function openDocument(documentId: string) {
    setDownloadingId(documentId)
    setMessage('')
    try {
      const response = await fetch(`/api/requests/${requestId}/documents/${documentId}`)
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.ok || !payload.url) {
        throw new Error(payload?.error || 'Could not open document.')
      }
      window.open(payload.url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not open document.')
    } finally {
      setDownloadingId('')
    }
  }

  async function createPortalLink() {
    setCreatingPortalLink(true)
    setMessage('')
    try {
      const response = await fetch(`/api/requests/${requestId}/portal-token`, {
        method: 'POST',
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.ok || !payload.url) {
        throw new Error(payload?.error || 'Could not create family upload link.')
      }
      setPortalLink(payload.url)
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload.url)
        setMessage('Family upload link copied. It expires in 30 days.')
      } else {
        setMessage('Family upload link created. Copy it below.')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not create family upload link.')
    } finally {
      setCreatingPortalLink(false)
    }
  }

  return (
    <section className="mt-6 border-t border-gray-100 pt-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Request documents</h4>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-gray-500">
            Upload certificates, forms, programs, or other paperwork and tie them to a workflow step
            when helpful.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          {loading ? <span className="text-xs text-gray-500">Loading documents...</span> : null}
          <button
            type="button"
            onClick={() => void createPortalLink()}
            disabled={creatingPortalLink}
            className={`${secondaryButtonMd} justify-center`}
          >
            {creatingPortalLink ? 'Creating link...' : 'Create family upload link'}
          </button>
        </div>
      </div>

      {portalLink ? (
        <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-sky-900">
            Family upload link
          </label>
          <input
            readOnly
            value={portalLink}
            className="mt-2 block w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm text-sky-950"
            onFocus={(event) => event.currentTarget.select()}
          />
          <p className="mt-2 text-xs leading-relaxed text-sky-900">
            Share this with the family when they need to upload requested documents. The link expires
            in 30 days.
          </p>
        </div>
      ) : null}

      <form onSubmit={uploadDocument} className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto] lg:items-end">
          <label className="block text-sm">
            <span className="font-medium text-gray-800">Document</span>
            <input
              ref={fileInputRef}
              type="file"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-gray-800">Type</span>
            <input
              value={documentType}
              onChange={(event) => setDocumentType(event.target.value)}
              placeholder="Birth certificate"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-gray-800">Workflow step</span>
            <select
              value={workflowStepId}
              onChange={(event) => setWorkflowStepId(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">No step</option>
              {workflowSteps.map((step) => (
                <option key={step.id} value={step.id}>
                  {step.title}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={uploading} className={`${primaryButtonMd} justify-center`}>
            <Upload className="h-4 w-4" aria-hidden />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>

      {message ? <InlineFormMessage message={message} className="!mt-4" /> : null}

      <div className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {documents.length === 0 ? (
          <div className="px-4 py-5 text-sm text-gray-600">
            No documents have been uploaded for this request yet.
          </div>
        ) : (
          documents.map((document) => (
            <div key={document.id} className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {document.original_filename}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {document.document_type || 'General document'} |{' '}
                        {formatRequestDocumentFileSize(document.file_size_bytes)} | Uploaded{' '}
                        {formatDateTime(document.created_at)}
                      </p>
                      {document.workflow_step_id ? (
                        <p className="mt-1 text-xs text-gray-500">
                          Step: {stepTitleById.get(document.workflow_step_id) || 'Workflow step'}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${statusClasses(
                      document.status
                    )}`}
                  >
                    {requestDocumentStatusLabel(document.status)}
                  </span>
                  <button
                    type="button"
                    onClick={() => void openDocument(document.id)}
                    disabled={downloadingId === document.id}
                    className={`${secondaryButtonMd} justify-center`}
                  >
                    <Download className="h-4 w-4" aria-hidden />
                    {downloadingId === document.id ? 'Opening...' : 'Open'}
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                <input
                  value={reviewNotes[document.id] ?? document.review_note ?? ''}
                  onChange={(event) =>
                    setReviewNotes((current) => ({
                      ...current,
                      [document.id]: event.target.value,
                    }))
                  }
                  placeholder="Optional review note"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => void reviewDocument(document.id, 'approved')}
                  disabled={reviewingId === document.id}
                  className={`${primaryButtonMd} justify-center`}
                >
                  {reviewingId === document.id ? 'Saving...' : 'Approve'}
                </button>
                <button
                  type="button"
                  onClick={() => void reviewDocument(document.id, 'rejected')}
                  disabled={reviewingId === document.id}
                  className={`${secondaryButtonMd} justify-center`}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
