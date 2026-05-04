'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { PRODUCT_NAME } from '@/lib/productBranding'
import { vineaAppCanvasClass } from '@/lib/vineaUi'

const showDemoBanner = process.env.NEXT_PUBLIC_DEMO_SITE === '1'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
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
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-2 min-w-0 sm:flex-row sm:items-center sm:gap-3 md:gap-4 sm:flex-1">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 hover:opacity-90 min-w-0"
            >
              <Image
                src="/vinea-icon.png"
                alt=""
                width={40}
                height={40}
                className="h-8 w-auto object-contain shrink-0"
                priority
              />
              <span className="text-sm font-semibold text-gray-900 tracking-tight truncate">
                {PRODUCT_NAME}
              </span>
            </Link>
            <span
              className="hidden sm:block h-4 w-px bg-gray-200 shrink-0"
              aria-hidden
            />
            <nav
              className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-gray-700"
              aria-label="Dashboard sections"
            >
              <Link href="/dashboard" className="text-brand hover:text-brand-foreground underline-offset-2 hover:underline">
                Dashboard
              </Link>
              <span className="text-gray-300" aria-hidden>
                |
              </span>
              <Link
                href="/dashboard/settings"
                className="text-brand hover:text-brand-foreground underline-offset-2 hover:underline"
              >
                Parish settings
              </Link>
            </nav>
            <span
              className="hidden md:block h-4 w-px bg-gray-200 shrink-0"
              aria-hidden
            />
            <div className="text-sm text-gray-600 break-words sm:truncate min-w-0">
              {email ? `Signed in as ${email}` : 'Signed in'}
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className={`${primaryButtonMd} w-full sm:w-auto shrink-0 justify-center`}
          >
            Logout
          </button>
        </div>
      </header>

      <div className={`min-h-0 flex-1 ${vineaAppCanvasClass}`}>{children}</div>
    </div>
  )
}

