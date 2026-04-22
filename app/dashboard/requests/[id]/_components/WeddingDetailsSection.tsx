import React from 'react'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import { sectionHeadingClassName } from '@/lib/sectionHeader'

export function WeddingDetailsSection({
  partnerOneName,
  setPartnerOneName,
  partnerTwoName,
  setPartnerTwoName,
  proposedWeddingDate,
  setProposedWeddingDate,
  ceremonyNotes,
  setCeremonyNotes,
  onSave,
  saving,
  message,
}: {
  partnerOneName: string
  setPartnerOneName: (v: string) => void
  partnerTwoName: string
  setPartnerTwoName: (v: string) => void
  proposedWeddingDate: string
  setProposedWeddingDate: (v: string) => void
  ceremonyNotes: string
  setCeremonyNotes: (v: string) => void
  onSave: () => void
  saving: boolean
  message: string
}) {
  return (
    <div>
      <h2 className={sectionHeadingClassName}>Wedding details</h2>
      <div className="space-y-3">
        <input
          className="w-full border p-3 rounded"
          placeholder="Partner name"
          value={partnerOneName}
          onChange={(e) => setPartnerOneName(e.target.value)}
          required
        />
        <input
          className="w-full border p-3 rounded"
          placeholder="Partner name (optional)"
          value={partnerTwoName}
          onChange={(e) => setPartnerTwoName(e.target.value)}
        />
        <label className="block text-sm text-gray-800">Proposed wedding date (optional)</label>
        <input
          className="w-full border p-3 rounded"
          type="date"
          value={proposedWeddingDate}
          onChange={(e) => setProposedWeddingDate(e.target.value)}
        />
        <textarea
          className="w-full border p-3 rounded min-h-[80px]"
          placeholder="Ceremony notes"
          value={ceremonyNotes}
          onChange={(e) => setCeremonyNotes(e.target.value)}
        />
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !partnerOneName.trim()}
          className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
        >
          {saving ? 'Saving...' : 'Save wedding details'}
        </button>
      </div>
      <InlineFormMessage message={message} />
    </div>
  )
}
