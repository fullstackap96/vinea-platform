import React from 'react'
import { Calendar } from 'lucide-react'
import { OCIA_PLACEHOLDER_PARISH_STATUS } from '@/lib/ensureOciaRequestDetails'
import {
  labelContactMethod,
  labelSacramentalBackground,
  labelSeeking,
} from '@/lib/ociaIntakeOptions'
import { FormattedDateTimeOrMissing, maybeMissingValue } from '@/lib/missingValue'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { FieldLabel, LabelValueGrid, LabelValueRow } from './LabelValueGrid'

export function OciaDetailsSection({ detail }: { detail: Record<string, unknown> | null }) {
  if (!detail) {
    return (
      <div>
        <h2 className={sectionHeadingClassName}>OCIA intake</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          We don&apos;t have the full OCIA intake on file for this request yet. That&apos;s fine—you
          can still add a confirmed meeting time on this page whenever you&apos;re ready. When you
          save it, we&apos;ll set up what we need in the background. To add the rest of the
          inquirer&apos;s details, open{' '}
          <span className="font-medium text-gray-900">Edit request details</span> when you have a
          moment.
        </p>
      </div>
    )
  }

  const dob = detail.date_of_birth ? String(detail.date_of_birth) : ''
  const ageNote = String(detail.age_or_dob_note || '').trim()

  const isPlaceholderIntake =
    String(detail.parishioner_status ?? '').trim() === OCIA_PLACEHOLDER_PARISH_STATUS

  return (
    <div>
      <h2 className={sectionHeadingClassName}>OCIA intake</h2>

      {isPlaceholderIntake ? (
        <p className="mb-3 text-sm text-gray-700 leading-relaxed rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
          A few intake answers are still missing below—that&apos;s expected for now. You can go
          ahead and schedule the OCIA meeting on this page; nothing here blocks that. When you have
          the inquirer&apos;s information, choose{' '}
          <span className="font-medium text-gray-900">Edit request details</span> to fill in the
          rest at your own pace.
        </p>
      ) : null}

      <div>
        <LabelValueGrid>
          <LabelValueRow label="Date of birth" value={maybeMissingValue(dob || '—')} />
          <LabelValueRow label="Age / DOB (as entered)" value={maybeMissingValue(ageNote || '—')} />
          <LabelValueRow
            label="Sacramental background"
            value={maybeMissingValue(
              labelSacramentalBackground(String(detail.sacramental_background))
            )}
          />
          <LabelValueRow
            label="Seeking"
            value={maybeMissingValue(labelSeeking(String(detail.seeking)))}
          />
          <LabelValueRow
            label="Parishioner status"
            value={maybeMissingValue(String(detail.parishioner_status || '—').trim() || '—')}
          />
          <LabelValueRow
            label="Preferred contact"
            value={maybeMissingValue(labelContactMethod(String(detail.preferred_contact_method)))}
          />
          <LabelValueRow
            label="Availability"
            value={maybeMissingValue(String(detail.availability || '—').trim() || '—')}
          />
          <LabelValueRow
            label={<FieldLabel icon={Calendar}>Confirmed OCIA meeting</FieldLabel>}
            value={<FormattedDateTimeOrMissing value={detail['confirmed_session_at'] as string | null} />}
          />
        </LabelValueGrid>
      </div>
    </div>
  )
}
