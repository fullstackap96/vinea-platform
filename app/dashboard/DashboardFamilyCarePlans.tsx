'use client'

import Link from 'next/link'
import { ArrowRight, HeartHandshake } from 'lucide-react'
import type { CarePlan, CarePlanPriority } from '@/lib/carePlans'
import { primaryButtonSm } from '@/lib/buttonStyles'
import { chipBase } from '@/lib/chipStyles'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaEmptyStateClassName, vineaSectionShellClassName } from '@/lib/vineaUi'

type Props = {
  plans: CarePlan[]
  loading: boolean
  dataUnavailable?: boolean
}

function priorityClass(priority: CarePlanPriority): string {
  switch (priority) {
    case 'urgent':
      return 'border-rose-200 bg-rose-50 text-rose-950'
    case 'high':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    case 'steady':
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-950'
  }
}

function stageLabel(stage: CarePlan['stage']): string {
  if (stage === 'before_service') return 'Before service'
  if (stage === 'post_funeral') return 'Post-funeral'
  return 'Ongoing care'
}

export function DashboardFamilyCarePlans({
  plans,
  loading,
  dataUnavailable = false,
}: Props) {
  const hidePanel = Boolean(dataUnavailable && !loading)
  const urgentCount = plans.filter((plan) => plan.priority === 'urgent').length

  return (
    <section
      className={vineaSectionShellClassName}
      aria-labelledby="family-care-plans-heading"
      aria-busy={loading}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Pastoral care plans
          </p>
          <h2 id="family-care-plans-heading" className={`${sectionHeadingClassName} mt-1`}>
            Families needing care
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            Funeral bereavement care and other family care plans that need a staff touchpoint.
          </p>
        </div>
        {!loading && !hidePanel ? (
          <span
            className={`${chipBase} border ${
              urgentCount > 0
                ? 'border-rose-200 bg-rose-50 text-rose-950'
                : 'border-emerald-200 bg-emerald-50 text-emerald-950'
            }`}
          >
            {urgentCount > 0 ? `${urgentCount} urgent` : 'No urgent care plans'}
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2" role="status" aria-label="Loading family care plans">
          {[0, 1].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-xl border border-gray-200 bg-white" />
          ))}
        </div>
      ) : hidePanel ? (
        <div className={vineaEmptyStateClassName} role="alert">
          <p className="text-base font-semibold text-gray-900">Family care plans unavailable</p>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
            Requests could not be loaded, so care plans are not shown.
          </p>
        </div>
      ) : plans.length === 0 ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-relaxed text-emerald-950">
          <p className="font-semibold">No active care plans need attention right now.</p>
          <p className="mt-1">
            Funeral bereavement plans will appear here as services are scheduled or follow-up is due.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {plans.map((plan) => (
            <article
              key={`${plan.planType}-${plan.requestId}`}
              className={`rounded-xl border px-4 py-4 shadow-sm ${priorityClass(plan.priority)}`}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-gray-900 ring-1 ring-gray-200">
                  <HeartHandshake className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`${chipBase} border border-white/80 bg-white/70 text-[10px] uppercase`}>
                      {stageLabel(plan.stage)}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide opacity-75">
                      {plan.dueLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-base font-bold leading-snug">{plan.headline}</p>
                  <p className="mt-1 text-sm font-semibold">{plan.familyLabel}</p>
                  <p className="mt-1 text-sm leading-relaxed opacity-90">{plan.summary}</p>
                  <p className="mt-2 text-sm leading-relaxed">
                    <span className="font-semibold">Next: </span>
                    {plan.nextTouchpoint}
                  </p>
                  <Link href={plan.detailHref} className={`${primaryButtonSm} mt-3 gap-2 bg-white text-gray-950 hover:bg-white/90`}>
                    Work care plan
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
