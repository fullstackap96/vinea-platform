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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const intakeRes = await fetch('/api/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestType: 'wedding',
        fullName,
        email,
        phone,
        partnerOneName,
        partnerTwoName,
        proposedWeddingDate,
        ceremonyNotes,
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
    setPartnerOneName('')
    setPartnerTwoName('')
    setProposedWeddingDate('')
    setCeremonyNotes('')
    setNotes('')
    setLoading(false)
  }

  return (
    <PublicIntakeShell
      title="Wedding request"
      description="Submit a request to celebrate your wedding at the parish. A parish staff member will contact you."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className={intakeSectionHeadingClass}>Primary contact</h2>
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
          Couple
        </h2>
        <input
          className={intakeInputClass}
          placeholder="Partner name"
          value={partnerOneName}
          onChange={(e) => setPartnerOneName(e.target.value)}
          required
        />

        <input
          className={intakeInputClass}
          placeholder="Partner name (optional)"
          value={partnerTwoName}
          onChange={(e) => setPartnerTwoName(e.target.value)}
        />

        <label className={intakeLabelClass}>Proposed wedding date (if known)</label>
        <input
          className={intakeInputClass}
          type="date"
          value={proposedWeddingDate}
          onChange={(e) => setProposedWeddingDate(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Ceremony preferences or questions (Mass, time of year, etc.)"
          value={ceremonyNotes}
          onChange={(e) => setCeremonyNotes(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Additional notes for parish staff"
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
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </PublicIntakeShell>
  )
}
