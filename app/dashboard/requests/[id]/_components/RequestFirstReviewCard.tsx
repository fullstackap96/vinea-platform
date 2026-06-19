'use client'

import { ClipboardCheck } from 'lucide-react'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { chipBase } from '@/lib/chipStyles'
import type { FirstReviewTone, RequestFirstReview } from '@/lib/requestFirstReview'

function toneClass(tone: FirstReviewTone): string {
  switch (tone) {
    case 'urgent':
      return 'border-rose-200 bg-rose-50 text-rose-950'
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    case 'steady':
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-950'
  }
}

function toneLabel(tone: FirstReviewTone): string {
  if (tone === 'urgent') return 'Review today'
  if (tone === 'warning') return 'Needs review'
  return 'Ready to review'
}

export function RequestFirstReviewCard({ review }: { review: RequestFirstReview }) {
  return (
    <section
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ring-1 ring-gray-900/[0.03] sm:p-6"
      aria-labelledby="request-first-review-heading"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-white"
            aria-hidden
          >
            <ClipboardCheck className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="request-first-review-heading"
                className="text-sm font-semibold uppercase tracking-wide text-gray-700"
              >
                First review
              </h2>
              <span className={`${chipBase} text-[10px] uppercase ${toneClass(review.tone)}`}>
                {toneLabel(review.tone)}
              </span>
            </div>
            <p className="mt-2 text-lg font-semibold leading-snug text-gray-950">
              {review.whatThisIs}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              <span className="font-semibold text-gray-900">Why now: </span>
              {review.whyNow}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              <span className="font-semibold text-gray-900">Do first: </span>
              {review.doFirst}
            </p>
          </div>
        </div>
        <a href={review.actionHref} className={`${primaryButtonMd} w-full justify-center lg:w-auto`}>
          {review.actionLabel}
        </a>
      </div>

      <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
          Missing details to check
        </p>
        {review.missingDetails.length > 0 ? (
          <ul className="mt-2 grid gap-2 text-sm text-gray-800 sm:grid-cols-2">
            {review.missingDetails.map((detail) => (
              <li key={detail} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" aria-hidden />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-gray-700">
            No major missing details are showing right now.
          </p>
        )}
      </div>
    </section>
  )
}
