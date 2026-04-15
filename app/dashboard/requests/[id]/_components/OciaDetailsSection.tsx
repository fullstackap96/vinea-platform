import React from 'react'
import {
  labelContactMethod,
  labelSacramentalBackground,
  labelSeeking,
} from '@/lib/ociaIntakeOptions'

export function OciaDetailsSection({ detail }: { detail: Record<string, unknown> | null }) {
  if (!detail) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">OCIA intake</h2>
        <p className="text-sm text-gray-700">No OCIA details were found for this request.</p>
      </div>
    )
  }

  const dob = detail.date_of_birth ? String(detail.date_of_birth) : ''
  const ageNote = String(detail.age_or_dob_note || '').trim()

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">OCIA intake</h2>

      <div className="border rounded p-4 space-y-3 text-sm sm:text-base text-gray-800 [&_strong]:text-gray-900">
        <p>
          <strong>Date of birth:</strong> {dob || '—'}
        </p>
        <p>
          <strong>Age / DOB (as entered):</strong> {ageNote || '—'}
        </p>
        <p>
          <strong>Sacramental background:</strong>{' '}
          {labelSacramentalBackground(String(detail.sacramental_background))}
        </p>
        <p>
          <strong>Seeking:</strong> {labelSeeking(String(detail.seeking))}
        </p>
        <p>
          <strong>Parishioner status:</strong> {String(detail.parishioner_status || '—')}
        </p>
        <p>
          <strong>Preferred contact:</strong>{' '}
          {labelContactMethod(String(detail.preferred_contact_method))}
        </p>
        <p>
          <strong>Availability:</strong> {String(detail.availability || '—')}
        </p>
      </div>
    </div>
  )
}
