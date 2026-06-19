'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { PRODUCT_NAME } from '@/lib/productBranding'
import { vineaAppCanvasClass } from '@/lib/vineaUi'
import { DashboardGlobalSearch } from './_components/DashboardGlobalSearch'
import { DashboardNotificationsCenter } from './_components/DashboardNotificationsCenter'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', match: 'exact' as const },
  { href: '/dashboard/calendar', label: 'Calendar', match: 'prefix' as const },
  { href: '/dashboard/intake', label: 'Intake', match: 'prefix' as const },
  { href: '/dashboard/requests', label: 'Requests', match: 'prefix' as const },
  { href: '/dashboard/records', label: 'Records', match: 'prefix' as const },
  { href: '/dashboard/people', label: 'People', match: 'prefix' as const },
  { href: '/dashboard/intentions', label: 'Mass Intentions', match: 'prefix' as const },
  { href: '/dashboard/reports', label: 'Reports', match: 'prefix' as const },
  { href: '/dashboard/settings', label: 'Parish Settings', match: 'prefix' as const },
]

function isNavActive(pathname: string, href: string, match: 'exact' | 'prefix') {
  if (match === 'exact') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardLayoutClient({
  showDemoBanner,
  children,
}: {
  showDemoBanner: boolean
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [email, setEmail] = useState<string>('')

  useEffect(() => {
    let cancelled = false

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (cancelled) return
      setEmail(user?.email ?? '')
    }

    loadUser()

    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })

    return () => {
      cancelled = true
      subscription.subscription.unsubscribe()
    }
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/login')
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
                  className={`${primaryButtonMd} shrink-0 justify-center lg:hidden`}
                >
                  Logout
                </button>
              </div>

              <nav
                className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium leading-snug lg:min-w-0 lg:flex-1"
                aria-label="Dashboard sections"
              >
                {NAV_ITEMS.map((item) => {
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
                <span
                  className="max-w-[10rem] truncate text-sm text-gray-600 xl:max-w-[14rem]"
                  title={email || undefined}
                >
                  {email ? `Signed in as ${email}` : 'Signed in'}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className={`${primaryButtonMd} shrink-0 justify-center`}
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Row 2: search and needs attention */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-3">
              <div className="min-w-0 w-full flex-1">
                <DashboardGlobalSearch />
              </div>
              <div className="w-full shrink-0 sm:w-auto">
                <DashboardNotificationsCenter />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={`min-h-0 flex-1 ${vineaAppCanvasClass}`}>{children}</div>
    </div>
  )
}
