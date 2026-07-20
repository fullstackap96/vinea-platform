'use client'

import { useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Upload } from 'lucide-react'
import { primaryButtonMd } from '@/lib/buttonStyles'
import {
  formatRequestDocumentFileSize,
  REQUEST_DOCUMENT_ACCEPT_ATTRIBUTE,
  REQUEST_DOCUMENT_MAX_FILE_BYTES,
  requestDocumentStatusLabel,
  type RequestDocument,
} from '@/lib/requestDocuments'
import {
  familyPortalDocumentUploadUnconfirmedMessage,
  safeFamilyPortalDocumentUploadMessage,
} from '@/lib/familyPortalDocumentClientMessages'
import { workflowStepStatusLabel, type RequestWorkflowStep } from '@/lib/requestWorkflowSteps'
import { InlineFormMessage } from '@/lib/inlineFormMessage'

const FAMILY_PORTAL_UPLOAD_TIMEOUT_MS = 60_000

function isFamilyPortalUploadTimeout(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'TimeoutError' || error.name === 'AbortError')
  )
}

function formatDueDate(value: string | null): string {
  if (!value) return 'No due date'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function statusClasses(status: string): string {
  if (status === 'approved') return 'bg-emerald-50 text-emerald-800'
  if (status === 'rejected') return 'bg-rose-50 text-rose-800'
  return 'bg-amber-50 text-amber-900'
}

export function FamilyRequestDocumentsPortal({
  token,
  steps,
  documents,
}: {
  token: string
  steps: RequestWorkflowStep[]
  documents: RequestDocument[]
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const uploadInFlightRef = useRef(false)
  const [selectedStepId, setSelectedStepId] = useState(steps[0]?.id ?? '')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const documentsByStep = useMemo(() => {
    const map = new Map<string, RequestDocument[]>()
    for (const document of documents) {
      if (!document.workflow_step_id) continue
      map.set(document.workflow_step_id, [...(map.get(document.workflow_step_id) ?? []), document])
    }
    return map
  }, [documents])

  async function uploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (uploadInFlightRef.current) return

    const file = fileInputRef.current?.files?.[0]
    if (!selectedStepId) {
      setMessage('Choose the document you are uploading.')
      return
    }
    if (!file) {
      setMessage('Choose a file to upload.')
      return
    }
    if (file.size > REQUEST_DOCUMENT_MAX_FILE_BYTES) {
      setMessage(safeFamilyPortalDocumentUploadMessage('Documents must be 10 MB or smaller.'))
      return
    }

    uploadInFlightRef.current = true
    setUploading(true)
    setMessage('')
    try {
      const formData = new FormData()
      formData.set('workflowStepId', selectedStepId)
      formData.set('file', file)
      const response = await fetch(`/api/family/request-portal/${token}/documents`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(FAMILY_PORTAL_UPLOAD_TIMEOUT_MS),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.ok) {
        throw new Error(safeFamilyPortalDocumentUploadMessage(payload?.error))
      }
      setMessage('Thank you. Your document was uploaded for parish review.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      window.location.reload()
    } catch (error) {
      setMessage(
        safeFamilyPortalDocumentUploadMessage(
          isFamilyPortalUploadTimeout(error)
            ? familyPortalDocumentUploadUnconfirmedMessage
            : error,
        ),
      )
    } finally {
      uploadInFlightRef.current = false
      setUploading(false)
    }
  }

  return (
    <div className="space-y-5">
      <form
        method="post"
        onSubmit={uploadDocument}
        className="rounded-xl border border-gray-200 bg-white p-4"
        aria-busy={uploading}
      >
        <h2 className="text-base font-semibold text-gray-900">Upload a document</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
          <label className="block text-sm">
            <span className="font-medium text-gray-800">Requested document</span>
            <select
              value={selectedStepId}
              disabled={uploading}
              onChange={(event) => setSelectedStepId(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {steps.map((step) => (
                <option key={step.id} value={step.id}>
                  {step.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-gray-800">File</span>
            <input
              ref={fileInputRef}
              type="file"
              accept={REQUEST_DOCUMENT_ACCEPT_ATTRIBUTE}
              disabled={uploading}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <button type="submit" disabled={uploading} className={`${primaryButtonMd} justify-center`}>
            <Upload className="h-4 w-4" aria-hidden />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        {message ? <InlineFormMessage message={message} className="!mt-4" /> : null}
      </form>

      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-base font-semibold text-gray-900">Requested documents</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {steps.map((step) => {
            const stepDocuments = documentsByStep.get(step.id) ?? []
            return (
              <div key={step.id} className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                    {step.description ? (
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">{step.description}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-gray-500">
                      {step.required ? 'Required' : 'Optional'} | Due: {formatDueDate(step.due_date)} | Status:{' '}
                      {workflowStepStatusLabel(step.status)}
                    </p>
                  </div>
                  <span className="inline-flex w-fit rounded-full bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
                    {stepDocuments.length === 0
                      ? 'Not uploaded yet'
                      : `${stepDocuments.length} uploaded`}
                  </span>
                </div>
                {stepDocuments.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {stepDocuments.map((document) => (
                      <div
                        key={document.id}
                        className="flex flex-col gap-1 rounded-lg bg-gray-50 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{document.original_filename}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded {formatDate(document.created_at)} |{' '}
                            {formatRequestDocumentFileSize(document.file_size_bytes)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex w-fit rounded-full px-2 py-1 text-xs font-semibold ${statusClasses(
                            document.status
                          )}`}
                        >
                          {requestDocumentStatusLabel(document.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
