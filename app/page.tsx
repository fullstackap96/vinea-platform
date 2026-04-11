import Link from 'next/link'
import {
  PARISH_OPERATIONS_DESCRIPTOR,
  PRODUCT_NAME,
} from '@/lib/productBranding'

/** Replace the address with your sales or pilot inbox before sharing widely. */
const REQUEST_DEMO_MAILTO = `mailto:alex.j.perez@hotmail.com?subject=${encodeURIComponent("Request a Demo — Vinea Platform")}&body=${encodeURIComponent(
  `Hi,
  
  I’m interested in seeing a demo of Vinea Platform.
  
  Parish Name:
  Your Name:
  Best Time to Connect:
  
  Thanks,`
  )}`

export default function Home() {
  return (
    <div className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <Link
            href="/"
            className="text-sm font-semibold text-gray-900 tracking-tight hover:text-gray-700 min-w-0"
          >
            {PRODUCT_NAME}
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-blue-800 underline underline-offset-2 hover:text-blue-900 shrink-0 sm:text-right"
          >
            Staff login
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
              Baptism, funeral, and wedding requests—organized for your parish team.
            </h1>
            <p className="mt-3 text-xl sm:text-2xl font-semibold text-gray-700 tracking-tight leading-snug">
              Parish Operations Simplified
            </p>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-2xl">
              <span className="font-semibold text-gray-900">{PRODUCT_NAME}</span>
              {' is the parish staff hub for '}
              <span className="font-medium text-gray-800">
                {PARISH_OPERATIONS_DESCRIPTOR}
              </span>
              {': one place for intake, follow-up, and sacramental coordination.'}
            </p>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed">
              Families submit online. Staff work from one dashboard: status, checklists,
              communications, AI-assisted drafts, and Google Calendar—without losing the
              pastoral thread.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:flex-wrap">
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full sm:w-auto bg-black text-white px-6 py-3 rounded text-base font-medium hover:bg-gray-800 transition-colors"
              >
                Staff Sign In
              </Link>
              <Link
                href="#intake"
                className="inline-flex items-center justify-center w-full sm:w-auto border border-gray-800 text-gray-900 px-6 py-3 rounded text-base font-medium hover:bg-gray-50 transition-colors"
              >
                Explore Intake Forms
              </Link>
              <a
                href={REQUEST_DEMO_MAILTO}
                className="inline-flex items-center justify-center w-full sm:w-auto border border-gray-800 text-gray-900 px-6 py-3 rounded text-base font-medium hover:bg-gray-50 transition-colors"
              >
                Request a Demo
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-2xl">
              Securely manage parish requests. Submissions are reviewed by parish staff.
            </p>
          </div>
        </section>

        {/* Workflow cards */}
        <section
          id="intake"
          className="border-t bg-white py-16 sm:py-20 scroll-mt-20"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
              Family-facing intake
            </h2>
            <p className="mt-2 text-gray-600 max-w-2xl">
              Share these links with parishioners. Baptism, funeral, and wedding each have
              a dedicated form; every submission creates a structured request your team sees
              on the dashboard.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <WorkflowCard
                title="Baptism requests"
                description="Parents share child details, preferred timing, and notes for preparation."
                href="/baptism-request"
                cta="Open baptism form"
                accent="border-blue-200 bg-blue-50/50"
              />
              <WorkflowCard
                title="Funeral planning"
                description="Families reach out for liturgy planning with clear, compassionate intake fields."
                href="/funeral-request"
                cta="Open funeral form"
                accent="border-slate-200 bg-slate-50/80"
              />
              <WorkflowCard
                title="Wedding preparation"
                description="Couples submit names, proposed dates, and ceremony notes in one place."
                href="/wedding-request"
                cta="Open wedding form"
                accent="border-rose-200 bg-rose-50/50"
              />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-gray-50 py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
              Built for parish staff
            </h2>
            <p className="mt-2 text-gray-600 max-w-2xl">
              Everything ties back to a single request record—so nothing falls through
              the cracks between the front desk and the pastor.
            </p>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
              <FeatureItem
                title="Intake forms"
                body="Structured submissions for baptism, funeral, and wedding—no more scattered emails or sticky notes."
              />
              <FeatureItem
                title="Follow-up queue"
                body="See who needs contact, a confirmed date or time, or checklist items—at a glance."
              />
              <FeatureItem
                title="AI drafting & summaries"
                body="Generate reply drafts and internal summaries to move faster without sounding generic."
              />
              <FeatureItem
                title="Google Calendar sync"
                body="Create and update calendar events from confirmed baptism, funeral, or wedding times."
              />
            </ul>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="border-t bg-white py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center sm:text-left">
            <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
              Ready to see your dashboard?
            </h2>
            <p className="mt-3 text-gray-600 max-w-xl mx-auto sm:mx-0">
              Sign in with your parish staff account to review requests, run follow-ups,
              and keep sacramental care coordinated.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap justify-center sm:justify-start">
              <Link
                href="/login"
                className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded text-base font-medium hover:bg-gray-800 transition-colors"
              >
                Staff Sign In
              </Link>
              <a
                href={REQUEST_DEMO_MAILTO}
                className="inline-flex items-center justify-center border border-gray-800 text-gray-900 px-6 py-3 rounded text-base font-medium hover:bg-gray-50 transition-colors"
              >
                Request a Demo
              </a>
              <Link
                href="/baptism-request"
                className="inline-flex items-center justify-center border border-gray-800 text-gray-900 px-6 py-3 rounded text-base font-medium hover:bg-gray-50 transition-colors"
              >
                Baptism Request
              </Link>
              <Link
                href="/funeral-request"
                className="inline-flex items-center justify-center border border-gray-800 text-gray-900 px-6 py-3 rounded text-base font-medium hover:bg-gray-50 transition-colors"
              >
                Funeral Request
              </Link>
              <Link
                href="/wedding-request"
                className="inline-flex items-center justify-center border border-gray-800 text-gray-900 px-6 py-3 rounded text-base font-medium hover:bg-gray-50 transition-colors"
              >
                Wedding Request
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>{PRODUCT_NAME}</span>
          <Link
            href="/login"
            className="font-medium text-blue-800 underline underline-offset-2 hover:text-blue-900"
          >
            Staff login
          </Link>
        </div>
      </footer>
    </div>
  )
}

function WorkflowCard({
  title,
  description,
  href,
  cta,
  accent,
}: {
  title: string
  description: string
  href: string
  cta: string
  accent: string
}) {
  return (
    <div className={`border rounded-lg p-6 flex flex-col ${accent} shadow-sm`}>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed flex-1">{description}</p>
      <Link
        href={href}
        className="mt-6 inline-flex items-center text-sm font-semibold text-blue-800 underline underline-offset-2 hover:text-blue-900"
      >
        {cta}
      </Link>
    </div>
  )
}

function FeatureItem({ title, body }: { title: string; body: string }) {
  return (
    <li className="border rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{body}</p>
    </li>
  )
}
