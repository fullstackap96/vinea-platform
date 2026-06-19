'use client'

import { ClipboardList } from 'lucide-react'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { chipBase } from '@/lib/chipStyles'
import type { IntakeQualityResult } from '@/lib/intakeQuality'

export function RequestIntakeQualityCard({ quality }: { quality: IntakeQualityResult }) {
  const isComplete = quality.status === 'complete'

  return (
    <section
      className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${
        isComplete
          ? 'border-emerald-100 bg-emerald-50/50'
          : 'border-amber-100 bg-amber-50/50'
      }`}
      aria-labelledby="request-intake-quality-heading"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              isComplete ? 'bg-emerald-700 text-white' : 'bg-amber-600 text-white'
            }`}
            aria-hidden
          >
            <ClipboardList className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="request-intake-quality-heading"
                className="text-sm font-semibold uppercase tracking-wide text-gray-700"
              >
                Intake check
              </h2>
              <span
                className={`${chipBase} text-[10px] uppercase ${
                  isComplete
                    ? 'border-emerald-200 bg-white text-emerald-950'
                    : 'border-amber-200 bg-white text-amber-950'
                }`}
              >
                {isComplete ? 'Looks complete' : 'Confirm details'}
              </span>
            </div>
            <p className="mt-2 text-lg font-semibold leading-snug text-gray-950">
              {quality.headline}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">{quality.summary}</p>
          </div>
        </div>
        <a href={quality.actionHref} className={`${primaryButtonMd} w-full justify-center lg:w-auto`}>
          {quality.actionLabel}
        </a>
      </div>

      {quality.issues.length > 0 ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {quality.issues.map((issue) => (
            <li
              key={issue.key}
              className="rounded-xl border border-white/80 bg-white px-4 py-3 text-sm leading-relaxed text-gray-800 shadow-sm"
            >
              {issue.label}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
