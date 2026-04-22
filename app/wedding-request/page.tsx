'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
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
      setMessage('Error saving contact information.')
      setLoading(false)
      return
    }

    const { data: request, error: requestError } = await supabase
      .from('requests')
      .insert([
        {
          parishioner_id: parishioner.id,
          request_type: 'wedding',
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

    const { error: detailError } = await supabase.from('wedding_request_details').insert([
      {
        request_id: request.id,
        partner_one_name: partnerOneName.trim(),
        partner_two_name: partnerTwoName.trim() || null,
        proposed_wedding_date: proposedWeddingDate || null,
        ceremony_notes: ceremonyNotes.trim() || null,
      },
    ])

    if (detailError) {
      setMessage('Request saved, but wedding details failed. Please contact the parish.')
      setLoading(false)
      return
    }

    const checklist = [
      { request_id: request.id, item_name: 'Initial meeting with parish' },
      { request_id: request.id, item_name: 'Wedding date confirmed' },
      { request_id: request.id, item_name: 'Liturgy details finalized' },
    ]

    const { error: checklistError } = await supabase.from('checklist_items').insert(checklist)

    if (checklistError) {
      setMessage('Request saved, but checklist failed.')
      setLoading(false)
      return
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
