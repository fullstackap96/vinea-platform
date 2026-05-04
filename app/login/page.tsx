'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { primaryButtonLg } from '@/lib/buttonStyles'
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
    const raw = searchParams.get('next')
    if (!raw) return '/dashboard'
    if (!raw.startsWith('/')) return '/dashboard'
    if (raw.startsWith('//')) return '/dashboard'
    return raw
  }, [searchParams])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function redirectIfAuthed() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!cancelled && user) {
        router.replace(nextPath)
      }
    }

    redirectIfAuthed()

    return () => {
      cancelled = true
    }
  }, [router, nextPath])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage(error.message)
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

            <form onSubmit={onSubmit} className="space-y-4">
              <input
                className={vineaInputFieldClassName}
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <input
                className={vineaInputFieldClassName}
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              <button type="submit" disabled={loading} className={primaryButtonLg}>
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

