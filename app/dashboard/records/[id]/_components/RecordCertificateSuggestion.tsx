'use client'

import { suggestCertificateForRecord } from '@/lib/relationshipIntelligence/suggestCertificateForRecord'
import { secondaryButtonMd } from '@/lib/buttonStyles'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

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
      <a
        href={`/api/records/${recordId}/certificate`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${secondaryButtonMd} mt-4 inline-flex justify-center`}
      >
        Generate certificate
      </a>
    </div>
  )
}
