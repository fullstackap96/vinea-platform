import React from 'react'
import { maybeMissingValue } from '@/lib/missingValue'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { LabelValueGrid, LabelValueRow } from './LabelValueGrid'

export function JoinParishDetailsSection({
  detail,
}: {
  detail: Record<string, unknown> | null
}) {
  if (!detail) {
    return (
      <div>
        <h2 className={sectionHeadingClassName}>Join parish intake</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          We don&apos;t have the join parish intake details on file for this request yet.
        </p>
      </div>
    )
  }

  const moving = String(detail.moving_into_parish ?? '').trim()
  const address = String(detail.address ?? '').trim()
  const household = String(detail.household_members ?? '').trim()

  const baptized = String(detail.baptized ?? '').trim()
  const confirmed = String(detail.confirmed ?? '').trim()
  const firstCommunion = String(detail.first_communion ?? '').trim()

  const alreadyCatholic = String(detail.already_catholic ?? '').trim()
  const interestedInOcia = String(detail.interested_in_ocia ?? '').trim()

  const reason = String(detail.reason ?? '').trim()
  const notes = String(detail.notes ?? '').trim()

  return (
    <div>
      <h2 className={sectionHeadingClassName}>Join parish intake</h2>
      <LabelValueGrid>
        <LabelValueRow label="Address" value={maybeMissingValue(address || '—')} />
        <LabelValueRow label="Moving into parish" value={maybeMissingValue(moving || '—')} />
        <LabelValueRow
          label="Household members"
          value={maybeMissingValue(household || '—')}
        />
        <LabelValueRow label="Baptized" value={maybeMissingValue(baptized || '—')} />
        <LabelValueRow label="Confirmed" value={maybeMissingValue(confirmed || '—')} />
        <LabelValueRow
          label="First Communion"
          value={maybeMissingValue(firstCommunion || '—')}
        />
        <LabelValueRow
          label="Already Catholic"
          value={maybeMissingValue(alreadyCatholic || '—')}
        />
        <LabelValueRow
          label="Interested in OCIA"
          value={maybeMissingValue(interestedInOcia || '—')}
        />
        <LabelValueRow label="Reason" value={maybeMissingValue(reason || '—')} />
        <LabelValueRow label="Notes" value={maybeMissingValue(notes || '—')} />
      </LabelValueGrid>
    </div>
  )
}

