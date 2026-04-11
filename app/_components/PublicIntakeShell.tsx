'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { PRODUCT_NAME } from '@/lib/productBranding'

export function PublicIntakeShell({
  title,
  description,
  children,
}: {
  title: string
  description?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans">
      <header className="border-b border-gray-200 bg-white shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <Link
            href="/"
            className="text-sm font-semibold text-gray-900 tracking-tight hover:text-gray-700 min-w-0"
          >
            {PRODUCT_NAME}
          </Link>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm shrink-0 sm:justify-end">
            <Link
              href="/"
              className="font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900"
            >
              Home
            </Link>
            <Link
              href="/login"
              className="font-medium text-blue-800 underline underline-offset-2 hover:text-blue-900"
            >
              Staff login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-10">
        <div className="max-w-2xl mx-auto w-full bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
            {title}
          </h1>
          {description ? (
            <div className="mt-3 text-sm text-gray-600 leading-relaxed">
              {description}
            </div>
          ) : null}
          <div className="mt-8">{children}</div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white mt-auto py-6 shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-xs text-gray-500 leading-relaxed">
          <span className="font-medium text-gray-600">{PRODUCT_NAME}</span>
          <span className="block mt-1">
            Secure intake for your parish. Your request is shared only with parish staff.
          </span>
        </div>
      </footer>
    </div>
  )
}
