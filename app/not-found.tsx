import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] w-full items-center justify-center px-4 py-12">
      <section
        aria-labelledby="vinea-not-found-heading"
        className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <p className="text-sm font-semibold text-brand">Vinea Platform</p>
        <h1
          className="mt-2 text-2xl font-semibold text-gray-950"
          id="vinea-not-found-heading"
        >
          We could not find that page
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          The link may be old or the page may have moved. Return to Vinea or sign in again
          to continue your parish work.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
            href="/"
          >
            Return to Vinea home
          </Link>
          <Link
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
            href="/login"
          >
            Staff sign in
          </Link>
        </div>
      </section>
    </main>
  )
}
