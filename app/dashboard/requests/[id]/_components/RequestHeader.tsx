import React, { useEffect, useState } from 'react'
import { Activity, Calendar, Clock, Mail, Phone, User } from 'lucide-react'
import { FormattedDateTimeOrMissing, maybeMissingValue } from '@/lib/missingValue'
import { sectionSubheadingClassName } from '@/lib/sectionHeader'
import { FieldLabel, LabelValueGrid, LabelValueRow } from './LabelValueGrid'
import { RequestTypeBadge } from '@/app/_components/RequestTypeBadge'
import { REQUEST_STATUS_SEGMENTS } from '@/lib/requestStatus'
import { ParishRequestStatusBadgeWithTooltip } from '@/lib/ParishRequestStatusBadge'
import type { RequestScheduleRow } from '@/lib/requestConfirmedSchedule'
import {
  labelContactMethod,
  labelSacramentalBackground,
  labelSeeking,
} from '@/lib/ociaIntakeOptions'
import { REQUEST_WAITING_ON_OPTIONS } from '@/lib/requestWaitingOn'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'

type IntakeProps = {
  parishioner: any
  request: any
  funeralDetail?: any | null
  weddingDetail?: any | null
  ociaDetail?: any | null
  /** When true, hide contact + intake + notes (used while staff edit intake in a separate form). */
  intakeDetailsHidden?: boolean
  /** Hide name / email / phone (shown separately in Contact Information card). */
  omitContactFields?: boolean
}

/** Contact + type-specific intake + family notes (left column). */
export function RequestContactIntakeSection({
  parishioner,
  request,
  funeralDetail,
  weddingDetail,
  ociaDetail,
  intakeDetailsHidden,
  omitContactFields,
}: IntakeProps) {
  const requestType = String(request?.request_type || 'baptism')
  const isFuneral = requestType === 'funeral'
  const isWedding = requestType === 'wedding'
  const isOcia = requestType === 'ocia'

  return (
    <div>
      <div className="mb-4">
        <RequestTypeBadge requestType={requestType} />
      </div>

      {!intakeDetailsHidden ? (
        <LabelValueGrid>
          {!omitContactFields ? (
            <>
              <LabelValueRow
                label={<FieldLabel icon={User}>Contact</FieldLabel>}
                value={maybeMissingValue(String(parishioner?.full_name ?? '').trim() || '—')}
              />
              <LabelValueRow
                label={<FieldLabel icon={Mail}>Email</FieldLabel>}
                value={maybeMissingValue(String(parishioner?.email ?? '').trim() || '—')}
              />
              <LabelValueRow
                label={<FieldLabel icon={Phone}>Phone</FieldLabel>}
                value={maybeMissingValue(String(parishioner?.phone ?? '').trim() || '—')}
              />
            </>
          ) : null}

          {isFuneral ? (
            <>
              <LabelValueRow
                label="Deceased"
                value={maybeMissingValue(String(funeralDetail?.deceased_name ?? '').trim() || '—')}
              />
              <LabelValueRow
                label={<FieldLabel icon={Calendar}>Date of death</FieldLabel>}
                value={maybeMissingValue(
                  funeralDetail?.date_of_death
                    ? String(funeralDetail.date_of_death)
                    : '—'
                )}
              />
              <LabelValueRow
                label="Funeral home / location"
                value={maybeMissingValue(
                  String(funeralDetail?.funeral_home_or_location ?? '').trim() || '—'
                )}
              />
              <LabelValueRow
                label="Preferred service notes"
                value={maybeMissingValue(
                  String(funeralDetail?.preferred_service_notes ?? '').trim() || '—'
                )}
              />
              <LabelValueRow
                label={<FieldLabel icon={Calendar}>Confirmed service time</FieldLabel>}
                value={<FormattedDateTimeOrMissing value={funeralDetail?.confirmed_service_at} />}
              />
            </>
          ) : isWedding ? (
            <>
              <LabelValueRow
                label="Partner 1"
                value={maybeMissingValue(String(weddingDetail?.partner_one_name ?? '').trim() || '—')}
              />
              <LabelValueRow
                label="Partner 2"
                value={maybeMissingValue(String(weddingDetail?.partner_two_name ?? '').trim() || '—')}
              />
              <LabelValueRow
                label={<FieldLabel icon={Calendar}>Proposed wedding date</FieldLabel>}
                value={maybeMissingValue(
                  weddingDetail?.proposed_wedding_date
                    ? String(weddingDetail.proposed_wedding_date)
                    : '—'
                )}
              />
              <LabelValueRow
                label="Ceremony notes"
                value={maybeMissingValue(String(weddingDetail?.ceremony_notes ?? '').trim() || '—')}
              />
              <LabelValueRow
                label={<FieldLabel icon={Calendar}>Confirmed ceremony time</FieldLabel>}
                value={<FormattedDateTimeOrMissing value={weddingDetail?.confirmed_ceremony_at} />}
              />
            </>
          ) : isOcia ? (
            <>
              <LabelValueRow
                label={<FieldLabel icon={Calendar}>Date of birth</FieldLabel>}
                value={maybeMissingValue(
                  ociaDetail?.date_of_birth ? String(ociaDetail.date_of_birth) : '—'
                )}
              />
              <LabelValueRow
                label="Age / DOB note"
                value={maybeMissingValue(String(ociaDetail?.age_or_dob_note ?? '').trim() || '—')}
              />
              <LabelValueRow
                label="Sacramental background"
                value={maybeMissingValue(
                  labelSacramentalBackground(ociaDetail?.sacramental_background)
                )}
              />
              <LabelValueRow
                label="Seeking"
                value={maybeMissingValue(labelSeeking(ociaDetail?.seeking))}
              />
              <LabelValueRow
                label="Parishioner status"
                value={maybeMissingValue(
                  String(ociaDetail?.parishioner_status ?? '').trim() || '—'
                )}
              />
              <LabelValueRow
                label="Preferred contact"
                value={maybeMissingValue(
                  labelContactMethod(ociaDetail?.preferred_contact_method)
                )}
              />
              <LabelValueRow
                label="Availability"
                value={maybeMissingValue(String(ociaDetail?.availability ?? '').trim() || '—')}
              />
              <LabelValueRow
                label={<FieldLabel icon={Calendar}>Confirmed OCIA meeting</FieldLabel>}
                value={<FormattedDateTimeOrMissing value={ociaDetail?.confirmed_session_at} />}
              />
            </>
          ) : (
            <>
              <LabelValueRow
                label="Child"
                value={maybeMissingValue(String(request?.child_name ?? '').trim() || '—')}
              />
              <LabelValueRow
                label={<FieldLabel icon={Calendar}>Preferred dates</FieldLabel>}
                value={maybeMissingValue(String(request?.preferred_dates ?? '').trim() || '—')}
              />
              <LabelValueRow
                label={<FieldLabel icon={Calendar}>Confirmed baptism date</FieldLabel>}
                value={<FormattedDateTimeOrMissing value={request?.confirmed_baptism_date} />}
              />
            </>
          )}

          <LabelValueRow
            label="Notes"
            value={maybeMissingValue(String(request?.notes ?? '').trim() || '—')}
          />
        </LabelValueGrid>
      ) : (
        <p className="text-sm text-gray-600">
          Intake details are open for editing below.
        </p>
      )}
    </div>
  )
}

/** Status chip + update controls (right column). */
export function RequestStatusSection({
  request,
  scheduleRow,
  onUpdateStatus,
}: {
  request: any
  scheduleRow: RequestScheduleRow
  onUpdateStatus: (newStatus: string) => void
}) {
  const currentStatus = String(request?.status || '')

  return (
    <div className="space-y-5 text-sm sm:text-base text-gray-800">
      <LabelValueGrid>
        <LabelValueRow
          label={<FieldLabel icon={Activity}>Status</FieldLabel>}
          value={
            <span className="inline-flex flex-wrap items-center gap-2">
              <ParishRequestStatusBadgeWithTooltip
                request={{
                  status: request?.status,
                  next_follow_up_date: request?.next_follow_up_date,
                  assigned_staff_name: request?.assigned_staff_name,
                  assigned_priest_name: request?.assigned_priest_name,
                  assigned_deacon_name: request?.assigned_deacon_name,
                  request_type: request?.request_type,
                  waiting_on: request?.waiting_on,
                  scheduleRow,
                }}
              />
            </span>
          }
        />
      </LabelValueGrid>

      <div>
        <p className={sectionSubheadingClassName}>Update status</p>

        <div
          className="flex w-full flex-col gap-1 rounded-lg border border-gray-200 bg-white p-1 sm:inline-flex sm:w-auto sm:flex-row sm:flex-wrap"
          role="group"
          aria-label="Set request status"
        >
          {REQUEST_STATUS_SEGMENTS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onUpdateStatus(value)}
              className={
                currentStatus === value
                  ? 'inline-flex w-full items-center justify-center rounded-lg bg-brand-muted px-4 py-2 text-sm font-semibold text-brand-foreground shadow-sm ring-1 ring-brand/25 transition-all duration-150 active:scale-[0.98] sm:w-auto'
                  : 'inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-150 hover:bg-brand-muted/50 hover:text-gray-900 active:scale-[0.98] sm:w-auto'
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/** What this request is waiting on (orthogonal to workflow status). */
export function RequestWaitingOnSection({
  request,
  disabled,
  onSave,
}: {
  request: any
  disabled?: boolean
  onSave: (value: string | null) => Promise<void> | void
}) {
  const stored = String(request?.waiting_on ?? '').trim()
  const [value, setValue] = useState(stored)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setValue(String(request?.waiting_on ?? '').trim())
  }, [request?.waiting_on])

  const isComplete = String(request?.status ?? '').trim() === 'complete'

  async function handleSave() {
    const next = value.trim() === '' ? null : value.trim()
    setSaving(true)
    setMessage('')
    try {
      await onSave(next)
      setMessage('Saved.')
    } catch (e: any) {
      setMessage(e?.message ? String(e.message) : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-6 space-y-4 border-t border-gray-100 pt-5 text-sm sm:text-base text-gray-800">
      <LabelValueGrid>
        <LabelValueRow
          label={<FieldLabel icon={Clock}>Waiting on</FieldLabel>}
          value={
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <select
                className="w-full min-w-0 max-w-md rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 disabled:opacity-60"
                value={value}
                disabled={disabled || isComplete}
                onChange={(e) => setValue(e.target.value)}
                aria-label="What this request is waiting on"
              >
                <option value="">Not set</option>
                {REQUEST_WAITING_ON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleSave}
                disabled={disabled || isComplete || saving}
                className={`${primaryButtonMd} w-full shrink-0 justify-center sm:w-auto`}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          }
        />
      </LabelValueGrid>
      <p className="text-xs leading-relaxed text-gray-600">
        Use this to record what is blocking progress (family reply, documents, priest calendar,
        etc.). It appears on the dashboard and shapes the Next Step card when other checklist
        items are complete.
      </p>
      <button
        type="button"
        disabled={disabled || isComplete || saving || !value}
        onClick={async () => {
          setSaving(true)
          setMessage('')
          try {
            setValue('')
            await onSave(null)
            setMessage('Cleared.')
          } catch (e: any) {
            setMessage(e?.message ? String(e.message) : 'Clear failed.')
          } finally {
            setSaving(false)
          }
        }}
        className={`${secondaryButtonMd} justify-center text-sm`}
      >
        Clear waiting on
      </button>
      <InlineFormMessage message={message} className="!mt-0" />
    </div>
  )
}
