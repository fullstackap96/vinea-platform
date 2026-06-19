'use client'

import { useState } from 'react'
import { ArrowRight, Clipboard, ClipboardCheck } from 'lucide-react'
import { chipBase } from '@/lib/chipStyles'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import {
  type RequestHandoffBrief,
  type RequestHandoffBriefTone,
} from '@/lib/requestHandoffBrief'

function toneClass(tone: RequestHandoffBriefTone): string {
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

export function RequestHandoffBriefCard({ brief }: { brief: RequestHandoffBrief }) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')

  async function copyHandoffNote() {
    try {
      await navigator.clipboard.writeText(brief.handoffNote)
      setCopyStatus('copied')
      window.setTimeout(() => setCopyStatus('idle'), 2500)
    } catch {
      setCopyStatus('failed')
    }
  }

  return (
    <section
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
      aria-labelledby="request-handoff-brief-heading"
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
                id="request-handoff-brief-heading"
                className="text-sm font-semibold uppercase tracking-wide text-gray-700"
              >
                Staff handoff brief
              </h2>
              <span className={`${chipBase} text-[10px] uppercase ${toneClass(brief.urgencyTone)}`}>
                {brief.urgencyLabel}
              </span>
            </div>
            <p className="mt-2 text-lg font-semibold leading-snug text-gray-950">
              {brief.nextAction}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {brief.title} - {brief.statusLine} {brief.contextLine}
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 lg:w-auto">
          <a
            href={brief.nextActionHref}
            className={`${primaryButtonMd} w-full justify-center gap-2 lg:w-auto`}
          >
            {brief.nextActionLabel}
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
          </a>
          <button
            type="button"
            onClick={copyHandoffNote}
            className={`${secondaryButtonMd} w-full justify-center gap-2 lg:w-auto`}
          >
            <Clipboard className="h-4 w-4 shrink-0" aria-hidden />
            {copyStatus === 'copied' ? 'Copied handoff note' : 'Copy handoff note'}
          </button>
        </div>
      </div>

      {copyStatus === 'failed' ? (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-950">
          Copy did not work in this browser. You can still review the handoff details below.
        </p>
      ) : null}

      <dl className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {brief.items.map((item) => (
          <div
            key={item.key}
            className={`rounded-xl border px-4 py-3 ${toneClass(item.tone)}`}
          >
            <dt className="text-xs font-semibold uppercase tracking-wide opacity-75">
              {item.label}
            </dt>
            <dd className="mt-1 text-sm font-medium leading-relaxed">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
