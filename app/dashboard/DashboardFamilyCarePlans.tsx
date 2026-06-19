'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, HeartHandshake } from 'lucide-react'
import type { CarePlan, CarePlanPriority } from '@/lib/carePlans'
import { primaryButtonSm, secondaryButtonSm } from '@/lib/buttonStyles'
import { chipBase } from '@/lib/chipStyles'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaEmptyStateClassName, vineaSectionShellClassName } from '@/lib/vineaUi'

export type CompleteCarePlanTouchpointInput = {
  plan: CarePlan
  method: string
  notes: string
  nextFollowUpDate: string | null
  careCycleComplete: boolean
}

type Props = {
  plans: CarePlan[]
  loading: boolean
  dataUnavailable?: boolean
  completingPlanId?: string | null
  messages?: Record<string, string>
  onCompleteTouchpoint?: (
    input: CompleteCarePlanTouchpointInput
  ) => Promise<{ ok: true } | { ok: false; error: string }>
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
  completingPlanId = null,
  messages = {},
  onCompleteTouchpoint,
}: Props) {
  const hidePanel = Boolean(dataUnavailable && !loading)
  const urgentCount = plans.filter((plan) => plan.priority === 'urgent').length
  const [openPlanId, setOpenPlanId] = useState<string | null>(null)
  const [methodByPlanId, setMethodByPlanId] = useState<Record<string, string>>({})
  const [notesByPlanId, setNotesByPlanId] = useState<Record<string, string>>({})
  const [nextDateByPlanId, setNextDateByPlanId] = useState<Record<string, string>>({})
  const [careCompleteByPlanId, setCareCompleteByPlanId] = useState<Record<string, boolean>>({})

  async function submitCarePlan(plan: CarePlan) {
    if (!onCompleteTouchpoint) return
    const method = methodByPlanId[plan.requestId] || 'phone'
    const careCycleComplete = Boolean(careCompleteByPlanId[plan.requestId])
    const nextFollowUpDate = careCycleComplete
      ? null
      : nextDateByPlanId[plan.requestId] || plan.nextFollowUpRecommendations[0]?.date || null
    const result = await onCompleteTouchpoint({
      plan,
      method,
      notes: notesByPlanId[plan.requestId] || '',
      nextFollowUpDate,
      careCycleComplete,
    })
    if (result.ok) {
      setOpenPlanId(null)
      setNotesByPlanId((current) => ({ ...current, [plan.requestId]: '' }))
      setCareCompleteByPlanId((current) => ({ ...current, [plan.requestId]: false }))
    }
  }

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
                  <div className="mt-3 flex flex-wrap gap-2">
                    {onCompleteTouchpoint ? (
                      <button
                        type="button"
                        className={`${primaryButtonSm} gap-2 bg-white text-gray-950 hover:bg-white/90`}
                        onClick={() =>
                          setOpenPlanId((current) =>
                            current === plan.requestId ? null : plan.requestId
                          )
                        }
                      >
                        <CheckCircle2 className="h-4 w-4" aria-hidden />
                        Record care touchpoint
                      </button>
                    ) : null}
                    <Link
                      href={plan.detailHref}
                      className={`${secondaryButtonSm} gap-2 border-white/80 bg-white/70 text-gray-950 hover:bg-white/90`}
                    >
                      Open request
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>

                  {openPlanId === plan.requestId && onCompleteTouchpoint ? (
                    <form
                      className="mt-4 rounded-xl border border-white/80 bg-white/80 p-3 text-gray-950"
                      onSubmit={(event) => {
                        event.preventDefault()
                        void submitCarePlan(plan)
                      }}
                    >
                      <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                        <label className="text-sm font-semibold">
                          Contact type
                          <select
                            className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                            value={methodByPlanId[plan.requestId] || 'phone'}
                            onChange={(event) =>
                              setMethodByPlanId((current) => ({
                                ...current,
                                [plan.requestId]: event.target.value,
                              }))
                            }
                          >
                            <option value="phone">Phone call</option>
                            <option value="email">Email</option>
                            <option value="voicemail">Left voicemail</option>
                            <option value="card">Sent card</option>
                            <option value="in_person">In person</option>
                          </select>
                        </label>
                        <label className="text-sm font-semibold">
                          Notes
                          <textarea
                            className="mt-1 min-h-20 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm leading-relaxed"
                            placeholder="Optional: what happened or what the family needs next"
                            value={notesByPlanId[plan.requestId] || ''}
                            onChange={(event) =>
                              setNotesByPlanId((current) => ({
                                ...current,
                                [plan.requestId]: event.target.value,
                              }))
                            }
                          />
                        </label>
                      </div>

                      <fieldset className="mt-3">
                        <legend className="text-sm font-semibold">Next follow-up</legend>
                        <div className="mt-2 grid gap-2 sm:grid-cols-3">
                          {plan.nextFollowUpRecommendations.map((recommendation) => (
                            <label
                              key={recommendation.id}
                              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                            >
                              <input
                                type="radio"
                                name={`next-follow-up-${plan.requestId}`}
                                className="mr-2"
                                checked={
                                  !careCompleteByPlanId[plan.requestId] &&
                                  (nextDateByPlanId[plan.requestId] ||
                                    plan.nextFollowUpRecommendations[0]?.date) ===
                                    recommendation.date
                                }
                                onChange={() => {
                                  setCareCompleteByPlanId((current) => ({
                                    ...current,
                                    [plan.requestId]: false,
                                  }))
                                  setNextDateByPlanId((current) => ({
                                    ...current,
                                    [plan.requestId]: recommendation.date,
                                  }))
                                }}
                              />
                              <span className="font-semibold">{recommendation.label}</span>
                              <span className="mt-1 block text-xs leading-relaxed text-gray-600">
                                {recommendation.description}
                              </span>
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      <label className="mt-3 block text-sm font-semibold">
                        Specific date
                        <input
                          type="date"
                          className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm sm:w-52"
                          value={
                            careCompleteByPlanId[plan.requestId]
                              ? ''
                              : nextDateByPlanId[plan.requestId] ||
                                plan.nextFollowUpRecommendations[0]?.date ||
                                ''
                          }
                          disabled={Boolean(careCompleteByPlanId[plan.requestId])}
                          onChange={(event) => {
                            setCareCompleteByPlanId((current) => ({
                              ...current,
                              [plan.requestId]: false,
                            }))
                            setNextDateByPlanId((current) => ({
                              ...current,
                              [plan.requestId]: event.target.value,
                            }))
                          }}
                        />
                      </label>

                      {plan.canCompleteCareCycle ? (
                        <label className="mt-3 flex items-start gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={Boolean(careCompleteByPlanId[plan.requestId])}
                            onChange={(event) =>
                              setCareCompleteByPlanId((current) => ({
                                ...current,
                                [plan.requestId]: event.target.checked,
                              }))
                            }
                          />
                          <span>
                            <span className="block font-semibold">Care cycle is complete</span>
                            <span className="block text-xs leading-relaxed text-gray-600">
                              Use this only when no further bereavement follow-up is needed.
                            </span>
                          </span>
                        </label>
                      ) : null}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="submit"
                          className={primaryButtonSm}
                          disabled={completingPlanId === plan.requestId}
                        >
                          {completingPlanId === plan.requestId
                            ? 'Saving...'
                            : 'Save touchpoint'}
                        </button>
                        <button
                          type="button"
                          className={secondaryButtonSm}
                          onClick={() => setOpenPlanId(null)}
                          disabled={completingPlanId === plan.requestId}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : null}
                  <InlineFormMessage message={messages[plan.requestId] || ''} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
