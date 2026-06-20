'use client'

import { useState } from 'react'
import { primaryButtonLg } from '@/lib/buttonStyles'
import {
  intakeInputClass,
  intakeLabelClass,
  intakeSectionHeadingClass,
  intakeStatusMessageClass,
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const hasDob = Boolean(dateOfBirth.trim())
    const hasAgeNote = Boolean(ageOrDobNote.trim())
    if (!hasDob && !hasAgeNote) {
      setMessage('Please provide either a date of birth or your age (in the text field).')
      setLoading(false)
      return
    }

    const intakeRes = await fetch('/api/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
      }),
    })
    const intakeData = await intakeRes.json().catch(() => ({}))
    if (!intakeRes.ok || !intakeData?.ok) {
      setMessage(String(intakeData?.error || 'Error saving request.'))
      setLoading(false)
      return
    }
    const requestId = String(intakeData.requestId)

    try {
      const res = await fetch('/api/request-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        console.warn('Request notification failed:', res.status, txt)
      }
    } catch (err) {
      console.warn('Request notification error:', err)
    }

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
    setLoading(false)
  }

  return (
    <PublicIntakeShell
      title="OCIA (RCIA) inquiry"
      description="Share your story and how we can walk with you toward full communion. A parish staff member will contact you."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className={intakeSectionHeadingClass}>Your contact information</h2>
        <input
          className={intakeInputClass}
          placeholder="Your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <input
          className={intakeInputClass}
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className={intakeInputClass}
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <h2 className={`${intakeSectionHeadingClass} mt-6 border-t border-gray-100 pt-2`}>
          About you
        </h2>

        <label className={intakeLabelClass}>Date of birth (optional if you share age below)</label>
        <input
          className={intakeInputClass}
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />

        <label className={intakeLabelClass}>Age or date of birth (if you prefer not to use the picker)</label>
        <input
          className={intakeInputClass}
          placeholder="e.g. 34, or approximate age range"
          value={ageOrDobNote}
          onChange={(e) => setAgeOrDobNote(e.target.value)}
        />

        <label className={intakeLabelClass}>Sacramental background</label>
        <select
          className={intakeInputClass}
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
          value={parishionerStatus}
          onChange={(e) => setParishionerStatus(e.target.value)}
          required
        />

        <label className={intakeLabelClass}>Preferred contact method</label>
        <select
          className={intakeInputClass}
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
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Notes or questions for parish staff"
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
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </PublicIntakeShell>
  )
}
