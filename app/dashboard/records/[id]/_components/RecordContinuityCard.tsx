import Link from 'next/link'
import { CheckCircle2, FileText, ShieldCheck } from 'lucide-react'
import { secondaryButtonMd } from '@/lib/buttonStyles'
import type { SacramentalRecordContinuityView } from '@/lib/sacramentalRecordContinuity'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

type Props = {
  continuity: SacramentalRecordContinuityView
}

export function RecordContinuityCard({ continuity }: Props) {
  return (
    <section
      className={`mb-6 border border-emerald-200/80 bg-emerald-50/50 ${vineaSectionShellClassName}`}
      aria-labelledby="record-continuity-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-900 ring-1 ring-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Staff review
          </p>
          <h2 id="record-continuity-heading" className="text-lg font-semibold text-gray-950">
            Record continuity
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">{continuity.summary}</p>
        </div>

        {continuity.linkedRequestHref ? (
          <Link
            href={continuity.linkedRequestHref}
            className={`${secondaryButtonMd} w-full justify-center sm:w-auto`}
          >
            View request
          </Link>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-100 bg-white/80 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden />
            <div>
              <h3 className="text-sm font-semibold text-gray-950">{continuity.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-700">
                {continuity.state === 'linked_request_verified'
                  ? 'Use the linked request for context; still verify details before acting.'
                  : 'Manual continuity review is needed before certificate work is treated as ready.'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-white/80 p-4">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden />
            <div>
              <h3 className="text-sm font-semibold text-gray-950">
                {continuity.certificateTitle}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-700">
                {continuity.certificateSummary}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-emerald-100 bg-white/75 p-4">
        <h3 className="text-sm font-semibold text-gray-950">Before taking action</h3>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-gray-700">
          {continuity.staffGuidance.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-gray-600">{continuity.boundaryNote}</p>
      </div>
    </section>
  )
}
