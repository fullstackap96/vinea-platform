import Image from 'next/image'
import Link from 'next/link'
import {
  LEGAL_ENTITY_FOOTER_LINE,
  PARISH_OPERATIONS_DESCRIPTOR,
  PRODUCT_NAME,
} from '@/lib/productBranding'
import { primaryButtonLanding, secondaryButtonLanding } from '@/lib/buttonStyles'
import { sectionHeadingClassName } from '@/lib/sectionHeader'

export default function Home() {
  return (
    <div className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 min-w-0 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 hover:opacity-90"
          >
            <Image
              src="/vinea-icon.png"
              alt=""
              width={40}
              height={40}
              className="h-8 w-auto object-contain shrink-0"
              priority
            />
            <span className="text-sm font-semibold text-gray-900 tracking-tight truncate">
              {PRODUCT_NAME}
            </span>
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
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-14 sm:pt-18 sm:pb-22">
          <div className="max-w-2xl">
            <Link
              href="/"
              className="block w-fit max-w-full rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              <Image
                src="/vinea-logo.png"
                alt={PRODUCT_NAME}
                width={900}
                height={360}
                className="h-44 w-auto mx-auto mb-6 object-contain sm:h-52 lg:h-56"
                priority
                unoptimized
              />
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
              Baptism, funeral, wedding, and OCIA requests—organized for your parish team.
            </h1>
            <p className="mt-2 text-xl sm:text-2xl font-semibold text-gray-700 tracking-tight leading-snug">
              Parish Operations Simplified
            </p>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-2xl">
              <span className="font-semibold text-gray-900">{PRODUCT_NAME}</span>
              {' is the parish staff hub for '}
              <span className="font-medium text-gray-800">
                {PARISH_OPERATIONS_DESCRIPTOR}
              </span>
              {': one place for intake, follow-up, and sacramental coordination.'}
            </p>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Families submit online. Staff work from one dashboard: status, checklists,
              communications, AI-assisted drafts, and Google Calendar—without losing the
              pastoral thread.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:flex-wrap">
              <Link href="/login" className={primaryButtonLanding}>
                Staff Sign In
              </Link>
              <Link href="#intake" className={secondaryButtonLanding}>
                View Request Forms
              </Link>
            </div>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-2xl">
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
            <h2 className={sectionHeadingClassName}>Family-facing intake</h2>
            <p className="text-gray-600 max-w-2xl">
              Share these links with parishioners. Each sacramental path has a dedicated form;
              every submission creates a structured request your team sees on the dashboard.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <WorkflowCard
                title="Baptism requests"
                description="Parents share child details, preferred timing, and notes for preparation."
                href="/baptism-request"
                cta="Open form →"
                accent="border-blue-200 bg-blue-50/50"
              />
              <WorkflowCard
                title="Funeral planning"
                description="Families reach out for liturgy planning with clear, compassionate intake fields."
                href="/funeral-request"
                cta="Open form →"
                accent="border-slate-200 bg-slate-50/80"
              />
              <WorkflowCard
                title="Wedding preparation"
                description="Couples submit names, proposed dates, and ceremony notes in one place."
                href="/wedding-request"
                cta="Open form →"
                accent="border-rose-200 bg-rose-50/50"
              />
              <WorkflowCard
                title="OCIA (RCIA) inquiry"
                description="Inquirers share their background, what they are seeking, and how to reach them."
                href="/ocia-request"
                cta="Open form →"
                accent="border-emerald-200 bg-emerald-50/50"
              />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-gray-50 py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className={sectionHeadingClassName}>Built for parish staff</h2>
            <p className="text-gray-600 max-w-2xl">
              Everything ties back to a single request record—so nothing falls through
              the cracks between the front desk and the pastor.
            </p>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2">
              <FeatureItem
                title="Intake forms"
                body="Structured submissions for baptism, funeral, wedding, and OCIA—no more scattered emails or sticky notes."
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
            <h2 className={sectionHeadingClassName}>Ready to see your dashboard?</h2>
            <p className="mx-auto max-w-xl text-gray-600 sm:mx-0">
              Sign in with your parish staff account to review requests, run follow-ups,
              and keep sacramental care coordinated.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap justify-center sm:justify-start">
              <Link href="/login" className={primaryButtonLanding}>
                Staff Sign In
              </Link>
              <Link href="/baptism-request" className={secondaryButtonLanding}>
                Baptism Request
              </Link>
              <Link href="/funeral-request" className={secondaryButtonLanding}>
                Funeral Request
              </Link>
              <Link href="/wedding-request" className={secondaryButtonLanding}>
                Wedding Request
              </Link>
              <Link href="/ocia-request" className={secondaryButtonLanding}>
                OCIA Request
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>{LEGAL_ENTITY_FOOTER_LINE}</span>
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
    <div
      className={`group border rounded-lg p-6 flex flex-col ${accent} shadow-sm transition-shadow transition-colors hover:shadow-md hover:border-gray-300`}
    >
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed flex-1">{description}</p>
      <Link
        href={href}
        className="mt-6 inline-flex items-center text-sm font-semibold text-blue-800 underline underline-offset-2 hover:text-blue-900 group-hover:text-blue-900"
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
