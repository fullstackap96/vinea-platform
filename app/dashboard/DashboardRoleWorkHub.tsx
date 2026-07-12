'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  BookOpenCheck,
  BriefcaseBusiness,
  Church,
  ClipboardList,
  UserRoundCheck,
} from 'lucide-react'
import { RequestTypeBadge } from '@/app/_components/RequestTypeBadge'
import {
  buildDashboardRoleWorkHub,
  type DashboardRoleLensId,
  type DashboardRoleWorkHubLens,
} from '@/lib/dashboardRoleWorkHub'
import { primaryButtonSm, secondaryButtonSm } from '@/lib/buttonStyles'
import { chipBase } from '@/lib/chipStyles'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import type { StaffCommandCenterResult } from '@/lib/staffCommandCenter'
import { vineaEmptyStateClassName, vineaSectionShellClassName } from '@/lib/vineaUi'

type Props = {
  commandCenter: StaffCommandCenterResult
  activeParishId?: string | null
  activeParishName?: string | null
  loading?: boolean
  dataUnavailable?: boolean
}

const ROLE_WORK_HUB_LENS_STORAGE_PREFIX = 'vinea:dashboard-role-work-hub:active-lens'

const ROLE_LENS_IDS = new Set<DashboardRoleLensId>([
  'administrator',
  'receptionist',
  'pastor',
  'ocia',
  'sacramental',
])

function isDashboardRoleLensId(value: string | null): value is DashboardRoleLensId {
  return value !== null && ROLE_LENS_IDS.has(value as DashboardRoleLensId)
}

const LENS_ICONS: Record<DashboardRoleLensId, typeof ClipboardList> = {
  administrator: BriefcaseBusiness,
  receptionist: UserRoundCheck,
  pastor: Church,
  ocia: ClipboardList,
  sacramental: BookOpenCheck,
}

function urgencyTone(urgency: string): string {
  switch (urgency) {
    case 'overdue':
      return 'border-rose-200 bg-rose-50 text-rose-950'
    case 'high':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    case 'medium':
      return 'border-sky-200 bg-sky-50 text-sky-950'
    default:
      return 'border-gray-200 bg-white text-gray-700'
  }
}

function lensAccent(id: DashboardRoleLensId): string {
  switch (id) {
    case 'administrator':
      return 'bg-slate-900 text-white'
    case 'receptionist':
      return 'bg-sky-100 text-sky-950'
    case 'pastor':
      return 'bg-emerald-100 text-emerald-950'
    case 'ocia':
      return 'bg-violet-100 text-violet-950'
    case 'sacramental':
      return 'bg-amber-100 text-amber-950'
  }
}

function LensSummary({ lens }: { lens: DashboardRoleWorkHubLens }) {
  const Icon = LENS_ICONS[lens.id]
  return (
    <div className="rounded-xl border border-gray-200 bg-slate-50/75 px-4 py-4">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${lensAccent(
            lens.id
          )}`}
          aria-hidden
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-snug text-gray-950">
            {lens.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">{lens.description}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-gray-200 bg-white px-2 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Open</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-gray-950">
            {lens.totalCount}
          </p>
        </div>
        <div className="rounded-lg border border-rose-100 bg-rose-50 px-2 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
            Now
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums text-rose-950">
            {lens.actNowCount}
          </p>
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50 px-2 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Blocked
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums text-amber-950">
            {lens.blockedCount}
          </p>
        </div>
      </div>
    </div>
  )
}

export function DashboardRoleWorkHub({
  commandCenter,
  activeParishId = null,
  activeParishName = null,
  loading = false,
  dataUnavailable = false,
}: Props) {
  const roleHub = useMemo(
    () => buildDashboardRoleWorkHub(commandCenter, { limitPerLens: 4 }),
    [commandCenter]
  )
  const [activeLensId, setActiveLensId] = useState<DashboardRoleLensId>(
    roleHub.defaultLensId
  )
  const lensStorageKey = `${ROLE_WORK_HUB_LENS_STORAGE_PREFIX}:${
    activeParishId ?? 'legacy'
  }`

  useEffect(() => {
    let cancelled = false
    let nextLensId = roleHub.defaultLensId
    try {
      const storedLensId = window.localStorage.getItem(lensStorageKey)
      if (
        isDashboardRoleLensId(storedLensId) &&
        roleHub.lenses.some((lens) => lens.id === storedLensId)
      ) {
        nextLensId = storedLensId
      }
    } catch {
      nextLensId = roleHub.defaultLensId
    }

    queueMicrotask(() => {
      if (cancelled) return
      setActiveLensId((currentLensId) =>
        currentLensId === nextLensId ? currentLensId : nextLensId
      )
    })

    return () => {
      cancelled = true
    }
  }, [lensStorageKey, roleHub.defaultLensId, roleHub.lenses])

  function handleLensSelect(lensId: DashboardRoleLensId) {
    setActiveLensId(lensId)
    try {
      window.localStorage.setItem(lensStorageKey, lensId)
    } catch {
      // Browser storage can be unavailable in privacy modes; the tab still changes normally.
    }
  }

  const activeLens =
    roleHub.lenses.find((lens) => lens.id === activeLensId) ?? roleHub.lenses[0]

  return (
    <section
      className={vineaSectionShellClassName}
      aria-labelledby="role-work-hub-heading"
      aria-busy={loading}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Role work hub
          </p>
          <h2 id="role-work-hub-heading" className={`${sectionHeadingClassName} mt-1`}>
            See the day by role
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            Switch lenses to see the same parish work prioritized for each staff role.
          </p>
          {activeParishName ? (
            <p className="mt-2 inline-flex max-w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm">
              <span className="truncate">
                Role work hub is scoped to{' '}
                <span className="font-semibold text-gray-900">{activeParishName}</span>.
              </span>
            </p>
          ) : null}
        </div>
        {!loading && !dataUnavailable ? (
          <Link href="/dashboard/requests" className={`${secondaryButtonSm} justify-center`}>
            Open full queue
          </Link>
        ) : null}
      </div>

      {loading ? (
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading role work hub"
          className="mt-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-11 animate-pulse rounded-xl border border-gray-200 bg-gray-100"
              />
            ))}
          </div>
          <div className="h-48 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
        </div>
      ) : dataUnavailable ? (
        <div className={vineaEmptyStateClassName} role="alert">
          <p className="text-base font-semibold text-gray-900">Role hub is unavailable.</p>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
            It will appear after request data loads successfully.
          </p>
        </div>
      ) : (
        <>
          <div
            className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5"
            role="tablist"
            aria-label="Dashboard role lenses"
          >
            {roleHub.lenses.map((lens) => {
              const selected = lens.id === activeLens.id
              return (
                <button
                  key={lens.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="role-work-hub-panel"
                  onClick={() => handleLensSelect(lens.id)}
                  className={`min-h-11 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 ${
                    selected
                      ? 'border-brand bg-brand text-white shadow-sm'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="block truncate">{lens.shortLabel}</span>
                  <span
                    className={`mt-0.5 block text-xs font-medium ${
                      selected ? 'text-white/80' : 'text-gray-500'
                    }`}
                  >
                    {lens.totalCount} open
                  </span>
                </button>
              )
            })}
          </div>

          <div id="role-work-hub-panel" role="tabpanel" className="mt-4">
            <LensSummary lens={activeLens} />

            {activeLens.items.length === 0 ? (
              <div className={`${vineaEmptyStateClassName} mt-4`} role="status">
                <p className="text-base font-semibold text-gray-900">
                  {activeLens.emptyTitle}
                </p>
                <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
                  {activeLens.emptyBody}
                </p>
              </div>
            ) : (
              <ol className="mt-4 space-y-3">
                {activeLens.items.map((item) => (
                  <li key={`${activeLens.id}-${item.requestId}`}>
                    <Link
                      href={item.detailHref}
                      className="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-gray-300 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <RequestTypeBadge requestType={item.requestType} />
                          <span className={`${chipBase} ${urgencyTone(item.urgency)}`}>
                            {item.signalLabel}
                          </span>
                          <span className={`${chipBase} border-gray-200 bg-white text-gray-700`}>
                            {item.ownerLabel}
                          </span>
                        </span>
                        <span className="mt-2 block text-sm font-semibold leading-snug text-gray-950">
                          {item.personLabel}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-gray-600">
                          {item.reason}
                        </span>
                      </span>
                      <span className={`${primaryButtonSm} shrink-0 justify-center`}>
                        {item.actionLabel}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}
    </section>
  )
}
