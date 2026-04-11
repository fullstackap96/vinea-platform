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

export default function FuneralRequestPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [deceasedName, setDeceasedName] = useState('')
  const [dateOfDeath, setDateOfDeath] = useState('')
  const [funeralHome, setFuneralHome] = useState('')
  const [preferredServiceNotes, setPreferredServiceNotes] = useState('')
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
          request_type: 'funeral',
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

    const { error: detailError } = await supabase.from('funeral_request_details').insert([
      {
        request_id: request.id,
        deceased_name: deceasedName.trim(),
        date_of_death: dateOfDeath || null,
        funeral_home_or_location: funeralHome.trim() || null,
        preferred_service_notes: preferredServiceNotes.trim() || null,
      },
    ])

    if (detailError) {
      setMessage('Request saved, but funeral details failed. Please contact the parish.')
      setLoading(false)
      return
    }

    const checklist = [
      { request_id: request.id, item_name: 'Death certificate / vital records' },
      { request_id: request.id, item_name: 'Obituary or program preferences' },
      { request_id: request.id, item_name: 'Music and readings (if known)' },
      { request_id: request.id, item_name: 'Cemetery or cremation arrangements' },
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
    setDeceasedName('')
    setDateOfDeath('')
    setFuneralHome('')
    setPreferredServiceNotes('')
    setNotes('')
    setLoading(false)
  }

  return (
    <PublicIntakeShell
      title="Funeral / memorial request"
      description="Submit a request for funeral or memorial liturgy planning. A staff member will contact you."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className={intakeSectionHeadingClass}>Family contact</h2>
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

        <h2 className={`${intakeSectionHeadingClass} pt-2 border-t border-gray-100 mt-8`}>
          About the deceased
        </h2>
        <input
          className={intakeInputClass}
          placeholder="Deceased full name"
          value={deceasedName}
          onChange={(e) => setDeceasedName(e.target.value)}
          required
        />

        <label className={intakeLabelClass}>Date of death (if known)</label>
        <input
          className={intakeInputClass}
          type="date"
          value={dateOfDeath}
          onChange={(e) => setDateOfDeath(e.target.value)}
        />

        <input
          className={intakeInputClass}
          placeholder="Funeral home or church location (if known)"
          value={funeralHome}
          onChange={(e) => setFuneralHome(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Preferred dates, times, or liturgy notes"
          value={preferredServiceNotes}
          onChange={(e) => setPreferredServiceNotes(e.target.value)}
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
