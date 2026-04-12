import React from 'react'
import { RequestTypeBadge } from './RequestTypeBadge'
import {
  formatRequestStatus,
  requestStatusBadgeClasses,
  REQUEST_STATUS_SEGMENTS,
} from '@/lib/requestStatus'

export function RequestHeader({
  parishioner,
  request,
  funeralDetail,
  weddingDetail,
  onUpdateStatus,
}: {
  parishioner: any
  request: any
  funeralDetail?: any | null
  weddingDetail?: any | null
  onUpdateStatus: (newStatus: string) => void
}) {
  const requestType = String(request?.request_type || 'baptism')
  const isFuneral = requestType === 'funeral'
  const isWedding = requestType === 'wedding'
  const currentStatus = String(request?.status || '')

  const confirmedBaptismLabel = (() => {
    const value = request?.confirmed_baptism_date
    if (!value) return 'Not set'
    const d = new Date(String(value))
    if (Number.isNaN(d.getTime())) return 'Not set'
    return d.toLocaleString()
  })()

  const confirmedFuneralLabel = (() => {
    const value = funeralDetail?.confirmed_service_at
    if (!value) return 'Not set'
    const d = new Date(String(value))
    if (Number.isNaN(d.getTime())) return 'Not set'
    return d.toLocaleString()
  })()

  const confirmedWeddingLabel = (() => {
    const value = weddingDetail?.confirmed_ceremony_at
    if (!value) return 'Not set'
    const d = new Date(String(value))
    if (Number.isNaN(d.getTime())) return 'Not set'
    return d.toLocaleString()
  })()

  return (
    <div className="space-y-2 border-b border-gray-200 pb-6 sm:pb-8 text-sm sm:text-base text-gray-800 [&_strong]:text-gray-900">
      <div className="mb-2">
        <RequestTypeBadge requestType={requestType} />
      </div>

      <p className="break-words">
        <strong>Contact:</strong> {parishioner?.full_name}
      </p>
      <p className="break-words">
        <strong>Email:</strong> {parishioner?.email}
      </p>
      <p className="break-words">
        <strong>Phone:</strong> {parishioner?.phone}
      </p>

      {isFuneral ? (
        <>
          <p className="break-words">
            <strong>Deceased:</strong> {funeralDetail?.deceased_name || '—'}
          </p>
          <p className="break-words">
            <strong>Date of death:</strong>{' '}
            {funeralDetail?.date_of_death
              ? String(funeralDetail.date_of_death)
              : '—'}
          </p>
          <p className="break-words">
            <strong>Funeral home / location:</strong>{' '}
            {funeralDetail?.funeral_home_or_location || '—'}
          </p>
          <p className="break-words">
            <strong>Preferred service notes:</strong>{' '}
            {funeralDetail?.preferred_service_notes || '—'}
          </p>
          <p className="break-words">
            <strong>Confirmed service time:</strong> {confirmedFuneralLabel}
          </p>
        </>
      ) : isWedding ? (
        <>
          <p className="break-words">
            <strong>Partner 1:</strong> {weddingDetail?.partner_one_name || '—'}
          </p>
          <p className="break-words">
            <strong>Partner 2:</strong> {weddingDetail?.partner_two_name || '—'}
          </p>
          <p className="break-words">
            <strong>Proposed wedding date:</strong>{' '}
            {weddingDetail?.proposed_wedding_date
              ? String(weddingDetail.proposed_wedding_date)
              : '—'}
          </p>
          <p className="break-words">
            <strong>Ceremony notes:</strong> {weddingDetail?.ceremony_notes || '—'}
          </p>
          <p className="break-words">
            <strong>Confirmed ceremony time:</strong> {confirmedWeddingLabel}
          </p>
        </>
      ) : (
        <>
          <p className="break-words">
            <strong>Child:</strong> {request?.child_name}
          </p>
          <p className="break-words">
            <strong>Preferred Dates:</strong> {request?.preferred_dates}
          </p>
          <p className="break-words">
            <strong>Confirmed Baptism Date:</strong> {confirmedBaptismLabel}
          </p>
        </>
      )}

      <p className="break-words">
        <strong>Notes:</strong> {request?.notes}
      </p>
      <p className="flex flex-wrap items-center gap-2 break-words">
        <strong>Status:</strong>{' '}
        <span className={requestStatusBadgeClasses(request?.status)}>
          {formatRequestStatus(request?.status)}
        </span>
      </p>

      <div className="pt-4">
        <p className="font-semibold mb-2 text-gray-900">Update status</p>

        <div
          className="flex w-full flex-col gap-1 rounded-lg border border-gray-200 bg-gray-100/90 p-1 sm:inline-flex sm:w-auto sm:flex-row sm:flex-wrap"
          role="group"
          aria-label="Set request status"
        >
          {REQUEST_STATUS_SEGMENTS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onUpdateStatus(value)}
              className={
                currentStatus === value
                  ? 'inline-flex w-full items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-gray-200/90 sm:w-auto'
                  : 'inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white/60 sm:w-auto'
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
