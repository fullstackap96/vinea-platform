'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
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

    const { data: parishioner, error: parishionerError } = await supabase
      .from('parishioners')
      .insert([
        {
          full_name: fullName,
          email,
          phone,
        },
      ])
      .select()
      .single()

    if (parishionerError) {
      setMessage('Error saving parishioner.')
      setLoading(false)
      return
    }

    const { data: request, error: requestError } = await supabase
      .from('requests')
      .insert([
        {
          parishioner_id: parishioner.id,
          request_type: 'baptism',
          child_name: childName,
          preferred_dates: preferredDates,
          notes,
        },
      ])
      .select()
      .single()

    if (requestError) {
      setMessage('Error saving request.')
      setLoading(false)
      return
    }

    const checklist = [
      { request_id: request.id, item_name: 'Birth certificate' },
      { request_id: request.id, item_name: 'Godparent information' },
      { request_id: request.id, item_name: 'Prep class completion' },
      { request_id: request.id, item_name: 'Baptism date confirmed' },
    ]

    const { error: checklistError } = await supabase
      .from('checklist_items')
      .insert(checklist)

    if (checklistError) {
      setMessage('Request saved, but checklist failed.')
      setLoading(false)
      return
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
      description="Share your family's details below. A staff member will follow up with you."
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
