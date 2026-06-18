'use client'

import { AlertTriangle, CheckCircle2, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import type { ParishOpsBrief, ParishOpsBriefSeverity } from '@/lib/parishOpsBrief'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

type Props = {
  brief: ParishOpsBrief
  loading: boolean
  dataUnavailable?: boolean
}

function severityClass(severity: ParishOpsBriefSeverity) {
  switch (severity) {
    case 'urgent':
      return 'border-rose-200 bg-rose-50 text-rose-950'
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    case 'steady':
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-950'
  }
}

function SeverityIcon({ severity }: { severity: ParishOpsBriefSeverity }) {
  if (severity === 'steady') return <CheckCircle2 className="h-4 w-4" aria-hidden />
  if (severity === 'warning') return <ClipboardList className="h-4 w-4" aria-hidden />
  return <AlertTriangle className="h-4 w-4" aria-hidden />
}

export function DashboardParishOpsBrief({
  brief,
  loading,
  dataUnavailable = false,
}: Props) {
  const hideBrief = Boolean(dataUnavailable && !loading)

  return (
    <section
      className={vineaSectionShellClassName}
      aria-labelledby="parish-ops-brief-heading"
      aria-busy={loading}
    >
      <h2 id="parish-ops-brief-heading" className={sectionHeadingClassName}>
        Parish ops brief
      </h2>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
        A quick staff briefing for today&apos;s ownership, blockers, aging follow-up, and
        operational risk.
      </p>

      {loading ? (
        <div className="mt-4 animate-pulse rounded-lg border border-gray-200 bg-white p-4">
          <div className="h-5 w-52 rounded bg-gray-200" />
          <div className="mt-3 h-4 w-full max-w-xl rounded bg-gray-200" />
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>
      ) : hideBrief ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-5 text-center text-sm text-rose-950"
        >
          Requests could not be loaded, so the parish ops brief is unavailable.
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-gray-900/[0.03]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xl font-bold leading-snug text-gray-900 text-balance">
                {brief.headline}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600 text-pretty">
                {brief.subline}
              </p>
            </div>
            {brief.focusItems.length > 0 ? (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                Top {brief.focusItems.length} focus rows ready
              </span>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {brief.items.map((item) => (
              <div
                key={item.key}
                className={`rounded-lg border px-3 py-3 ${severityClass(item.severity)}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide">{item.label}</p>
                  <SeverityIcon severity={item.severity} />
                </div>
                <p className="mt-1 text-2xl font-bold tabular-nums">{item.value}</p>
                <p className="mt-1 text-xs leading-snug opacity-90">{item.detail}</p>
              </div>
            ))}
          </div>

          {brief.focusItems.length > 0 ? (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Start here
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-3">
                {brief.focusItems.map((item) => (
                  <Link
                    key={item.requestId}
                    href={item.href}
                    className="block rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm transition-colors hover:border-brand/30 hover:bg-brand-muted/40"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                        {item.requestTypeLabel}
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        {item.actionLabel}
                      </span>
                    </div>
                    <p className="mt-2 font-bold leading-snug text-gray-900 text-balance">
                      {item.nextStepTitle}
                    </p>
                    <p className="mt-1 text-sm leading-snug text-gray-700 text-balance">
                      {item.title}
                    </p>
                    <p className="mt-2 text-xs leading-snug text-gray-500">
                      Owner: {item.ownerLabel} · Blocker: {item.blockerLabel}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
