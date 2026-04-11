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

function LoginShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      <header className="border-b border-gray-200 bg-white shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
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
          <main className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-8 sm:py-12">
            <div className="w-full max-w-md mx-auto text-center text-sm text-gray-500">
              Loading…
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
      <main className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
            <Link
              href="/"
              className="mb-5 inline-flex max-w-full rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              <Image
                src="/vinea-logo-v2.png"
                alt={PRODUCT_NAME}
                width={200}
                height={56}
                className="h-auto w-[88px] object-contain sm:w-24"
                priority
              />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              Staff login
            </h1>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Sign in to <span className="font-medium text-gray-900">{PRODUCT_NAME}</span>
              .
              <span className="block mt-2 text-xs text-gray-500">
                {PARISH_OPERATIONS_DESCRIPTOR}: baptism, funeral & wedding tools for parish
                staff.
              </span>
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              <input
                className="w-full border border-gray-300 rounded-md bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <input
                className="w-full border border-gray-300 rounded-md bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
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

