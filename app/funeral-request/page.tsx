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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const intakeRes = await fetch('/api/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
    setLoading(false)
  }

  return (
    <PublicIntakeShell
      title="Funeral / memorial request"
      description="Submit a request for funeral or memorial liturgy planning. A parish staff member will contact you."
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

        <h2 className={`${intakeSectionHeadingClass} mt-6 border-t border-gray-100 pt-2`}>
          About the deceased
        </h2>
        <input
          className={intakeInputClass}
          placeholder="Deceased full name"
          value={deceasedName}
          onChange={(e) => setDeceasedName(e.target.value)}
          required
        />

        <input
          className={intakeInputClass}
          placeholder="Your relationship to the deceased"
          value={familyRelationship}
          onChange={(e) => setFamilyRelationship(e.target.value)}
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

        <input
          className={intakeInputClass}
          placeholder="Funeral director contact (if known)"
          value={funeralDirectorContact}
          onChange={(e) => setFuneralDirectorContact(e.target.value)}
        />

        <input
          className={intakeInputClass}
          placeholder="Preferred or confirmed service location"
          value={serviceLocation}
          onChange={(e) => setServiceLocation(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Wake, visitation, or viewing details"
          value={visitationDetails}
          onChange={(e) => setVisitationDetails(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Cemetery, burial, cremation, or committal details"
          value={cemeteryOrCommittal}
          onChange={(e) => setCemeteryOrCommittal(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Readings, music, or minister preferences"
          value={readingsMusicNotes}
          onChange={(e) => setReadingsMusicNotes(e.target.value)}
        />

        <textarea
          className={intakeTextareaClass}
          placeholder="Obituary, worship aid, livestream, or program notes"
          value={obituaryProgramNotes}
          onChange={(e) => setObituaryProgramNotes(e.target.value)}
        />

        <label className={intakeLabelClass}>Preferred family follow-up date (optional)</label>
        <input
          className={intakeInputClass}
          type="date"
          value={postFuneralFollowUpDate}
          onChange={(e) => setPostFuneralFollowUpDate(e.target.value)}
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
