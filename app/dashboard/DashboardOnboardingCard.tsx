'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { primaryButtonMd, secondaryButtonSm } from '@/lib/buttonStyles'
import {
  parseOnboardingSettingsResponse,
  parseOnboardingStaffResponse,
} from '@/lib/onboardingReadModel'
import { buildParishOnboardingReadiness } from '@/lib/parishOnboardingReadiness'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

type ParishPayload = Parameters<typeof buildParishOnboardingReadiness>[0]['parish']
type StaffPayload = Parameters<typeof buildParishOnboardingReadiness>[0]['staffUsers']
const ONBOARDING_READINESS_LOAD_TIMEOUT_MS = 15_000

export function DashboardOnboardingCard() {
  const [parish, setParish] = useState<ParishPayload>(null)
  const [staffUsers, setStaffUsers] = useState<StaffPayload>([])
  const [activeParishName, setActiveParishName] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [hidden, setHidden] = useState(false)
  const loadSequenceRef = useRef(0)
  const loadAbortRef = useRef<AbortController | null>(null)

  const readiness = useMemo(
    () => buildParishOnboardingReadiness({ parish, staffUsers }),
    [parish, staffUsers]
  )

  const load = useCallback(async () => {
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
    setLoadFailed(false)
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
      if (!isLatestLoad()) return
      const nextParish = settingsRes.ok ? parseOnboardingSettingsResponse(settingsData) : null
      const nextStaff = staffRes.ok ? parseOnboardingStaffResponse(staffData) : null
      if (!nextParish || !nextStaff) {
        setLoadFailed(true)
        return
      }
      setParish(nextParish)
      setActiveParishName(nextParish.name)
      setStaffUsers(nextStaff)
    } catch (error: unknown) {
      if (!isLatestLoad()) return
      if (error instanceof DOMException && error.name === 'AbortError' && !loadTimedOut) return
      setLoadFailed(true)
    } finally {
      window.clearTimeout(timeoutId)
      if (isLatestLoad()) setLoading(false)
      if (loadAbortRef.current === controller) loadAbortRef.current = null
    }
  }, [])

  useEffect(() => {
    void load()
    return () => {
      loadSequenceRef.current += 1
      loadAbortRef.current?.abort()
      loadAbortRef.current = null
    }
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
              : loadFailed
                ? 'Setup status is temporarily unavailable. Open Onboarding to try again.'
              : `${readiness.completedCount} of ${readiness.totalCount} setup items are complete.`}
          </p>
          {activeParishName ? (
            <p className="mt-2 text-xs font-semibold text-gray-600">
              Setup is scoped to {activeParishName}.
            </p>
          ) : null}
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

      {!loading && !loadFailed ? (
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
