'use client'

import { useRef, useState } from 'react'
import { primaryButtonLg } from '@/lib/buttonStyles'
import {
  intakeInputClass,
  intakeStatusMessageClass,
  intakeStatusMessageTone,
  intakeTextareaClass,
} from '@/lib/intakeFormStyles'
import { PublicIntakeShell } from '@/app/_components/PublicIntakeShell'
import { queuePublicIntakeStaffNotification } from '@/lib/publicIntakeNotificationClient'
import { submitPublicIntake } from '@/lib/publicIntakeSubmissionClient'

export default function BaptismRequestPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [childName, setChildName] = useState('')
  const [preferredDates, setPreferredDates] = useState('')
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
      requestType: 'baptism',
      fullName,
      email,
      phone,
      childName,
      preferredDates,
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
      requestType: 'baptism',
      contactName: fullName,
      contactEmail: email,
      contactPhone: phone || '—',
      childName,
      notes,
      requestSpecificSummary: preferredDates
        ? `Preferred dates: ${preferredDates}`
        : undefined,
    })

    setMessage('Request submitted successfully.')
    setFullName('')
    setEmail('')
    setPhone('')
    setChildName('')
    setPreferredDates('')
    setNotes('')
    finishSubmission()
  }

  const statusTone = intakeStatusMessageTone(message)

  return (
    <PublicIntakeShell
      title="Baptism request"
      description="Share your family's details below. A parish staff member will follow up with you."
    >
      <form
        method="post"
        onSubmit={handleSubmit}
        className="space-y-4"
        aria-label="Baptism request"
        aria-busy={loading}
      >
        <input
          className={intakeInputClass}
          placeholder="Parent full name"
          aria-label="Parent full name"
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

        <input
          className={intakeInputClass}
          placeholder="Child name"
          aria-label="Child name"
          name="childName"
          autoComplete="off"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          required
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Preferred dates"
          aria-label="Preferred dates"
          name="preferredDates"
          autoComplete="off"
          value={preferredDates}
          onChange={(e) => setPreferredDates(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Notes"
          aria-label="Notes"
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
