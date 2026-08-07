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

export default function FuneralRequestPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [deceasedName, setDeceasedName] = useState('')
  const [familyRelationship, setFamilyRelationship] = useState('')
  const [dateOfDeath, setDateOfDeath] = useState('')
  const [funeralHome, setFuneralHome] = useState('')
  const [funeralDirectorContact, setFuneralDirectorContact] = useState('')
  const [serviceLocation, setServiceLocation] = useState('')
  const [visitationDetails, setVisitationDetails] = useState('')
  const [cemeteryOrCommittal, setCemeteryOrCommittal] = useState('')
  const [readingsMusicNotes, setReadingsMusicNotes] = useState('')
  const [obituaryProgramNotes, setObituaryProgramNotes] = useState('')
  const [postFuneralFollowUpDate, setPostFuneralFollowUpDate] = useState('')
  const [preferredServiceNotes, setPreferredServiceNotes] = useState('')
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
      requestType: 'funeral',
      fullName,
      email,
      phone,
      deceasedName,
      familyRelationship,
      dateOfDeath,
      funeralHome,
      funeralDirectorContact,
      serviceLocation,
      visitationDetails,
      cemeteryOrCommittal,
      readingsMusicNotes,
      obituaryProgramNotes,
      postFuneralFollowUpDate,
      preferredServiceNotes,
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
      requestType: 'funeral',
      contactName: fullName,
      contactEmail: email,
      contactPhone: phone || '—',
      notes,
      requestSpecificSummary: [
        deceasedName ? `Deceased: ${deceasedName.trim()}` : null,
        familyRelationship ? `Relationship: ${familyRelationship.trim()}` : null,
        dateOfDeath ? `Date of death: ${dateOfDeath}` : null,
        funeralHome ? `Funeral home/location: ${funeralHome.trim()}` : null,
        funeralDirectorContact
          ? `Funeral director contact: ${funeralDirectorContact.trim()}`
          : null,
        serviceLocation ? `Service location: ${serviceLocation.trim()}` : null,
        visitationDetails ? `Visitation: ${visitationDetails.trim()}` : null,
        cemeteryOrCommittal ? `Cemetery/committal: ${cemeteryOrCommittal.trim()}` : null,
        readingsMusicNotes ? `Readings/music: ${readingsMusicNotes.trim()}` : null,
        obituaryProgramNotes ? `Obituary/program: ${obituaryProgramNotes.trim()}` : null,
        postFuneralFollowUpDate
          ? `Post-funeral follow-up: ${postFuneralFollowUpDate}`
          : null,
        preferredServiceNotes
          ? `Preferred dates/times/notes: ${preferredServiceNotes.trim()}`
          : null,
      ]
        .filter(Boolean)
        .join('\n'),
    })

    setMessage('Request submitted successfully.')
    setFullName('')
    setEmail('')
    setPhone('')
    setDeceasedName('')
    setFamilyRelationship('')
    setDateOfDeath('')
    setFuneralHome('')
    setFuneralDirectorContact('')
    setServiceLocation('')
    setVisitationDetails('')
    setCemeteryOrCommittal('')
    setReadingsMusicNotes('')
    setObituaryProgramNotes('')
    setPostFuneralFollowUpDate('')
    setPreferredServiceNotes('')
    setNotes('')
    finishSubmission()
  }

  const statusTone = intakeStatusMessageTone(message)

  return (
    <PublicIntakeShell
      title="Funeral / memorial request"
      description="Submit a request for funeral or memorial liturgy planning. A parish staff member will contact you."
    >
      <form
        method="post"
        onSubmit={handleSubmit}
        className="space-y-4"
        aria-label="Funeral or memorial request"
        aria-busy={loading}
      >
        <fieldset disabled={loading} className="m-0 min-w-0 space-y-4 border-0 p-0">
        <h2 className={intakeSectionHeadingClass}>Family contact</h2>
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
          About the deceased
        </h2>
        <input
          className={intakeInputClass}
          placeholder="Deceased full name"
          aria-label="Deceased full name"
          name="deceasedName"
          autoComplete="off"
          value={deceasedName}
          onChange={(e) => setDeceasedName(e.target.value)}
          required
        />

        <input
          className={intakeInputClass}
          placeholder="Your relationship to the deceased"
          aria-label="Your relationship to the deceased"
          name="familyRelationship"
          autoComplete="off"
          value={familyRelationship}
          onChange={(e) => setFamilyRelationship(e.target.value)}
        />

        <label className={intakeLabelClass}>Date of death (if known)</label>
        <input
          className={intakeInputClass}
          aria-label="Date of death"
          name="dateOfDeath"
          type="date"
          autoComplete="off"
          value={dateOfDeath}
          onChange={(e) => setDateOfDeath(e.target.value)}
        />

        <input
          className={intakeInputClass}
          placeholder="Funeral home or church location (if known)"
          aria-label="Funeral home or church location"
          name="funeralHome"
          autoComplete="off"
          value={funeralHome}
          onChange={(e) => setFuneralHome(e.target.value)}
        />

        <input
          className={intakeInputClass}
          placeholder="Funeral director contact (if known)"
          aria-label="Funeral director contact"
          name="funeralDirectorContact"
          autoComplete="off"
          value={funeralDirectorContact}
          onChange={(e) => setFuneralDirectorContact(e.target.value)}
        />

        <input
          className={intakeInputClass}
          placeholder="Preferred or confirmed service location"
          aria-label="Preferred or confirmed service location"
          name="serviceLocation"
          autoComplete="off"
          value={serviceLocation}
          onChange={(e) => setServiceLocation(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Wake, visitation, or viewing details"
          aria-label="Wake, visitation, or viewing details"
          name="visitationDetails"
          autoComplete="off"
          value={visitationDetails}
          onChange={(e) => setVisitationDetails(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Cemetery, burial, cremation, or committal details"
          aria-label="Cemetery, burial, cremation, or committal details"
          name="cemeteryOrCommittal"
          autoComplete="off"
          value={cemeteryOrCommittal}
          onChange={(e) => setCemeteryOrCommittal(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Readings, music, or minister preferences"
          aria-label="Readings, music, or minister preferences"
          name="readingsMusicNotes"
          autoComplete="off"
          value={readingsMusicNotes}
          onChange={(e) => setReadingsMusicNotes(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Obituary, worship aid, livestream, or program notes"
          aria-label="Obituary, worship aid, livestream, or program notes"
          name="obituaryProgramNotes"
          autoComplete="off"
          value={obituaryProgramNotes}
          onChange={(e) => setObituaryProgramNotes(e.target.value)}
        />

        <label className={intakeLabelClass}>Preferred family follow-up date (optional)</label>
        <input
          className={intakeInputClass}
          aria-label="Preferred family follow-up date"
          name="postFuneralFollowUpDate"
          type="date"
          autoComplete="off"
          value={postFuneralFollowUpDate}
          onChange={(e) => setPostFuneralFollowUpDate(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Preferred dates, times, or liturgy notes"
          aria-label="Preferred dates, times, or liturgy notes"
          name="preferredServiceNotes"
          autoComplete="off"
          value={preferredServiceNotes}
          onChange={(e) => setPreferredServiceNotes(e.target.value)}
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
