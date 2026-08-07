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

    const fn = firstName.trim()
    const ln = lastName.trim()
    const fullName = [fn, ln].filter(Boolean).join(' ').trim()

    const intakeResult = await submitPublicIntake({
      requestType: 'join_parish',
      fullName,
      email,
      phone,
      movingIntoParish,
      address,
      householdMembers,
      baptized,
      confirmed,
      firstCommunion,
      alreadyCatholic,
      interestedInOcia,
      reason,
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
    })

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
    finishSubmission()
  }

  const statusTone = intakeStatusMessageTone(message)

  return (
    <PublicIntakeShell
      title="Join the parish"
      description="Let us know a bit about you and your household. A parish staff member will contact you with next steps."
    >
      <form
        method="post"
        onSubmit={handleSubmit}
        className="space-y-4"
        aria-label="Join the parish request"
        aria-busy={loading}
      >
        <fieldset disabled={loading} className="m-0 min-w-0 space-y-4 border-0 p-0">
        <h2 className={intakeSectionHeadingClass}>Your contact information</h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className={intakeInputClass}
            placeholder="First name"
            aria-label="First name"
            name="firstName"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            className={intakeInputClass}
            placeholder="Last name"
            aria-label="Last name"
            name="lastName"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

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
          Household
        </h2>

        <label className={intakeLabelClass}>Moving into the parish?</label>
        <select
          className={intakeInputClass}
          aria-label="Moving into the parish?"
          name="movingIntoParish"
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
          aria-label="Address"
          name="address"
          autoComplete="street-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Household members (names, ages, relationships)"
          aria-label="Household members"
          name="householdMembers"
          autoComplete="off"
          value={householdMembers}
          onChange={(e) => setHouseholdMembers(e.target.value)}
        />

        <h2 className={`${intakeSectionHeadingClass} mt-6 border-t border-gray-100 pt-2`}>
          Sacraments and next steps
        </h2>

        <label className={intakeLabelClass}>Baptized?</label>
        <select
          className={intakeInputClass}
          aria-label="Baptized?"
          name="baptized"
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
          aria-label="Confirmed?"
          name="confirmed"
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
          aria-label="First Communion?"
          name="firstCommunion"
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
          aria-label="Already Catholic?"
          name="alreadyCatholic"
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
          aria-label="Interested in OCIA?"
          name="interestedInOcia"
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
          aria-label="Reason for joining"
          name="reason"
          autoComplete="off"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
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

        <button type="submit" disabled={loading} className={primaryButtonLg}>
          {loading ? 'Submitting...' : 'Submit request'}
        </button>
        </fieldset>
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

