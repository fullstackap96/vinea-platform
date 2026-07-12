import { ExportAuditReviewerDashboardPrototype } from './ExportAuditReviewerDashboardPrototype'

export const dynamic = 'force-dynamic'

const REVIEWER_PROTOTYPE_ENABLED_VALUE = 'ENABLED'
const REVIEWER_PROTOTYPE_ACK_VALUE = 'APPROVED_EXPORT_AUDIT_REVIEWER_QA'
const REVIEWER_PROTOTYPE_NON_PRODUCTION_VALUE = 'NON_PRODUCTION'

function isPrototypeEnabled() {
  return (
    process.env.VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE === REVIEWER_PROTOTYPE_ENABLED_VALUE &&
    process.env.VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK === REVIEWER_PROTOTYPE_ACK_VALUE &&
    process.env.VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV ===
      REVIEWER_PROTOTYPE_NON_PRODUCTION_VALUE &&
    process.env.NODE_ENV !== 'production' &&
    process.env.VERCEL_ENV !== 'production'
  )
}

function UnavailablePrototype() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          Non-production prototype
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-amber-950">
          Export Audit Reviewer
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed">
          This reviewer dashboard is unavailable. It is only available in an approved
          non-production QA environment with the reviewer prototype flags enabled.
        </p>
        <p className="mt-3 text-sm font-semibold">Production exports remain NO-GO.</p>
      </div>
    </main>
  )
}

export default function ExportAuditReviewerPage() {
  if (!isPrototypeEnabled()) return <UnavailablePrototype />

  return <ExportAuditReviewerDashboardPrototype />
}
