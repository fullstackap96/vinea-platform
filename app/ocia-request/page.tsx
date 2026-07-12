'use client'

import { useRef, useState } from 'react'
import { primaryButtonLg } from '@/lib/buttonStyles'
import {
  intakeInputClass,
  intakeLabelClass,
  intakeSectionHeadingClass,
  intakeStatusMessageClass,
  intakeStatusMessageTone,
  intakeTextareaClass,
} from '@/lib/intakeFormStyles'
import { PublicIntakeShell } from '@/app/_components/PublicIntakeShell'
import {
  CONTACT_METHOD_LABEL,
  CONTACT_METHOD_VALUES,
  SACRAMENTAL_BACKGROUND_LABEL,
  SACRAMENTAL_BACKGROUND_VALUES,
  SEEKING_LABEL,
  SEEKING_VALUES,
} from '@/lib/ociaIntakeOptions'
import { queuePublicIntakeStaffNotification } from '@/lib/publicIntakeNotificationClient'
import { submitPublicIntake } from '@/lib/publicIntakeSubmissionClient'

export default function OciaRequestPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [ageOrDobNote, setAgeOrDobNote] = useState('')
  const [sacramentalBackground, setSacramentalBackground] = useState<string>(
    SACRAMENTAL_BACKGROUND_VALUES[0]
  )
  const [seeking, setSeeking] = useState<string>(SEEKING_VALUES[0])
  const [parishionerStatus, setParishionerStatus] = useState('')
  const [preferredContactMethod, setPreferredContactMethod] = useState<string>(
    CONTACT_METHOD_VALUES[0]
  )
  const [availability, setAvailability] = useState('')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const submissionInFlightRef = useRef(false)

  function finishSubmission() {
    submissionInFlightRef.current = false
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submissionInFlightRef.current) return

    submissionInFlightRef.current = true
    setLoading(true)
    setMessage('')

    const hasDob = Boolean(dateOfBirth.trim())
    const hasAgeNote = Boolean(ageOrDobNote.trim())
    if (!hasDob && !hasAgeNote) {
      setMessage('Please provide either a date of birth or your age (in the text field).')
      finishSubmission()
      return
    }

    const intakeResult = await submitPublicIntake({
      requestType: 'ocia',
      fullName,
      email,
      phone,
      dateOfBirth,
      ageOrDobNote,
      sacramentalBackground,
      seeking,
      parishionerStatus,
      preferredContactMethod,
      availability,
      notes,
    })
    if (!intakeResult.ok) {
      setMessage(intakeResult.error)
      finishSubmission()
      return
    }
    const requestId = intakeResult.requestId

    queuePublicIntakeStaffNotification({
      requestId,
      requestType: 'ocia',
      contactName: fullName,
      contactEmail: email,
      contactPhone: phone || '—',
      notes,
      requestSpecificSummary: [
        dateOfBirth ? `Date of birth: ${dateOfBirth}` : null,
        ageOrDobNote ? `Age/DOB note: ${ageOrDobNote.trim()}` : null,
        sacramentalBackground ? `Sacramental background: ${sacramentalBackground}` : null,
        seeking ? `Seeking: ${seeking}` : null,
        parishionerStatus ? `Parishioner status: ${parishionerStatus.trim()}` : null,
        preferredContactMethod
          ? `Preferred contact method: ${preferredContactMethod}`
          : null,
        availability ? `Availability: ${availability.trim()}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    })

    setMessage('Request submitted successfully.')
    setFullName('')
    setEmail('')
    setPhone('')
    setDateOfBirth('')
    setAgeOrDobNote('')
    setSacramentalBackground(SACRAMENTAL_BACKGROUND_VALUES[0])
    setSeeking(SEEKING_VALUES[0])
    setParishionerStatus('')
    setPreferredContactMethod(CONTACT_METHOD_VALUES[0])
    setAvailability('')
    setNotes('')
    finishSubmission()
  }

  const statusTone = intakeStatusMessageTone(message)

  return (
    <PublicIntakeShell
      title="OCIA (RCIA) inquiry"
      description="Share your story and how we can walk with you toward full communion. A parish staff member will contact you."
    >
      <form
        method="post"
        onSubmit={handleSubmit}
        className="space-y-4"
        aria-label="OCIA inquiry"
        aria-busy={loading}
      >
        <h2 className={intakeSectionHeadingClass}>Your contact information</h2>
        <input
          className={intakeInputClass}
          placeholder="Your full name"
          aria-label="Your full name"
          name="contactName"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <input
          className={intakeInputClass}
          placeholder="Email"
          aria-label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className={intakeInputClass}
          placeholder="Phone"
          aria-label="Phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <h2 className={`${intakeSectionHeadingClass} mt-6 border-t border-gray-100 pt-2`}>
          About you
        </h2>

        <label className={intakeLabelClass}>Date of birth (optional if you share age below)</label>
        <input
          className={intakeInputClass}
          aria-label="Date of birth"
          name="dateOfBirth"
          type="date"
          autoComplete="bday"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />

        <label className={intakeLabelClass}>Age or date of birth (if you prefer not to use the picker)</label>
        <input
          className={intakeInputClass}
          placeholder="e.g. 34, or approximate age range"
          aria-label="Age or date of birth"
          name="ageOrDobNote"
          autoComplete="off"
          value={ageOrDobNote}
          onChange={(e) => setAgeOrDobNote(e.target.value)}
        />

        <label className={intakeLabelClass}>Sacramental background</label>
        <select
          className={intakeInputClass}
          aria-label="Sacramental background"
          name="sacramentalBackground"
          value={sacramentalBackground}
          onChange={(e) => setSacramentalBackground(e.target.value)}
          required
        >
          {SACRAMENTAL_BACKGROUND_VALUES.map((v) => (
            <option key={v} value={v}>
              {SACRAMENTAL_BACKGROUND_LABEL[v]}
            </option>
          ))}
        </select>

        <label className={intakeLabelClass}>What are you seeking?</label>
        <select
          className={intakeInputClass}
          aria-label="What are you seeking?"
          name="seeking"
          value={seeking}
          onChange={(e) => setSeeking(e.target.value)}
          required
        >
          {SEEKING_VALUES.map((v) => (
            <option key={v} value={v}>
              {SEEKING_LABEL[v]}
            </option>
          ))}
        </select>

        <label className={intakeLabelClass}>Parishioner status</label>
        <input
          className={intakeInputClass}
          placeholder="e.g. Registered here, attend occasionally, new to the area"
          aria-label="Parishioner status"
          name="parishionerStatus"
          autoComplete="off"
          value={parishionerStatus}
          onChange={(e) => setParishionerStatus(e.target.value)}
          required
        />

        <label className={intakeLabelClass}>Preferred contact method</label>
        <select
          className={intakeInputClass}
          aria-label="Preferred contact method"
          name="preferredContactMethod"
          value={preferredContactMethod}
          onChange={(e) => setPreferredContactMethod(e.target.value)}
          required
        >
          {CONTACT_METHOD_VALUES.map((v) => (
            <option key={v} value={v}>
              {CONTACT_METHOD_LABEL[v]}
            </option>
          ))}
        </select>

        <label className={intakeLabelClass}>Availability for meetings or classes</label>
        <textarea
          className={intakeTextareaClass}
          placeholder="e.g. weekday evenings, Sunday mornings after Mass"
          aria-label="Availability for meetings or classes"
          name="availability"
          autoComplete="off"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Notes or questions for parish staff"
          aria-label="Notes or questions for parish staff"
          name="notes"
          autoComplete="off"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button type="submit" disabled={loading} className={primaryButtonLg}>
          {loading ? 'Submitting...' : 'Submit request'}
        </button>
      </form>

      {message ? (
        <p
          className={intakeStatusMessageClass(message)}
          role={statusTone === 'success' ? 'status' : 'alert'}
          aria-live={statusTone === 'success' ? 'polite' : 'assertive'}
        >
          {message}
        </p>
      ) : null}
    </PublicIntakeShell>
  )
}
