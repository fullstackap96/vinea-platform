'use client'

import { suggestCertificateForRecord } from '@/lib/relationshipIntelligence/suggestCertificateForRecord'
import { vineaSectionShellClassName } from '@/lib/vineaUi'
import { RecordCertificateDownloadButton } from './RecordCertificateDownloadButton'

type Props = {
  recordId: string
  record_type: unknown
  person_name: unknown
  hasCertificateEvent: boolean
}

export function RecordCertificateSuggestion({
  recordId,
  record_type,
  person_name,
  hasCertificateEvent,
}: Props) {
  const suggestion = suggestCertificateForRecord({
    recordId,
    record_type,
    person_name,
    hasCertificateEvent,
  })

  if (!suggestion) return null

  return (
    <div
      className={`mb-6 border border-amber-200/90 bg-amber-50/80 ${vineaSectionShellClassName}`}
      role="status"
    >
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-950">
        Suggested action
      </h2>
      <p className="text-sm leading-relaxed text-amber-950/90">
        No baptism certificate has been generated for this register entry yet.
      </p>
      <RecordCertificateDownloadButton recordId={recordId} className="mt-4" />
    </div>
  )
}
