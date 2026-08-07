'use client'

import { FileText } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { secondaryButtonMd } from '@/lib/buttonStyles'
import { VineaConfirmDialog } from '@/app/dashboard/_components/VineaConfirmDialog'
import {
  RECORD_CERTIFICATE_CONFIRMATION_TIMEOUT_MS,
  RECORD_CERTIFICATE_REFRESH_REQUIRED_MESSAGE,
  RECORD_CERTIFICATE_RETRYABLE_ERROR_MESSAGE,
} from '@/lib/recordCertificateClientConfirmation'

type Props = {
  recordId: string
  className?: string
  showIcon?: boolean
}

export function RecordCertificateDownloadButton({
  recordId,
  className = '',
  showIcon = false,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [generationRequiresRefresh, setGenerationRequiresRefresh] = useState(false)
  const generationInFlightRef = useRef(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  async function generateCertificate() {
    if (generationInFlightRef.current || generationRequiresRefresh) return

    generationInFlightRef.current = true
    setIsGenerating(true)
    setErrorMessage('')
    const previewWindow = window.open('', '_blank')
    if (previewWindow) previewWindow.opener = null

    try {
      const response = await fetch(`/api/records/${encodeURIComponent(recordId)}/certificate`, {
        method: 'POST',
        credentials: 'include',
        signal: AbortSignal.timeout(RECORD_CERTIFICATE_CONFIRMATION_TIMEOUT_MS),
      })
      if (!mountedRef.current) {
        previewWindow?.close()
        return
      }
      if (!response.ok) {
        previewWindow?.close()
        setErrorMessage(RECORD_CERTIFICATE_RETRYABLE_ERROR_MESSAGE)
        return
      }
      if (response.headers.get('content-type') !== 'application/pdf') {
        previewWindow?.close()
        setGenerationRequiresRefresh(true)
        setErrorMessage(RECORD_CERTIFICATE_REFRESH_REQUIRED_MESSAGE)
        return
      }

      const certificateBlob = await response.blob()
      if (!mountedRef.current) {
        previewWindow?.close()
        return
      }
      if (certificateBlob.size <= 0) {
        previewWindow?.close()
        setGenerationRequiresRefresh(true)
        setErrorMessage(RECORD_CERTIFICATE_REFRESH_REQUIRED_MESSAGE)
        return
      }

      const objectUrl = URL.createObjectURL(certificateBlob)
      if (previewWindow) {
        previewWindow.location.replace(objectUrl)
      } else {
        const fallbackLink = document.createElement('a')
        fallbackLink.href = objectUrl
        fallbackLink.download = 'baptism-certificate.pdf'
        fallbackLink.click()
      }
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
    } catch {
      previewWindow?.close()
      if (!mountedRef.current) return
      setGenerationRequiresRefresh(true)
      setErrorMessage(RECORD_CERTIFICATE_REFRESH_REQUIRED_MESSAGE)
    } finally {
      generationInFlightRef.current = false
      if (mountedRef.current) setIsGenerating(false)
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        className={`${secondaryButtonMd} w-full justify-center gap-2 sm:w-auto`}
        disabled={isGenerating || generationRequiresRefresh}
        onClick={() => setConfirmOpen(true)}
      >
        {showIcon ? <FileText className="h-4 w-4 shrink-0" aria-hidden /> : null}
        {isGenerating
          ? 'Preparing certificate...'
          : generationRequiresRefresh
            ? 'Refresh required'
            : 'Generate certificate'}
      </button>
      {errorMessage ? (
        <p className="mt-2 max-w-sm text-sm text-red-800" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <VineaConfirmDialog
        open={confirmOpen}
        title="Generate this Baptism certificate?"
        description="Vinea will prepare a PDF from the current sacramental record values and log certificate activity for staff review."
        warning="Review the register details first. This action does not determine sacramental eligibility or make a canonical decision."
        confirmLabel="Generate certificate"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          void generateCertificate()
        }}
      />
    </div>
  )
}
