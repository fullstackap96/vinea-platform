'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, ShieldCheck } from 'lucide-react'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import {
  onboardingLoadErrorMessage,
  onboardingSaveErrorMessage,
} from '@/lib/onboardingClientMessages'
import {
  ONBOARDING_COMPLETION_CONFIRMATION_TIMEOUT_MS,
  ONBOARDING_COMPLETION_REFRESH_REQUIRED_MESSAGE,
} from '@/lib/onboardingClientConfirmation'
import {
  parseOnboardingSettingsResponse,
  parseOnboardingStaffResponse,
  type OnboardingParishReadModel,
  type OnboardingStaffReadModel,
} from '@/lib/onboardingReadModel'
import { buildParishGoLiveReadiness } from '@/lib/parishGoLiveReadiness'
import { buildParishOnboardingReadiness, type ParishReadinessResult } from '@/lib/parishOnboardingReadiness'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import {
  vineaEmptyStateClassName,
  vineaSectionShellClassName,
  vineaSpinnerClassName,
} from '@/lib/vineaUi'

const PILOT_ITEMS = [
  'First admin staff user is seeded',
  'Public request forms create new requests',
  'Email sending is configured',
  'Daily brief recipient is configured',
  'Staff can see new requests in the dashboard',
  'Audit log shows settings and request activity',
]
const ONBOARDING_READINESS_LOAD_TIMEOUT_MS = 15_000

function ReadinessRing({ readiness }: { readiness: ParishReadinessResult }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 text-center">
      <p className="text-4xl font-bold tabular-nums text-gray-950">{readiness.percent}%</p>
      <p className="mt-1 text-sm font-medium text-gray-700">
        {readiness.completedCount} of {readiness.totalCount} setup items complete
      </p>
    </div>
  )
}

export function ParishOnboardingPage({ activeParishId = null }: { activeParishId?: string | null }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const completionInFlightRef = useRef(false)
  const mountedRef = useRef(false)
  const loadSequenceRef = useRef(0)
  const loadAbortRef = useRef<AbortController | null>(null)
  const [completionRequiresRefresh, setCompletionRequiresRefresh] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [parish, setParish] = useState<OnboardingParishReadModel | null>(null)
  const [activeParishName, setActiveParishName] = useState('')
  const [staffUsers, setStaffUsers] = useState<OnboardingStaffReadModel[]>([])

  const readiness = useMemo(
    () => buildParishOnboardingReadiness({ parish, staffUsers }),
    [parish, staffUsers]
  )
  const goLiveReadiness = useMemo(
    () => buildParishGoLiveReadiness({ setupReadiness: readiness }),
    [readiness]
  )

  const load = useCallback(async (): Promise<OnboardingParishReadModel | null> => {
    const loadSequence = ++loadSequenceRef.current
    loadAbortRef.current?.abort()
    const controller = new AbortController()
    loadAbortRef.current = controller
    const isLatestLoad = () => loadSequence === loadSequenceRef.current
    let loadTimedOut = false
    const timeoutId = window.setTimeout(() => {
      loadTimedOut = true
      controller.abort()
    }, ONBOARDING_READINESS_LOAD_TIMEOUT_MS)

    setLoading(true)
    setError('')
    setParish(null)
    setStaffUsers([])
    setActiveParishName('')
    try {
      const [settingsRes, staffRes] = await Promise.all([
        fetch('/api/parish/settings', { credentials: 'include', signal: controller.signal }),
        fetch('/api/parish/staff-users', { credentials: 'include', signal: controller.signal }),
      ])
      const settingsData = await settingsRes.json().catch(() => ({}))
      const staffData = await staffRes.json().catch(() => ({}))
      if (!isLatestLoad()) return null

      if (!settingsRes.ok || !settingsData?.ok) {
        setError(onboardingLoadErrorMessage(settingsData?.error))
        return null
      }
      if (!staffRes.ok || !staffData?.ok) {
        setError(onboardingLoadErrorMessage(staffData?.error))
        return null
      }
      const nextParish = parseOnboardingSettingsResponse(settingsData)
      const nextStaff = parseOnboardingStaffResponse(staffData)
      if (!nextParish || !nextStaff) {
        setError(onboardingLoadErrorMessage(null))
        return null
      }
      if (activeParishId && nextParish.id !== activeParishId) {
        setError(onboardingLoadErrorMessage(null))
        return null
      }
      setParish(nextParish)
      setActiveParishName(nextParish.name)
      setStaffUsers(nextStaff)
      return nextParish
    } catch (err) {
      if (!isLatestLoad()) return null
      if (err instanceof DOMException && err.name === 'AbortError' && !loadTimedOut) return null
      setError(onboardingLoadErrorMessage(err))
      return null
    } finally {
      window.clearTimeout(timeoutId)
      if (isLatestLoad()) setLoading(false)
      if (loadAbortRef.current === controller) loadAbortRef.current = null
    }
  }, [activeParishId])

  useEffect(() => {
    mountedRef.current = true
    void load()
    return () => {
      mountedRef.current = false
      loadSequenceRef.current += 1
      loadAbortRef.current?.abort()
      loadAbortRef.current = null
    }
  }, [load])

  async function markComplete() {
    if (
      completionInFlightRef.current ||
      completionRequiresRefresh ||
      !parish ||
      !readiness.readyToComplete
    ) return

    const completionParishId = parish.id
    if (activeParishId && activeParishId !== completionParishId) {
      setCompletionRequiresRefresh(true)
      setError(ONBOARDING_COMPLETION_REFRESH_REQUIRED_MESSAGE)
      return
    }

    completionInFlightRef.current = true
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const res = await fetch('/api/parish/settings', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(ONBOARDING_COMPLETION_CONFIRMATION_TIMEOUT_MS),
        body: JSON.stringify({
          name: parish.name,
          default_notification_email: parish.default_notification_email ?? '',
          daily_ops_brief_enabled: Boolean(parish.daily_ops_brief_enabled),
          daily_ops_brief_email: parish.daily_ops_brief_email ?? '',
          onboarding_complete: true,
          workflow_sla_rules: parish.workflow_sla_rules,
          staff_names: Array.isArray(parish.staff_names) ? parish.staff_names : [],
          priest_names: Array.isArray(parish.priest_names) ? parish.priest_names : [],
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!mountedRef.current) return
      if (!res.ok) {
        setError(onboardingSaveErrorMessage(data?.error))
        return
      }
      if (!data?.ok) {
        setCompletionRequiresRefresh(true)
        setError(ONBOARDING_COMPLETION_REFRESH_REQUIRED_MESSAGE)
        return
      }
      const refreshedParish = await load()
      if (!mountedRef.current) return
      if (
        !refreshedParish ||
        refreshedParish.id !== completionParishId ||
        !refreshedParish.onboarding_completed_at
      ) {
        setCompletionRequiresRefresh(true)
        setError(ONBOARDING_COMPLETION_REFRESH_REQUIRED_MESSAGE)
        return
      }
      setMessage('Parish onboarding marked complete.')
    } catch {
      if (!mountedRef.current) return
      setCompletionRequiresRefresh(true)
      setError(ONBOARDING_COMPLETION_REFRESH_REQUIRED_MESSAGE)
    } finally {
      completionInFlightRef.current = false
      setSaving(false)
    }
  }

  function preventNavigationWhileSaving(event: React.MouseEvent<HTMLAnchorElement>) {
    if (saving) event.preventDefault()
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Parish setup
        </p>
        <h1 className={`${sectionHeadingClassName} mt-1`}>Onboarding</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
          Finish the essentials that make Vinea ready for daily parish operations.
        </p>
        {activeParishName ? (
          <p className="mt-3 inline-flex rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
            Onboarding is scoped to {activeParishName}.
          </p>
        ) : null}
      </div>

      {loading ? (
        <div className={`flex items-center gap-3 ${vineaSectionShellClassName}`}>
          <span className={vineaSpinnerClassName} aria-hidden />
          <p className="text-sm font-medium text-gray-700">Loading setup checklist...</p>
        </div>
      ) : error && !parish ? (
        <div className={vineaEmptyStateClassName} role="alert">
          <p className="font-semibold text-gray-900">Could not load onboarding</p>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
          <button type="button" onClick={() => void load()} className={`${primaryButtonMd} mt-4`}>
            Try again
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <section className={vineaSectionShellClassName} aria-busy={saving}>
            <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
              <ReadinessRing readiness={readiness} />
              <div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-gray-700" aria-hidden />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-950">
                      {readiness.onboardingComplete
                        ? 'Parish setup is complete'
                        : readiness.readyToComplete
                          ? 'Ready to complete setup'
                          : 'Setup still needs attention'}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                      Vinea uses this checklist to confirm the parish can receive requests,
                      assign work, follow response targets, and review operational history.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    disabled={
                      !readiness.readyToComplete ||
                      readiness.onboardingComplete ||
                      saving ||
                      completionRequiresRefresh
                    }
                    onClick={() => void markComplete()}
                    className={`${primaryButtonMd} justify-center`}
                  >
                    {saving
                      ? 'Saving...'
                      : completionRequiresRefresh
                        ? 'Refresh required'
                        : readiness.onboardingComplete
                          ? 'Setup complete'
                          : 'Mark setup complete'}
                  </button>
                  <Link
                    href="/dashboard/settings"
                    aria-disabled={saving}
                    tabIndex={saving ? -1 : undefined}
                    onClick={preventNavigationWhileSaving}
                    className={`${secondaryButtonMd} justify-center ${saving ? 'pointer-events-none opacity-60' : ''}`}
                  >
                    Open settings
                  </Link>
                </div>
                {message ? <p className="mt-3 text-sm font-medium text-emerald-800">{message}</p> : null}
                {error ? <p className="mt-3 text-sm font-medium text-red-800">{error}</p> : null}
              </div>
            </div>
          </section>

          <section className={vineaSectionShellClassName}>
            <h2 className="text-base font-semibold text-gray-900">Setup steps</h2>
            <div className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
              {readiness.items.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-disabled={saving}
                  tabIndex={saving ? -1 : undefined}
                  onClick={preventNavigationWhileSaving}
                  className={`flex gap-3 px-4 py-4 hover:bg-gray-50 ${saving ? 'pointer-events-none opacity-60' : ''}`}
                >
                  {item.complete ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-950">{item.label}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.detail}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className={vineaSectionShellClassName}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Go-live readiness
                </p>
                <h2 className="mt-1 text-lg font-semibold text-gray-950">
                  {goLiveReadiness.headline}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {goLiveReadiness.summary}
                </p>
              </div>
              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                  goLiveReadiness.status === 'ready_for_supervised_pilot'
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-amber-100 text-amber-950'
                }`}
              >
                {goLiveReadiness.status === 'ready_for_supervised_pilot'
                  ? 'Pilot checklist ready'
                  : 'Setup first'}
              </span>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.25fr]">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-gray-950">Next best steps</h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-gray-700">
                  {goLiveReadiness.nextActions.map((action) => (
                    <li key={action} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-500" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-gray-950">Migration source prep</h3>
                <div className="mt-3 space-y-3">
                  {goLiveReadiness.migrationSources.map((source) => (
                    <div key={source.source} className="rounded-lg bg-slate-50 px-3 py-3">
                      <p className="text-sm font-semibold text-gray-950">{source.source}</p>
                      <p className="mt-1 text-sm leading-relaxed text-gray-700">
                        {source.whatToGather}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-600">
                        {source.caution}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 bg-slate-50/80 p-4">
              <h3 className="text-sm font-semibold text-gray-950">Before real parish use</h3>
              <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-gray-700 sm:grid-cols-2">
                {goLiveReadiness.manualChecks.map((check) => (
                  <li key={check} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                    <span>{check}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className={vineaSectionShellClassName}>
            <h2 className="text-base font-semibold text-gray-900">Pilot readiness checklist</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              Use this as the final pre-launch check before handing Vinea to a real parish office.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {PILOT_ITEMS.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-gray-800"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </main>
  )
}
