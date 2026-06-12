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

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', match: 'exact' as const },
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
          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(14rem,20rem)_auto] lg:items-center lg:gap-4">
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 md:gap-4">
              <Link
                href="/"
                className="flex min-w-0 shrink-0 items-center gap-3 rounded-md hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              >
                <Image
                  src="/vinea-icon.png"
                  alt=""
                  width={40}
                  height={40}
                  className="h-8 w-auto shrink-0 object-contain"
                  priority
                />
                <span className="truncate text-sm font-semibold tracking-tight text-gray-900">
                  {PRODUCT_NAME}
                </span>
              </Link>
              <span className="hidden h-4 w-px shrink-0 bg-gray-200 sm:block" aria-hidden />
              <nav
                className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium"
                aria-label="Dashboard sections"
              >
                {NAV_ITEMS.map((item, index) => {
                  const active = isNavActive(pathname, item.href, item.match)
                  return (
                    <span key={item.href} className="inline-flex items-center gap-2">
                      {index > 0 ? (
                        <span className="text-gray-300" aria-hidden>
                          |
                        </span>
                      ) : null}
                      <Link
                        href={item.href}
                        className={
                          active
                            ? 'font-semibold text-gray-900 underline-offset-2 hover:underline'
                            : 'text-brand hover:text-brand-foreground underline-offset-2 hover:underline'
                        }
                        aria-current={active ? 'page' : undefined}
                      >
                        {item.label}
                      </Link>
                    </span>
                  )
                })}
              </nav>
            </div>

            <DashboardGlobalSearch />

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <div className="hidden min-w-0 truncate text-sm text-gray-600 lg:block">
                {email ? `Signed in as ${email}` : 'Signed in'}
              </div>
              <button
                type="button"
                onClick={logout}
                className={`${primaryButtonMd} w-full shrink-0 justify-center sm:w-auto`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className={`min-h-0 flex-1 ${vineaAppCanvasClass}`}>{children}</div>
    </div>
  )
}
