'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { setActiveStaffParish } from '@/app/dashboard/parish-context/actions'
import { supabase } from '@/lib/supabase'
import { primaryButtonMd } from '@/lib/buttonStyles'
import {
  dashboardParishSwitcherWarningMessage,
  dashboardShellClientErrorMessage,
} from '@/lib/dashboardShellClientMessages'
import { PRODUCT_NAME } from '@/lib/productBranding'
import { vineaAppCanvasClass } from '@/lib/vineaUi'
import type { ActiveStaffParishSwitcherContext } from '@/lib/server/loadActiveStaffParishSwitcher'
import { DashboardGlobalSearch } from './_components/DashboardGlobalSearch'
import { DashboardNotificationsCenter } from './_components/DashboardNotificationsCenter'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', match: 'exact' as const },
  { href: '/dashboard/onboarding', label: 'Setup', match: 'prefix' as const },
  { href: '/dashboard/calendar', label: 'Calendar', match: 'prefix' as const },
  { href: '/dashboard/intake', label: 'Intake', match: 'prefix' as const },
  { href: '/dashboard/communications', label: 'Communications', match: 'prefix' as const },
  { href: '/dashboard/requests', label: 'Requests', match: 'prefix' as const },
  { href: '/dashboard/records', label: 'Records', match: 'prefix' as const },
  { href: '/dashboard/people', label: 'People', match: 'prefix' as const },
  { href: '/dashboard/imports', label: 'Import', match: 'prefix' as const },
  { href: '/dashboard/intentions', label: 'Mass Intentions', match: 'prefix' as const },
  { href: '/dashboard/reports', label: 'Reports', match: 'prefix' as const },
  { href: '/dashboard/settings', label: 'Parish Settings', match: 'prefix' as const },
  { href: '/dashboard/admin/audit-log', label: 'Audit Log', match: 'prefix' as const, adminOnly: true },
]

function isNavActive(pathname: string, href: string, match: 'exact' | 'prefix') {
  if (match === 'exact') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardLayoutClient({
  showDemoBanner,
  parishSwitcher,
  staffEmail,
  canViewAuditLog,
  children,
}: {
  showDemoBanner: boolean
  parishSwitcher: ActiveStaffParishSwitcherContext
  staffEmail: string
  canViewAuditLog: boolean
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeParishId, setActiveParishId] = useState(
    parishSwitcher.ok ? parishSwitcher.activeParishId : ''
  )
  const [pendingParishId, setPendingParishId] = useState<string | null>(null)
  const [switcherMessage, setSwitcherMessage] = useState<string | null>(
    parishSwitcher.ok
      ? dashboardParishSwitcherWarningMessage(parishSwitcher.warning)
      : dashboardShellClientErrorMessage('parishSwitcher', parishSwitcher.error)
  )
  const [switcherMessageTone, setSwitcherMessageTone] = useState<'muted' | 'success' | 'error'>(
    parishSwitcher.ok ? 'muted' : 'error'
  )
  const [isSwitchingParish, startParishSwitchTransition] = useTransition()
  const parishSwitchInFlightRef = useRef(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const signOutInFlightRef = useRef(false)
  const [logoutMessage, setLogoutMessage] = useState('')
  const parishOptions = useMemo(
    () => (parishSwitcher.ok ? parishSwitcher.parishes : []),
    [parishSwitcher]
  )
  const activeParishName = useMemo(
    () => parishOptions.find((parish) => parish.id === activeParishId)?.name ?? null,
    [activeParishId, parishOptions]
  )
  const selectedParishId = pendingParishId ?? activeParishId
  const parishContextPending = pendingParishId !== null
  const parishSwitchUnavailable =
    isSwitchingParish || isSigningOut || parishOptions.length === 1
  const logoutUnavailable = isSigningOut || parishContextPending || isSwitchingParish

  async function logout() {
    if (signOutInFlightRef.current || parishSwitchInFlightRef.current) return

    signOutInFlightRef.current = true
    setIsSigningOut(true)
    setLogoutMessage('')
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) {
        setLogoutMessage(dashboardShellClientErrorMessage('logout', error))
        return
      }
      router.replace('/login')
      router.refresh()
    } catch (error) {
      setLogoutMessage(dashboardShellClientErrorMessage('logout', error))
    } finally {
      signOutInFlightRef.current = false
      setIsSigningOut(false)
    }
  }

  function handleParishChange(nextParishId: string) {
    const previousActiveParishId = activeParishId
    if (
      parishSwitchInFlightRef.current ||
      signOutInFlightRef.current ||
      !nextParishId ||
      nextParishId === previousActiveParishId
    ) return

    parishSwitchInFlightRef.current = true
    setPendingParishId(nextParishId)
    setSwitcherMessage(null)
    setSwitcherMessageTone('muted')

    startParishSwitchTransition(async () => {
      try {
        const result = await setActiveStaffParish(nextParishId)
        if (result.ok) {
          setActiveParishId(result.activeParishId ?? '')
          setPendingParishId(null)
          setSwitcherMessage('Parish selection saved.')
          setSwitcherMessageTone('success')
          router.refresh()
          return
        }

        setActiveParishId(result.activeParishId ?? previousActiveParishId)
        setPendingParishId(null)
        setSwitcherMessage(dashboardShellClientErrorMessage('parishSwitcher', result.error))
        setSwitcherMessageTone('error')
        router.refresh()
      } catch (error) {
        setActiveParishId(previousActiveParishId)
        setPendingParishId(null)
        setSwitcherMessage(dashboardShellClientErrorMessage('parishSwitcher', error))
        setSwitcherMessageTone('error')
        router.refresh()
      } finally {
        parishSwitchInFlightRef.current = false
      }
    })
  }

  return (
    <div className="min-h-full flex flex-col">
      {showDemoBanner && (
        <div
          role="status"
          className="bg-amber-50 border-b border-amber-200 text-amber-950 text-center text-sm font-medium py-2 px-4 sm:px-6 shrink-0"
        >
          Demo Environment — Sample Data Only
        </div>
      )}
      <header className="border-b border-gray-200 bg-white shrink-0">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Row 1: brand, navigation, account */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">
              <div className="flex items-center justify-between gap-3 lg:shrink-0">
                <Link
                  href="/"
                  className="flex min-w-0 items-center gap-2.5 rounded-md hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 sm:gap-3"
                >
                  <Image
                    src="/vinea-icon.png"
                    alt=""
                    width={40}
                    height={40}
                    className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
                    priority
                  />
                  <span className="truncate text-sm font-semibold tracking-tight text-gray-900 sm:text-base">
                    {PRODUCT_NAME}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  disabled={logoutUnavailable}
                  aria-busy={isSigningOut}
                  className={`${primaryButtonMd} shrink-0 justify-center lg:hidden`}
                >
                  {isSigningOut ? 'Signing out...' : 'Logout'}
                </button>
              </div>

              <nav
                className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium leading-snug lg:min-w-0 lg:flex-1"
                aria-label="Dashboard sections"
              >
                {NAV_ITEMS.filter((item) => !item.adminOnly || canViewAuditLog).map((item) => {
                  const active = isNavActive(pathname, item.href, item.match)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`whitespace-nowrap rounded-md px-1 py-1.5 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${
                        active
                          ? 'font-semibold text-gray-900'
                          : 'text-brand hover:text-brand-foreground'
                      }`}
                      aria-current={active ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="hidden items-center gap-3 lg:flex lg:shrink-0">
                {parishOptions.length > 0 && (
                  <div className="flex max-w-[14rem] flex-col gap-1">
                    <label
                      htmlFor="active-parish"
                      className="text-[0.68rem] font-semibold uppercase tracking-wide text-gray-500"
                    >
                      Parish
                    </label>
                    <select
                      id="active-parish"
                      value={selectedParishId}
                      onChange={(event) => handleParishChange(event.target.value)}
                      disabled={parishSwitchUnavailable}
                      aria-busy={parishContextPending}
                      className="h-9 max-w-full rounded-md border border-gray-300 bg-white px-2 text-sm font-medium text-gray-800 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                      title={
                        parishOptions.length === 1
                          ? 'Only one parish is available for this account.'
                          : 'Choose the parish context for this staff session.'
                      }
                    >
                      {parishOptions.map((parish) => (
                        <option key={parish.id} value={parish.id}>
                          {parish.name ?? 'Unnamed parish'}
                        </option>
                      ))}
                    </select>
                    {switcherMessage && (
                      <p
                        className={`max-w-[14rem] text-xs ${
                          switcherMessageTone === 'error'
                            ? 'text-red-700'
                            : switcherMessageTone === 'success'
                              ? 'text-green-700'
                              : 'text-gray-500'
                        }`}
                        aria-live="polite"
                      >
                        {switcherMessage}
                      </p>
                    )}
                  </div>
                )}
                <span
                  className="max-w-[10rem] truncate text-sm text-gray-600 xl:max-w-[14rem]"
                  title={staffEmail || undefined}
                >
                  {staffEmail ? `Signed in as ${staffEmail}` : 'Signed in'}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  disabled={logoutUnavailable}
                  aria-busy={isSigningOut}
                  className={`${primaryButtonMd} shrink-0 justify-center`}
                >
                  {isSigningOut ? 'Signing out...' : 'Logout'}
                </button>
              </div>
            </div>

            {logoutMessage ? (
              <p
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {logoutMessage}
              </p>
            ) : null}

            {/* Row 2: search and needs attention */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-3">
              {parishOptions.length > 0 && (
                <div className="w-full lg:hidden">
                  <label
                    htmlFor="active-parish-mobile"
                    className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    Parish
                  </label>
                  <select
                    id="active-parish-mobile"
                    value={selectedParishId}
                    onChange={(event) => handleParishChange(event.target.value)}
                    disabled={parishSwitchUnavailable}
                    aria-busy={parishContextPending}
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    {parishOptions.map((parish) => (
                      <option key={parish.id} value={parish.id}>
                        {parish.name ?? 'Unnamed parish'}
                      </option>
                    ))}
                  </select>
                  {switcherMessage && (
                    <p
                      className={`mt-1 text-xs ${
                        switcherMessageTone === 'error'
                          ? 'text-red-700'
                          : switcherMessageTone === 'success'
                            ? 'text-green-700'
                            : 'text-gray-500'
                      }`}
                      aria-live="polite"
                    >
                      {switcherMessage}
                    </p>
                  )}
                </div>
              )}
              {parishContextPending ? (
                <div
                  className="flex min-h-10 w-full items-center justify-center rounded-md border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-950"
                  role="status"
                  aria-live="polite"
                >
                  Updating parish workspace…
                </div>
              ) : (
                <>
                  <div className="min-w-0 w-full flex-1" key={`search-${activeParishId}`}>
                    <DashboardGlobalSearch />
                  </div>
                  <div
                    className="w-full shrink-0 sm:w-auto"
                    key={`notifications-${activeParishId}`}
                  >
                    <DashboardNotificationsCenter activeParishName={activeParishName} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className={`min-h-0 flex-1 ${vineaAppCanvasClass}`}>{children}</div>
    </div>
  )
}
