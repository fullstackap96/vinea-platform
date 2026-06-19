'use client'

import { MessageCircleReply } from 'lucide-react'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { chipBase } from '@/lib/chipStyles'
import {
  type CommunicationCommitmentEvaluation,
  type CommunicationCommitmentTone,
} from '@/lib/communicationCommitments'

function toneClass(tone: CommunicationCommitmentTone): string {
  switch (tone) {
    case 'urgent':
      return 'border-rose-200 bg-rose-50 text-rose-950'
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    case 'steady':
      return 'border-emerald-200 bg-emerald-50 text-emerald-950'
    case 'muted':
    default:
      return 'border-gray-200 bg-slate-50 text-gray-800'
  }
}

function toneLabel(tone: CommunicationCommitmentTone): string {
  switch (tone) {
    case 'urgent':
      return 'Needs reply'
    case 'warning':
      return 'Needs attention'
    case 'steady':
      return 'Waiting'
    case 'muted':
    default:
      return 'Clear'
  }
}

export function RequestCommunicationCommitmentCard({
  commitment,
}: {
  commitment: CommunicationCommitmentEvaluation | null
}) {
  if (!commitment) return null

  return (
    <section
      className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-white p-5 shadow-sm sm:p-6"
      aria-labelledby="request-communication-commitment-heading"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-700 text-white"
            aria-hidden
          >
            <MessageCircleReply className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="request-communication-commitment-heading"
                className="text-sm font-semibold uppercase tracking-wide text-sky-950"
              >
                Communication commitment
              </h2>
              <span className={`${chipBase} text-[10px] uppercase ${toneClass(commitment.tone)}`}>
                {toneLabel(commitment.tone)}
              </span>
            </div>
            <p className="mt-2 text-lg font-semibold leading-snug text-gray-950">
              {commitment.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">{commitment.reason}</p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-sky-950">
              {commitment.suggestedAction}
            </p>
          </div>
        </div>
        <a href={commitment.detailHref} className={`${primaryButtonMd} w-full justify-center lg:w-auto`}>
          Work communication
        </a>
      </div>

      <div className="mt-4 rounded-xl border border-sky-100 bg-white px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-900">
          Latest context
        </p>
        <p className="mt-1 text-sm leading-relaxed text-gray-700">{commitment.latestContext}</p>
      </div>
    </section>
  )
}
