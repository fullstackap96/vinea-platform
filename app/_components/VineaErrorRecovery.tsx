'use client'

import Link from 'next/link'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'

type VineaErrorRecoveryProps = {
  scope?: 'page' | 'application' | 'dashboard'
  unstable_retry: () => void
}

export default function VineaErrorRecovery({
  scope = 'page',
  unstable_retry,
}: VineaErrorRecoveryProps) {
  const isDashboard = scope === 'dashboard'
  const heading =
    scope === 'application'
      ? 'Vinea could not finish opening'
      : isDashboard
        ? 'This parish workspace could not finish loading'
        : 'This page could not finish loading'
  const returnHref = isDashboard ? '/dashboard' : '/'
  const returnLabel = isDashboard ? 'Daily Work Hub' : 'Return to Vinea home'

  return (
    <main className="flex min-h-[60vh] w-full items-center justify-center px-4 py-12">
      <section
        aria-labelledby="vinea-error-heading"
        className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        role="alert"
      >
        <p className="text-sm font-semibold text-brand">Vinea Platform</p>
        <h1
          className="mt-2 text-2xl font-semibold text-gray-950"
          id="vinea-error-heading"
        >
          {heading}
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Please try again. If the problem continues, return to {isDashboard ? 'the dashboard' : 'Vinea'}
          {' '}and contact your support person with a short description of what you were doing.
        </p>
        <p className="mt-3 text-sm font-medium leading-6 text-gray-800">
          Before repeating a recent save or send, confirm whether it already completed.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className={primaryButtonMd}
            onClick={unstable_retry}
            type="button"
          >
            Try again
          </button>
          <Link
            className={secondaryButtonMd}
            href={returnHref}
          >
            {returnLabel}
          </Link>
        </div>
      </section>
    </main>
  )
}
