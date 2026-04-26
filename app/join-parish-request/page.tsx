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

type YesNo = 'Yes' | 'No'
type YesNoNotSure = 'Yes' | 'No' | 'Not sure'

export default function JoinParishRequestPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [movingIntoParish, setMovingIntoParish] = useState<YesNo>('Yes')
  const [address, setAddress] = useState('')
  const [householdMembers, setHouseholdMembers] = useState('')

  const [baptized, setBaptized] = useState<YesNoNotSure>('Not sure')
  const [confirmed, setConfirmed] = useState<YesNoNotSure>('Not sure')
  const [firstCommunion, setFirstCommunion] = useState<YesNoNotSure>('Not sure')

  const [alreadyCatholic, setAlreadyCatholic] = useState<YesNo>('Yes')
  const [interestedInOcia, setInterestedInOcia] = useState<YesNo>('No')

  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const fn = firstName.trim()
    const ln = lastName.trim()
    const fullName = [fn, ln].filter(Boolean).join(' ').trim()

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
          request_type: 'join_parish',
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

    const { error: detailError } = await supabase.from('join_parish_request_details').insert([
      {
        request_id: request.id,
        moving_into_parish: movingIntoParish,
        address: address.trim() || null,
        household_members: householdMembers.trim() || null,
        baptized,
        confirmed,
        first_communion: firstCommunion,
        already_catholic: alreadyCatholic,
        interested_in_ocia: interestedInOcia,
        reason: reason.trim() || null,
        notes: notes.trim() || null,
      },
    ])

    if (detailError) {
      console.error('Join parish details insert error:', detailError)
      setMessage(`Request saved, but join parish details failed: ${detailError.message}`)
      setLoading(false)
      return
    }

    const checklist = [
      { request_id: request.id, item_name: 'Welcome outreach (email/phone)' },
      { request_id: request.id, item_name: 'Registration info sent / collected' },
      { request_id: request.id, item_name: 'Introduce ministries / next steps' },
      ...(interestedInOcia === 'Yes'
        ? [{ request_id: request.id, item_name: 'Connect with OCIA coordinator' }]
        : []),
    ]

    const { error: checklistError } = await supabase.from('checklist_items').insert(checklist)

    if (checklistError) {
      setMessage('Request saved, but checklist failed.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/request-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.id,
          requestType: 'join_parish',
          contactName: fullName,
          contactEmail: email,
          contactPhone: phone || '—',
          notes,
          joinParish: {
            address: address.trim() || undefined,
            baptized,
            confirmed,
            firstCommunion,
            interestedInOcia,
            reason: reason.trim() || undefined,
          },
          requestSpecificSummary: [
            `Moving into parish: ${movingIntoParish}`,
            address.trim() ? `Address: ${address.trim()}` : null,
            householdMembers.trim() ? `Household members: ${householdMembers.trim()}` : null,
            `Baptized: ${baptized}`,
            `Confirmed: ${confirmed}`,
            `First Communion: ${firstCommunion}`,
            `Already Catholic: ${alreadyCatholic}`,
            `Interested in OCIA: ${interestedInOcia}`,
            reason.trim() ? `Reason: ${reason.trim()}` : null,
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
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setMovingIntoParish('Yes')
    setAddress('')
    setHouseholdMembers('')
    setBaptized('Not sure')
    setConfirmed('Not sure')
    setFirstCommunion('Not sure')
    setAlreadyCatholic('Yes')
    setInterestedInOcia('No')
    setReason('')
    setNotes('')
    setLoading(false)
  }

  return (
    <PublicIntakeShell
      title="Join the parish"
      description="Let us know a bit about you and your household. A parish staff member will contact you with next steps."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className={intakeSectionHeadingClass}>Your contact information</h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className={intakeInputClass}
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            className={intakeInputClass}
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

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
          Household
        </h2>

        <label className={intakeLabelClass}>Moving into the parish?</label>
        <select
          className={intakeInputClass}
          value={movingIntoParish}
          onChange={(e) => setMovingIntoParish(e.target.value as YesNo)}
          required
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>

        <textarea
          className={intakeTextareaClass}
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Household members (names, ages, relationships)"
          value={householdMembers}
          onChange={(e) => setHouseholdMembers(e.target.value)}
        />

        <h2 className={`${intakeSectionHeadingClass} mt-6 border-t border-gray-100 pt-2`}>
          Sacraments and next steps
        </h2>

        <label className={intakeLabelClass}>Baptized?</label>
        <select
          className={intakeInputClass}
          value={baptized}
          onChange={(e) => setBaptized(e.target.value as YesNoNotSure)}
          required
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Not sure">Not sure</option>
        </select>

        <label className={intakeLabelClass}>Confirmed?</label>
        <select
          className={intakeInputClass}
          value={confirmed}
          onChange={(e) => setConfirmed(e.target.value as YesNoNotSure)}
          required
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Not sure">Not sure</option>
        </select>

        <label className={intakeLabelClass}>First Communion?</label>
        <select
          className={intakeInputClass}
          value={firstCommunion}
          onChange={(e) => setFirstCommunion(e.target.value as YesNoNotSure)}
          required
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Not sure">Not sure</option>
        </select>

        <label className={intakeLabelClass}>Already Catholic?</label>
        <select
          className={intakeInputClass}
          value={alreadyCatholic}
          onChange={(e) => setAlreadyCatholic(e.target.value as YesNo)}
          required
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>

        <label className={intakeLabelClass}>Interested in OCIA?</label>
        <select
          className={intakeInputClass}
          value={interestedInOcia}
          onChange={(e) => setInterestedInOcia(e.target.value as YesNo)}
          required
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>

        <textarea
          className={intakeTextareaClass}
          placeholder="Reason for joining"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button type="submit" disabled={loading} className={primaryButtonLg}>
          {loading ? 'Submitting...' : 'Submit request'}
        </button>
      </form>

      {message ? (
        <p className={intakeStatusMessageClass(message)} role="status" aria-live="polite">
          {message}
        </p>
      ) : null}
    </PublicIntakeShell>
  )
}

