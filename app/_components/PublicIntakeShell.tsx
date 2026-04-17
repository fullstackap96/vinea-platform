'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LEGAL_ENTITY_FOOTER_LINE, PRODUCT_NAME } from '@/lib/productBranding'

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
            className="flex min-w-0 shrink-0 items-center gap-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 hover:opacity-90"
          >
            <Image
              src="/vinea-icon.png"
              alt=""
              width={44}
              height={44}
              className="h-10 w-auto object-contain shrink-0"
              priority
            />
            <span className="text-sm sm:text-base font-semibold text-gray-900 tracking-tight truncate">
              {PRODUCT_NAME}
            </span>
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

      <main className="flex-1 px-4 sm:px-6 py-7 sm:py-9">
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

      <footer className="border-t border-gray-200 bg-white mt-auto py-7 shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-left text-xs text-gray-500 leading-relaxed">
          <span className="font-medium text-gray-600">{LEGAL_ENTITY_FOOTER_LINE}</span>
          <span className="block mt-1">
            Secure intake for your parish. Your request is shared only with parish staff.
          </span>
        </div>
      </footer>
    </div>
  )
}
