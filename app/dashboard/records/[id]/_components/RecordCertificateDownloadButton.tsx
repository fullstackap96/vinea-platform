'use client'

import { FileText } from 'lucide-react'
import { useState } from 'react'

import { secondaryButtonMd } from '@/lib/buttonStyles'
import { VineaConfirmDialog } from '@/app/dashboard/_components/VineaConfirmDialog'

type Props = {
  recordId: string
  className?: string
  showIcon?: boolean
}

const CERTIFICATE_ERROR = 'Could not generate certificate. Please try again.'

export function RecordCertificateDownloadButton({
  recordId,
  className = '',
  showIcon = false,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function generateCertificate() {
    if (isGenerating) return

    setIsGenerating(true)
    setErrorMessage('')
    const previewWindow = window.open('', '_blank')
    if (previewWindow) previewWindow.opener = null

    try {
      const response = await fetch(`/api/records/${encodeURIComponent(recordId)}/certificate`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok || response.headers.get('content-type') !== 'application/pdf') {
        throw new Error('Certificate response was not available.')
      }

      const objectUrl = URL.createObjectURL(await response.blob())
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
      setErrorMessage(CERTIFICATE_ERROR)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        className={`${secondaryButtonMd} w-full justify-center gap-2 sm:w-auto`}
        disabled={isGenerating}
        onClick={() => setConfirmOpen(true)}
      >
        {showIcon ? <FileText className="h-4 w-4 shrink-0" aria-hidden /> : null}
        {isGenerating ? 'Preparing certificate...' : 'Generate certificate'}
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
