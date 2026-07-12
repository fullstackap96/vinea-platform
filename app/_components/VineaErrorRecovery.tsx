'use client'

import Link from 'next/link'

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
  const returnLabel = isDashboard ? 'Return to dashboard' : 'Return to Vinea home'

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

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
            onClick={unstable_retry}
            type="button"
          >
            Try again
          </button>
          <Link
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
            href={returnHref}
          >
            {returnLabel}
          </Link>
        </div>
      </section>
    </main>
  )
}
