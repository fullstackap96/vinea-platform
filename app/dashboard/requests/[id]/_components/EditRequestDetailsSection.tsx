'use client'

import React, { useEffect, useState } from 'react'
import {
  saveRequestIntakeDetails,
  type SaveRequestIntakeDetailsInput,
} from '@/app/dashboard/requests/actions'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import {
  CONTACT_METHOD_LABEL,
  CONTACT_METHOD_VALUES,
  SACRAMENTAL_BACKGROUND_LABEL,
  SACRAMENTAL_BACKGROUND_VALUES,
  SEEKING_LABEL,
  SEEKING_VALUES,
} from '@/lib/ociaIntakeOptions'

const inputClass = 'w-full border border-gray-300 p-3 rounded text-sm text-gray-900 shadow-sm'
const labelClass = 'block text-sm font-medium text-gray-900 mb-1'

type Props = {
  open: boolean
  requestId: string
  requestType: 'baptism' | 'funeral' | 'wedding' | 'ocia'
  parishionerId: string
  parishioner: { full_name?: string | null; email?: string | null; phone?: string | null }
  request: { child_name?: string | null; preferred_dates?: string | null; notes?: string | null }
  funeralDetail: Record<string, unknown> | null
  weddingDetail: Record<string, unknown> | null
  ociaDetail: Record<string, unknown> | null
  onClose: () => void
  onSaved: () => void | Promise<void>
}

export function EditRequestDetailsSection({
  open,
  requestId,
  requestType,
  parishionerId,
  parishioner,
  request,
  funeralDetail,
  weddingDetail,
  ociaDetail,
  onClose,
  onSaved,
}: Props) {
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [intakeNotes, setIntakeNotes] = useState('')
  const [childName, setChildName] = useState('')
  const [preferredDates, setPreferredDates] = useState('')
  const [deceasedName, setDeceasedName] = useState('')
  const [dateOfDeath, setDateOfDeath] = useState('')
  const [funeralHome, setFuneralHome] = useState('')
  const [funeralPreferred, setFuneralPreferred] = useState('')
  const [partnerOne, setPartnerOne] = useState('')
  const [partnerTwo, setPartnerTwo] = useState('')
  const [proposedWeddingDate, setProposedWeddingDate] = useState('')
  const [ceremonyNotes, setCeremonyNotes] = useState('')
  const [ociaDob, setOciaDob] = useState('')
  const [ociaAgeNote, setOciaAgeNote] = useState('')
  const [ociaSac, setOciaSac] = useState<string>(SACRAMENTAL_BACKGROUND_VALUES[0])
  const [ociaSeeking, setOciaSeeking] = useState<string>(SEEKING_VALUES[0])
  const [ociaParishStatus, setOciaParishStatus] = useState('')
  const [ociaContactMethod, setOciaContactMethod] = useState<string>(CONTACT_METHOD_VALUES[0])
  const [ociaAvailability, setOciaAvailability] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!open) return
    setMessage('')
    setContactName(String(parishioner?.full_name ?? ''))
    setContactEmail(String(parishioner?.email ?? ''))
    setContactPhone(String(parishioner?.phone ?? ''))
    setIntakeNotes(String(request?.notes ?? ''))
    setChildName(String(request?.child_name ?? ''))
    setPreferredDates(String(request?.preferred_dates ?? ''))
    setDeceasedName(String(funeralDetail?.deceased_name ?? ''))
    setDateOfDeath(
      funeralDetail?.date_of_death ? String(funeralDetail.date_of_death).slice(0, 10) : ''
    )
    setFuneralHome(String(funeralDetail?.funeral_home_or_location ?? ''))
    setFuneralPreferred(String(funeralDetail?.preferred_service_notes ?? ''))
    setPartnerOne(String(weddingDetail?.partner_one_name ?? ''))
    setPartnerTwo(String(weddingDetail?.partner_two_name ?? ''))
    setProposedWeddingDate(
      weddingDetail?.proposed_wedding_date
        ? String(weddingDetail.proposed_wedding_date).slice(0, 10)
        : ''
    )
    setCeremonyNotes(String(weddingDetail?.ceremony_notes ?? ''))
    setOciaDob(ociaDetail?.date_of_birth ? String(ociaDetail.date_of_birth).slice(0, 10) : '')
    setOciaAgeNote(String(ociaDetail?.age_or_dob_note ?? ''))
    setOciaSac(String(ociaDetail?.sacramental_background ?? SACRAMENTAL_BACKGROUND_VALUES[0]))
    setOciaSeeking(String(ociaDetail?.seeking ?? SEEKING_VALUES[0]))
    setOciaParishStatus(String(ociaDetail?.parishioner_status ?? ''))
    setOciaContactMethod(
      String(ociaDetail?.preferred_contact_method ?? CONTACT_METHOD_VALUES[0])
    )
    setOciaAvailability(String(ociaDetail?.availability ?? ''))
  }, [
    open,
    parishioner,
    request,
    funeralDetail,
    weddingDetail,
    ociaDetail,
  ])

  async function handleSave() {
    setSaving(true)
    setMessage('')
    try {
      const base = {
        requestId,
        requestType,
        parishionerId,
        contactFullName: contactName,
        contactEmail: contactEmail,
        contactPhone: contactPhone,
        intakeNotes: intakeNotes.trim() || null,
      }

      let payload: SaveRequestIntakeDetailsInput
      if (requestType === 'baptism') {
        payload = {
          ...base,
          baptism: {
            childName: childName.trim() || null,
            preferredDates: preferredDates.trim() || null,
          },
        }
      } else if (requestType === 'funeral') {
        payload = {
          ...base,
          funeral: {
            deceasedName: deceasedName.trim(),
            dateOfDeath: dateOfDeath || null,
            funeralHome: funeralHome.trim() || null,
            preferredServiceNotes: funeralPreferred.trim() || null,
          },
        }
      } else if (requestType === 'wedding') {
        payload = {
          ...base,
          wedding: {
            partnerOneName: partnerOne.trim(),
            partnerTwoName: partnerTwo.trim() || null,
            proposedWeddingDate: proposedWeddingDate || null,
            ceremonyNotes: ceremonyNotes.trim() || null,
          },
        }
      } else {
        payload = {
          ...base,
          ocia: {
            dateOfBirth: ociaDob || null,
            ageOrDobNote: ociaAgeNote.trim() || null,
            sacramentalBackground: ociaSac,
            seeking: ociaSeeking,
            parishionerStatus: ociaParishStatus.trim(),
            preferredContactMethod: ociaContactMethod,
            availability: ociaAvailability.trim() || null,
          },
        }
      }

      const result = await saveRequestIntakeDetails(payload)
      if (!result.ok) {
        setMessage(result.error)
        return
      }
      await onSaved()
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className={sectionHeadingClassName}>Edit request details</h2>
      <p className="mb-3 text-sm leading-relaxed text-gray-600">
        Correct intake information submitted by the family. Confirmed dates and checklist are
        unchanged here.
      </p>

      <div className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="edit-contact-name">
            Contact name
          </label>
          <input
            id="edit-contact-name"
            className={inputClass}
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="edit-contact-email">
            Email
          </label>
          <input
            id="edit-contact-email"
            type="email"
            className={inputClass}
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="edit-contact-phone">
            Phone
          </label>
          <input
            id="edit-contact-phone"
            className={inputClass}
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="edit-intake-notes">
            Intake notes
          </label>
          <textarea
            id="edit-intake-notes"
            className={`${inputClass} min-h-[100px]`}
            value={intakeNotes}
            onChange={(e) => setIntakeNotes(e.target.value)}
          />
        </div>

        {requestType === 'baptism' && (
          <>
            <div>
              <label className={labelClass} htmlFor="edit-child-name">
                Child name
              </label>
              <input
                id="edit-child-name"
                className={inputClass}
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="edit-preferred-dates">
                Preferred dates
              </label>
              <textarea
                id="edit-preferred-dates"
                className={`${inputClass} min-h-[72px]`}
                value={preferredDates}
                onChange={(e) => setPreferredDates(e.target.value)}
              />
            </div>
          </>
        )}

        {requestType === 'funeral' && (
          <>
            <div>
              <label className={labelClass} htmlFor="edit-deceased">
                Deceased name
              </label>
              <input
                id="edit-deceased"
                className={inputClass}
                value={deceasedName}
                onChange={(e) => setDeceasedName(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="edit-dod">
                Date of death
              </label>
              <input
                id="edit-dod"
                type="date"
                className={inputClass}
                value={dateOfDeath}
                onChange={(e) => setDateOfDeath(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="edit-funeral-home">
                Funeral home / location
              </label>
              <input
                id="edit-funeral-home"
                className={inputClass}
                value={funeralHome}
                onChange={(e) => setFuneralHome(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="edit-funeral-pref">
                Preferred service notes
              </label>
              <textarea
                id="edit-funeral-pref"
                className={`${inputClass} min-h-[80px]`}
                value={funeralPreferred}
                onChange={(e) => setFuneralPreferred(e.target.value)}
              />
            </div>
          </>
        )}

        {requestType === 'wedding' && (
          <>
            <div>
              <label className={labelClass} htmlFor="edit-p1">
                Partner name
              </label>
              <input
                id="edit-p1"
                className={inputClass}
                value={partnerOne}
                onChange={(e) => setPartnerOne(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="edit-p2">
                Partner name (optional)
              </label>
              <input
                id="edit-p2"
                className={inputClass}
                value={partnerTwo}
                onChange={(e) => setPartnerTwo(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="edit-wed-date">
                Proposed wedding date
              </label>
              <input
                id="edit-wed-date"
                type="date"
                className={inputClass}
                value={proposedWeddingDate}
                onChange={(e) => setProposedWeddingDate(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="edit-ceremony-notes">
                Ceremony notes
              </label>
              <textarea
                id="edit-ceremony-notes"
                className={`${inputClass} min-h-[80px]`}
                value={ceremonyNotes}
                onChange={(e) => setCeremonyNotes(e.target.value)}
              />
            </div>
          </>
        )}

        {requestType === 'ocia' && (
          <>
            <div>
              <label className={labelClass} htmlFor="edit-ocia-dob">
                Date of birth
              </label>
              <input
                id="edit-ocia-dob"
                type="date"
                className={inputClass}
                value={ociaDob}
                onChange={(e) => setOciaDob(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="edit-ocia-age">
                Age / DOB note
              </label>
              <input
                id="edit-ocia-age"
                className={inputClass}
                value={ociaAgeNote}
                onChange={(e) => setOciaAgeNote(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Sacramental background</label>
              <select
                className={inputClass}
                value={ociaSac}
                onChange={(e) => setOciaSac(e.target.value)}
              >
                {SACRAMENTAL_BACKGROUND_VALUES.map((v) => (
                  <option key={v} value={v}>
                    {SACRAMENTAL_BACKGROUND_LABEL[v]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>What they are seeking</label>
              <select
                className={inputClass}
                value={ociaSeeking}
                onChange={(e) => setOciaSeeking(e.target.value)}
              >
                {SEEKING_VALUES.map((v) => (
                  <option key={v} value={v}>
                    {SEEKING_LABEL[v]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="edit-ocia-parish">
                Parishioner status
              </label>
              <input
                id="edit-ocia-parish"
                className={inputClass}
                value={ociaParishStatus}
                onChange={(e) => setOciaParishStatus(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Preferred contact method</label>
              <select
                className={inputClass}
                value={ociaContactMethod}
                onChange={(e) => setOciaContactMethod(e.target.value)}
              >
                {CONTACT_METHOD_VALUES.map((v) => (
                  <option key={v} value={v}>
                    {CONTACT_METHOD_LABEL[v]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="edit-ocia-avail">
                Availability
              </label>
              <textarea
                id="edit-ocia-avail"
                className={`${inputClass} min-h-[72px]`}
                value={ociaAvailability}
                onChange={(e) => setOciaAvailability(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className={`${secondaryButtonMd} w-full justify-center sm:w-auto`}
          >
            Cancel
          </button>
        </div>
        <InlineFormMessage message={message} className="!mt-0" />
      </div>
    </div>
  )
}
