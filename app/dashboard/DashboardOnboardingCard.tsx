'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { primaryButtonMd, secondaryButtonSm } from '@/lib/buttonStyles'
import { buildParishOnboardingReadiness } from '@/lib/parishOnboardingReadiness'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

type ParishPayload = Parameters<typeof buildParishOnboardingReadiness>[0]['parish']
type StaffPayload = Parameters<typeof buildParishOnboardingReadiness>[0]['staffUsers']

export function DashboardOnboardingCard() {
  const [parish, setParish] = useState<ParishPayload>(null)
  const [staffUsers, setStaffUsers] = useState<StaffPayload>([])
  const [loading, setLoading] = useState(true)
  const [hidden, setHidden] = useState(false)

  const readiness = useMemo(
    () => buildParishOnboardingReadiness({ parish, staffUsers }),
    [parish, staffUsers]
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [settingsRes, staffRes] = await Promise.all([
        fetch('/api/parish/settings', { credentials: 'include' }),
        fetch('/api/parish/staff-users', { credentials: 'include' }),
      ])
      const settingsData = await settingsRes.json().catch(() => ({}))
      const staffData = await staffRes.json().catch(() => ({}))
      if (settingsRes.ok && settingsData?.ok) {
        setParish(settingsData.parish ?? null)
      }
      if (staffRes.ok && staffData?.ok && Array.isArray(staffData.staff)) {
        setStaffUsers(staffData.staff)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (hidden || readiness.onboardingComplete) return null

  const remaining = readiness.items.filter((item) => !item.complete).slice(0, 3)

  return (
    <section className={vineaSectionShellClassName} aria-busy={loading}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Parish setup
          </p>
          <h2 className="mt-1 text-lg font-semibold text-gray-950">
            Finish setup before daily use
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            {loading
              ? 'Checking parish readiness...'
              : `${readiness.completedCount} of ${readiness.totalCount} setup items are complete.`}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link href="/dashboard/onboarding" className={`${primaryButtonMd} justify-center`}>
            Finish parish setup
          </Link>
          <button
            type="button"
            onClick={() => setHidden(true)}
            className={`${secondaryButtonSm} justify-center`}
          >
            Hide for now
          </button>
        </div>
      </div>

      {!loading ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {(remaining.length > 0 ? remaining : readiness.items.slice(0, 3)).map((item) => (
            <div
              key={item.key}
              className={`rounded-lg border px-3 py-3 text-sm ${
                item.complete
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                  : 'border-amber-200 bg-amber-50 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {item.complete ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : null}
                {item.label}
              </div>
              <p className="mt-1 text-xs leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
