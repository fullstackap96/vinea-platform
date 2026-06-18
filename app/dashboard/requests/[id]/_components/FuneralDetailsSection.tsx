import React from 'react'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import { sectionHeadingClassName } from '@/lib/sectionHeader'

export function FuneralDetailsSection({
  deceasedName,
  setDeceasedName,
  familyRelationship,
  setFamilyRelationship,
  dateOfDeath,
  setDateOfDeath,
  funeralHome,
  setFuneralHome,
  funeralDirectorContact,
  setFuneralDirectorContact,
  serviceLocation,
  setServiceLocation,
  visitationDetails,
  setVisitationDetails,
  cemeteryOrCommittal,
  setCemeteryOrCommittal,
  readingsMusicNotes,
  setReadingsMusicNotes,
  obituaryProgramNotes,
  setObituaryProgramNotes,
  postFuneralFollowUpDate,
  setPostFuneralFollowUpDate,
  preferredServiceNotes,
  setPreferredServiceNotes,
  onSave,
  saving,
  message,
}: {
  deceasedName: string
  setDeceasedName: (v: string) => void
  familyRelationship: string
  setFamilyRelationship: (v: string) => void
  dateOfDeath: string
  setDateOfDeath: (v: string) => void
  funeralHome: string
  setFuneralHome: (v: string) => void
  funeralDirectorContact: string
  setFuneralDirectorContact: (v: string) => void
  serviceLocation: string
  setServiceLocation: (v: string) => void
  visitationDetails: string
  setVisitationDetails: (v: string) => void
  cemeteryOrCommittal: string
  setCemeteryOrCommittal: (v: string) => void
  readingsMusicNotes: string
  setReadingsMusicNotes: (v: string) => void
  obituaryProgramNotes: string
  setObituaryProgramNotes: (v: string) => void
  postFuneralFollowUpDate: string
  setPostFuneralFollowUpDate: (v: string) => void
  preferredServiceNotes: string
  setPreferredServiceNotes: (v: string) => void
  onSave: () => void
  saving: boolean
  message: string
}) {
  return (
    <div>
      <h2 className={sectionHeadingClassName}>Funeral details</h2>
      <div className="space-y-3">
        <input
          className="w-full border p-3 rounded"
          placeholder="Deceased name"
          value={deceasedName}
          onChange={(e) => setDeceasedName(e.target.value)}
          required
        />
        <input
          className="w-full border p-3 rounded"
          placeholder="Relationship to deceased"
          value={familyRelationship}
          onChange={(e) => setFamilyRelationship(e.target.value)}
        />
        <label className="block text-sm text-gray-800">Date of death (optional)</label>
        <input
          className="w-full border p-3 rounded"
          type="date"
          value={dateOfDeath}
          onChange={(e) => setDateOfDeath(e.target.value)}
        />
        <input
          className="w-full border p-3 rounded"
          placeholder="Funeral home or location"
          value={funeralHome}
          onChange={(e) => setFuneralHome(e.target.value)}
        />
        <textarea
          className="w-full border p-3 rounded min-h-[72px]"
          placeholder="Funeral director contact (name, phone, email)"
          value={funeralDirectorContact}
          onChange={(e) => setFuneralDirectorContact(e.target.value)}
        />
        <input
          className="w-full border p-3 rounded"
          placeholder="Service location"
          value={serviceLocation}
          onChange={(e) => setServiceLocation(e.target.value)}
        />
        <textarea
          className="w-full border p-3 rounded min-h-[72px]"
          placeholder="Wake, visitation, or viewing details"
          value={visitationDetails}
          onChange={(e) => setVisitationDetails(e.target.value)}
        />
        <textarea
          className="w-full border p-3 rounded min-h-[72px]"
          placeholder="Cemetery, burial, cremation, or committal details"
          value={cemeteryOrCommittal}
          onChange={(e) => setCemeteryOrCommittal(e.target.value)}
        />
        <textarea
          className="w-full border p-3 rounded min-h-[72px]"
          placeholder="Readings, music, ministers, or liturgy planning notes"
          value={readingsMusicNotes}
          onChange={(e) => setReadingsMusicNotes(e.target.value)}
        />
        <textarea
          className="w-full border p-3 rounded min-h-[72px]"
          placeholder="Obituary, worship aid, livestream, or program notes"
          value={obituaryProgramNotes}
          onChange={(e) => setObituaryProgramNotes(e.target.value)}
        />
        <label className="block text-sm text-gray-800">
          Post-funeral family follow-up date (optional)
        </label>
        <input
          className="w-full border p-3 rounded"
          type="date"
          value={postFuneralFollowUpDate}
          onChange={(e) => setPostFuneralFollowUpDate(e.target.value)}
        />
        <textarea
          className="w-full border p-3 rounded min-h-[80px]"
          placeholder="Preferred service notes (dates, times, wishes)"
          value={preferredServiceNotes}
          onChange={(e) => setPreferredServiceNotes(e.target.value)}
        />
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !deceasedName.trim()}
          className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
        >
          {saving ? 'Saving...' : 'Save funeral details'}
        </button>
      </div>
      <InlineFormMessage message={message} />
    </div>
  )
}
