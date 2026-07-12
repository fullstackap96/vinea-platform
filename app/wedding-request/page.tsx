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
import { queuePublicIntakeStaffNotification } from '@/lib/publicIntakeNotificationClient'
import { submitPublicIntake } from '@/lib/publicIntakeSubmissionClient'

export default function WeddingRequestPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [partnerOneName, setPartnerOneName] = useState('')
  const [partnerTwoName, setPartnerTwoName] = useState('')
  const [proposedWeddingDate, setProposedWeddingDate] = useState('')
  const [ceremonyNotes, setCeremonyNotes] = useState('')
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

    const intakeResult = await submitPublicIntake({
      requestType: 'wedding',
      fullName,
      email,
      phone,
      partnerOneName,
      partnerTwoName,
      proposedWeddingDate,
      ceremonyNotes,
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
      requestType: 'wedding',
      contactName: fullName,
      contactEmail: email,
      contactPhone: phone || '—',
      notes,
      requestSpecificSummary: [
        partnerOneName ? `Partner 1: ${partnerOneName.trim()}` : null,
        partnerTwoName ? `Partner 2: ${partnerTwoName.trim()}` : null,
        proposedWeddingDate ? `Proposed date: ${proposedWeddingDate}` : null,
        ceremonyNotes ? `Ceremony notes: ${ceremonyNotes.trim()}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    })

    setMessage('Request submitted successfully.')
    setFullName('')
    setEmail('')
    setPhone('')
    setPartnerOneName('')
    setPartnerTwoName('')
    setProposedWeddingDate('')
    setCeremonyNotes('')
    setNotes('')
    finishSubmission()
  }

  const statusTone = intakeStatusMessageTone(message)

  return (
    <PublicIntakeShell
      title="Wedding request"
      description="Submit a request to celebrate your wedding at the parish. A parish staff member will contact you."
    >
      <form
        method="post"
        onSubmit={handleSubmit}
        className="space-y-4"
        aria-label="Wedding request"
        aria-busy={loading}
      >
        <h2 className={intakeSectionHeadingClass}>Primary contact</h2>
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
          Couple
        </h2>
        <input
          className={intakeInputClass}
          placeholder="Partner name"
          aria-label="Partner name"
          name="partnerOneName"
          autoComplete="off"
          value={partnerOneName}
          onChange={(e) => setPartnerOneName(e.target.value)}
          required
        />

        <input
          className={intakeInputClass}
          placeholder="Partner name (optional)"
          aria-label="Partner name (optional)"
          name="partnerTwoName"
          autoComplete="off"
          value={partnerTwoName}
          onChange={(e) => setPartnerTwoName(e.target.value)}
        />

        <label className={intakeLabelClass}>Proposed wedding date (if known)</label>
        <input
          className={intakeInputClass}
          aria-label="Proposed wedding date"
          name="proposedWeddingDate"
          type="date"
          autoComplete="off"
          value={proposedWeddingDate}
          onChange={(e) => setProposedWeddingDate(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Ceremony preferences or questions (Mass, time of year, etc.)"
          aria-label="Ceremony preferences or questions"
          name="ceremonyNotes"
          autoComplete="off"
          value={ceremonyNotes}
          onChange={(e) => setCeremonyNotes(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Additional notes for parish staff"
          aria-label="Additional notes for parish staff"
          name="notes"
          autoComplete="off"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className={primaryButtonLg}
        >
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
