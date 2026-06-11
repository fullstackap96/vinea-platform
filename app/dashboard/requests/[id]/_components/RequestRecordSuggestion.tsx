'use client'

import Link from 'next/link'
import { WorkflowSectionCard } from './WorkflowSectionCard'
import { secondaryButtonMd } from '@/lib/buttonStyles'
import { formatRequestType } from '@/lib/formatRequestType'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import { suggestRecordForRequest } from '@/lib/relationshipIntelligence/suggestRecordForRequest'

type Props = {
  requestId: string
  status: unknown
  request_type: unknown
  hasSacramentalRecord: boolean
}

export function RequestRecordSuggestion({
  requestId,
  status,
  request_type,
  hasSacramentalRecord,
}: Props) {
  const suggestion = suggestRecordForRequest({
    requestId,
    status,
    request_type,
    requestIdsWithRecords: hasSacramentalRecord ? new Set([requestId]) : new Set(),
  })

  if (!suggestion) return null

  const requestTypeLabel = formatRequestType(requestTypeFromRow({ request_type }))

  return (
    <WorkflowSectionCard
      title="Suggested next step"
      description="Register entry — staff must review and save the form."
    >
      <p className="text-sm leading-relaxed text-gray-700">
        This {requestTypeLabel.toLowerCase()} request is complete but has no sacramental register
        entry yet.
      </p>
      <div className="mt-4">
        <Link
          href={`/dashboard/records/new?requestId=${encodeURIComponent(requestId)}`}
          className={`${secondaryButtonMd} w-full justify-center sm:w-auto`}
        >
          Prefill new record
        </Link>
      </div>
    </WorkflowSectionCard>
  )
}
