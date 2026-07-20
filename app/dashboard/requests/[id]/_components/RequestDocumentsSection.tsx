'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Download, FileText, Upload } from 'lucide-react'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import {
  formatRequestDocumentFileSize,
  normalizeRequestDocumentRow,
  REQUEST_DOCUMENT_ACCEPT_ATTRIBUTE,
  requestDocumentStatusLabel,
  type RequestDocument,
  type RequestDocumentStatus,
} from '@/lib/requestDocuments'
import { requestDocumentClientFailureMessage } from '@/lib/requestDocumentClientMessages'
import type { RequestWorkflowStep } from '@/lib/requestWorkflowSteps'
import { InlineFormMessage } from '@/lib/inlineFormMessage'

const REQUEST_DOCUMENT_READ_TIMEOUT_MS = 15_000
const REQUEST_DOCUMENT_WRITE_TIMEOUT_MS = 20_000
const REQUEST_DOCUMENT_UPLOAD_TIMEOUT_MS = 60_000

function isRequestDocumentTimeout(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'TimeoutError' || error.name === 'AbortError')
  )
}

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
  const mutationInFlightRef = useRef<'upload' | 'review' | 'portal-link' | null>(null)
  const documentLoadAbortRef = useRef<AbortController | null>(null)
  const documentLoadSequenceRef = useRef(0)

  const mutationBusy = uploading || Boolean(reviewingId) || creatingPortalLink

  const stepTitleById = useMemo(() => {
    const map = new Map<string, string>()
    for (const step of workflowSteps) map.set(step.id, step.title)
    return map
  }, [workflowSteps])

  const loadDocuments = useCallback(async (options?: { preserveMessage?: boolean }) => {
    if (!requestId) return

    const loadSequence = ++documentLoadSequenceRef.current
    documentLoadAbortRef.current?.abort()
    const controller = new AbortController()
    documentLoadAbortRef.current = controller
    let timedOut = false
    const timeoutId = window.setTimeout(() => {
      timedOut = true
      controller.abort()
    }, REQUEST_DOCUMENT_READ_TIMEOUT_MS)
    const isLatestLoad = () => loadSequence === documentLoadSequenceRef.current

    setLoading(true)
    if (!options?.preserveMessage) setMessage('')
    try {
      const response = await fetch(`/api/requests/${requestId}/documents`, {
        credentials: 'include',
        cache: 'no-store',
        signal: controller.signal,
      })
      const payload = await response.json().catch(() => null)
      controller.signal.throwIfAborted()
      if (!isLatestLoad()) return
      if (!response.ok || !payload?.ok) {
        throw new Error(requestDocumentClientFailureMessage('loadDocuments', payload?.error))
      }
      setDocuments(
        (payload.documents ?? [])
          .map((row: Record<string, unknown>) => normalizeRequestDocumentRow(row))
          .filter((document: RequestDocument | null): document is RequestDocument => Boolean(document))
          .filter((document: RequestDocument) => document.request_id === requestId)
      )
    } catch (error) {
      if (!isLatestLoad() || (controller.signal.aborted && !timedOut)) return
      setMessage(requestDocumentClientFailureMessage('loadDocuments', error))
    } finally {
      window.clearTimeout(timeoutId)
      if (documentLoadAbortRef.current === controller) {
        documentLoadAbortRef.current = null
      }
      if (isLatestLoad()) setLoading(false)
    }
  }, [requestId])

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) void loadDocuments()
    })
    return () => {
      cancelled = true
      documentLoadSequenceRef.current += 1
      documentLoadAbortRef.current?.abort()
      documentLoadAbortRef.current = null
    }
  }, [loadDocuments])

  async function uploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mutationInFlightRef.current) return

    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setMessage('Choose a document to upload.')
      return
    }

    mutationInFlightRef.current = 'upload'
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
        signal: AbortSignal.timeout(REQUEST_DOCUMENT_UPLOAD_TIMEOUT_MS),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.ok) {
        throw new Error(requestDocumentClientFailureMessage('uploadDocument', payload?.error))
      }
      setDocumentType('')
      setWorkflowStepId('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      setMessage('Document uploaded for staff review.')
      await loadDocuments({ preserveMessage: true })
    } catch (error) {
      setMessage(
        requestDocumentClientFailureMessage(
          isRequestDocumentTimeout(error) ? 'uploadDocumentUnconfirmed' : 'uploadDocument',
          error
        )
      )
    } finally {
      mutationInFlightRef.current = null
      setUploading(false)
    }
  }

  async function reviewDocument(documentId: string, status: 'approved' | 'rejected') {
    if (mutationInFlightRef.current) return

    mutationInFlightRef.current = 'review'
    setReviewingId(documentId)
    setMessage('')
    try {
      const response = await fetch(`/api/requests/${requestId}/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewNote: reviewNotes[documentId] ?? '' }),
        signal: AbortSignal.timeout(REQUEST_DOCUMENT_WRITE_TIMEOUT_MS),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.ok) {
        throw new Error(requestDocumentClientFailureMessage('reviewDocument', payload?.error))
      }
      setMessage(status === 'approved' ? 'Document approved.' : 'Document rejected.')
      await loadDocuments({ preserveMessage: true })
    } catch (error) {
      setMessage(
        requestDocumentClientFailureMessage(
          isRequestDocumentTimeout(error) ? 'reviewDocumentUnconfirmed' : 'reviewDocument',
          error
        )
      )
    } finally {
      mutationInFlightRef.current = null
      setReviewingId('')
    }
  }

  async function openDocument(documentId: string) {
    setDownloadingId(documentId)
    setMessage('')
    const documentWindow = window.open('', '_blank')
    if (documentWindow) documentWindow.opener = null
    if (!documentWindow) {
      setMessage(requestDocumentClientFailureMessage('openDocumentPopupBlocked'))
      setDownloadingId('')
      return
    }

    try {
      const response = await fetch(`/api/requests/${requestId}/documents/${documentId}`, {
        credentials: 'include',
        cache: 'no-store',
        signal: AbortSignal.timeout(REQUEST_DOCUMENT_READ_TIMEOUT_MS),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.ok || !payload.url) {
        throw new Error(requestDocumentClientFailureMessage('openDocument', payload?.error))
      }
      documentWindow.location.replace(payload.url)
    } catch (error) {
      documentWindow.close()
      setMessage(requestDocumentClientFailureMessage('openDocument', error))
    } finally {
      setDownloadingId('')
    }
  }

  async function createPortalLink() {
    if (mutationInFlightRef.current) return

    mutationInFlightRef.current = 'portal-link'
    setCreatingPortalLink(true)
    setMessage('')
    try {
      const response = await fetch(`/api/requests/${requestId}/portal-token`, {
        method: 'POST',
        signal: AbortSignal.timeout(REQUEST_DOCUMENT_WRITE_TIMEOUT_MS),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.ok || !payload.url) {
        throw new Error(requestDocumentClientFailureMessage('createFamilyUploadLink', payload?.error))
      }
      setPortalLink(payload.url)
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload.url)
        setMessage('Family upload link copied. It expires in 30 days.')
      } else {
        setMessage('Family upload link created. Copy it below.')
      }
    } catch (error) {
      setMessage(
        requestDocumentClientFailureMessage(
          isRequestDocumentTimeout(error)
            ? 'createFamilyUploadLinkUnconfirmed'
            : 'createFamilyUploadLink',
          error
        )
      )
    } finally {
      mutationInFlightRef.current = null
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
            disabled={mutationBusy}
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

      <form
        method="post"
        onSubmit={uploadDocument}
        className="mt-4 rounded-xl border border-gray-200 bg-white p-4"
        aria-busy={mutationBusy}
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto] lg:items-end">
          <label className="block text-sm">
            <span className="font-medium text-gray-800">Document</span>
            <input
              ref={fileInputRef}
              type="file"
              accept={REQUEST_DOCUMENT_ACCEPT_ATTRIBUTE}
              disabled={mutationBusy}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-gray-800">Type</span>
            <input
              value={documentType}
              disabled={mutationBusy}
              onChange={(event) => setDocumentType(event.target.value)}
              placeholder="Birth certificate"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-gray-800">Workflow step</span>
            <select
              value={workflowStepId}
              disabled={mutationBusy}
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
          <button type="submit" disabled={mutationBusy} className={`${primaryButtonMd} justify-center`}>
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
                  disabled={mutationBusy}
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
                  disabled={mutationBusy}
                  className={`${primaryButtonMd} justify-center`}
                >
                  {reviewingId === document.id ? 'Saving...' : 'Approve'}
                </button>
                <button
                  type="button"
                  onClick={() => void reviewDocument(document.id, 'rejected')}
                  disabled={mutationBusy}
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
