'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { PRODUCT_NAME } from '@/lib/productBranding'

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex flex-col gap-2 min-w-0 sm:flex-row sm:items-center sm:gap-3 md:gap-4 sm:flex-1">
            <Link
              href="/"
              className="flex shrink-0 items-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 hover:opacity-90"
            >
              <Image
                src="/vinea-logo.png"
                alt={PRODUCT_NAME}
                width={140}
                height={40}
                className="h-9 w-auto max-h-9 object-contain"
              />
            </Link>
            <span
              className="hidden sm:block h-4 w-px bg-gray-200 shrink-0"
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

      <div className="flex-1 bg-gray-50 min-h-0">{children}</div>
    </div>
  )
}

