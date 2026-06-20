'use client'

import { useState } from 'react'
import { primaryButtonLg } from '@/lib/buttonStyles'
import {
  intakeInputClass,
  intakeStatusMessageClass,
  intakeTextareaClass,
} from '@/lib/intakeFormStyles'
import { PublicIntakeShell } from '@/app/_components/PublicIntakeShell'

export default function BaptismRequestPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [childName, setChildName] = useState('')
  const [preferredDates, setPreferredDates] = useState('')
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
        requestType: 'baptism',
        fullName,
        email,
        phone,
        childName,
        preferredDates,
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
          requestType: 'baptism',
          contactName: fullName,
          contactEmail: email,
          contactPhone: phone || '—',
          childName,
          notes,
          requestSpecificSummary: preferredDates
            ? `Preferred dates: ${preferredDates}`
            : undefined,
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
    setChildName('')
    setPreferredDates('')
    setNotes('')
    setLoading(false)
  }

  return (
    <PublicIntakeShell
      title="Baptism request"
      description="Share your family's details below. A parish staff member will follow up with you."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className={intakeInputClass}
          placeholder="Parent full name"
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

        <input
          className={intakeInputClass}
          placeholder="Child name"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          required
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Preferred dates"
          value={preferredDates}
          onChange={(e) => setPreferredDates(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Notes"
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
