'use client'

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import { primaryButtonLg } from '@/lib/buttonStyles'
import { withClientOperationDeadline } from '@/lib/clientOperationDeadline'
import { safeStaffLoginErrorMessage } from '@/lib/loginAuthMessages'
import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'
import {
  PARISH_OPERATIONS_DESCRIPTOR,
  PRODUCT_NAME,
} from '@/lib/productBranding'
import {
  vineaAppCanvasClass,
  vineaInputFieldClassName,
  vineaSectionShellClassName,
  vineaSpinnerClassName,
} from '@/lib/vineaUi'

function LoginShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={`flex min-h-full flex-col ${vineaAppCanvasClass}`}>
      <header className="border-b border-gray-200 bg-white shrink-0">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
          <Link
            href="/"
            className="text-sm font-semibold text-gray-900 tracking-tight hover:text-gray-700 min-w-0"
          >
            {PRODUCT_NAME}
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-blue-800 underline underline-offset-2 hover:text-blue-900 shrink-0 sm:text-right"
          >
            Back to home
          </Link>
        </div>
      </header>
      {children}
    </div>
  )
}

const subscribeToHydration = () => () => {}
const STAFF_SIGN_IN_CONFIRMATION_TIMEOUT_MS = 30_000

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <LoginShell>
          <main className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
            <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 text-center">
              <span className={vineaSpinnerClassName} aria-hidden />
              <p className="text-base font-medium text-gray-700">Loading…</p>
            </div>
          </main>
        </LoginShell>
      }
    >
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const nextPath = useMemo(() => {
    return safeDashboardHrefOrFallback(searchParams.get('next'), '/dashboard')
  }, [searchParams])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const formReady = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  )
  const signInInFlightRef = useRef(false)
  const [errorMessage, setErrorMessage] = useState(() => {
    if (searchParams.get('staff') === 'unauthorized') {
      return 'Your account is signed in, but it is not authorized for staff access. Ask a parish administrator to add your email to Vinea staff access.'
    }

    return ''
  })

  useEffect(() => {
    let cancelled = false

    async function redirectIfAuthed() {
      try {
        const supabase = getSupabaseBrowserClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!cancelled && user) {
          router.replace(nextPath)
        }
      } catch {
        // Keep the sign-in form available when the optional existing-session probe fails.
      }
    }

    void redirectIfAuthed()

    return () => {
      cancelled = true
    }
  }, [router, nextPath])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (signInInFlightRef.current) return

    signInInFlightRef.current = true
    setLoading(true)
    setErrorMessage('')

    let error: unknown = null

    try {
      const supabase = getSupabaseBrowserClient()
      const result = await withClientOperationDeadline(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        STAFF_SIGN_IN_CONFIRMATION_TIMEOUT_MS,
      )
      error = result.error
    } catch (err) {
      error = err
    }

    if (error) {
      setErrorMessage(safeStaffLoginErrorMessage(error))
      signInInFlightRef.current = false
      setLoading(false)
      return
    }

    router.replace(nextPath)
  }

  return (
    <LoginShell>
      <main className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto w-full max-w-md">
          <div className={vineaSectionShellClassName}>
            <Link
              href="/"
              className="mb-5 inline-flex max-w-full rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              <Image
                src="/vinea-logo.png"
                alt={PRODUCT_NAME}
                width={200}
                height={56}
                className="h-auto w-[88px] object-contain sm:w-24"
                priority
              />
            </Link>
            <h1 className="mb-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              Staff login
            </h1>
            <p className="mb-6 text-base leading-relaxed text-gray-600">
              Sign in to <span className="font-medium text-gray-900">{PRODUCT_NAME}</span>
              .
              <span className="mt-2 block text-sm text-gray-500">
                {PARISH_OPERATIONS_DESCRIPTOR}: baptism, funeral & wedding tools for parish
                staff.
              </span>
            </p>

            <form
              onSubmit={onSubmit}
              method="post"
              className="space-y-4"
              aria-label="Staff sign in"
              aria-busy={loading}
            >
              <div className="space-y-1.5">
                <label htmlFor="staff-email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="staff-email"
                  name="email"
                  className={vineaInputFieldClassName}
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="staff-password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="staff-password"
                  name="password"
                  className={vineaInputFieldClassName}
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={!formReady || loading}
                className={primaryButtonLg}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            {errorMessage && (
              <p className="mt-4 text-sm text-red-700" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </main>
    </LoginShell>
  )
}

