'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, ShieldCheck } from 'lucide-react'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import { buildParishOnboardingReadiness, type ParishReadinessResult } from '@/lib/parishOnboardingReadiness'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import {
  vineaEmptyStateClassName,
  vineaSectionShellClassName,
  vineaSpinnerClassName,
} from '@/lib/vineaUi'

type ParishPayload = {
  id: string
  name: string
  default_notification_email?: string | null
  daily_ops_brief_enabled?: boolean | null
  daily_ops_brief_email?: string | null
  onboarding_completed_at?: string | null
  workflow_sla_rules?: unknown
  staff_names?: string[]
  priest_names?: string[]
}

const PILOT_ITEMS = [
  'First admin staff user is seeded',
  'Public request forms create new requests',
  'Email sending is configured',
  'Daily brief recipient is configured',
  'Staff can see new requests in the dashboard',
  'Audit log shows settings and request activity',
]

function messageFromUnknown(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

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

export function ParishOnboardingPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [parish, setParish] = useState<ParishPayload | null>(null)
  const [staffUsers, setStaffUsers] = useState<Array<{ role?: unknown; active?: unknown }>>([])

  const readiness = useMemo(
    () => buildParishOnboardingReadiness({ parish, staffUsers }),
    [parish, staffUsers]
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [settingsRes, staffRes] = await Promise.all([
        fetch('/api/parish/settings', { credentials: 'include' }),
        fetch('/api/parish/staff-users', { credentials: 'include' }),
      ])
      const settingsData = await settingsRes.json().catch(() => ({}))
      const staffData = await staffRes.json().catch(() => ({}))

      if (!settingsRes.ok || !settingsData?.ok) {
        setError(String(settingsData?.error || 'Could not load parish setup.'))
        return
      }
      setParish(settingsData.parish as ParishPayload)
      setStaffUsers(staffRes.ok && staffData?.ok && Array.isArray(staffData.staff) ? staffData.staff : [])
    } catch (err) {
      setError(messageFromUnknown(err, 'Could not load parish setup.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function markComplete() {
    if (!parish || !readiness.readyToComplete) return
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const res = await fetch('/api/parish/settings', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
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
      if (!res.ok || !data?.ok) {
        setError(String(data?.error || 'Could not mark onboarding complete.'))
        return
      }
      setMessage('Parish onboarding marked complete.')
      await load()
    } catch (err) {
      setError(messageFromUnknown(err, 'Could not mark onboarding complete.'))
    } finally {
      setSaving(false)
    }
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
          <section className={vineaSectionShellClassName}>
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
                    disabled={!readiness.readyToComplete || readiness.onboardingComplete || saving}
                    onClick={() => void markComplete()}
                    className={`${primaryButtonMd} justify-center`}
                  >
                    {saving ? 'Saving...' : readiness.onboardingComplete ? 'Setup complete' : 'Mark setup complete'}
                  </button>
                  <Link href="/dashboard/settings" className={`${secondaryButtonMd} justify-center`}>
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
                  className="flex gap-3 px-4 py-4 hover:bg-gray-50"
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
