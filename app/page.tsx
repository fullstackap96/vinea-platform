import Image from 'next/image'
import Link from 'next/link'
import {
  LEGAL_ENTITY_FOOTER_LINE,
  PARISH_OPERATIONS_DESCRIPTOR,
  PRODUCT_NAME,
} from '@/lib/productBranding'
import { landingButtonPrimary, landingButtonSecondary } from '@/lib/buttonStyles'
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
                className="h-48 w-auto mx-auto mb-6 object-contain sm:h-56 lg:h-60"
                priority
                unoptimized
              />
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
              Baptism, funeral, wedding, and OCIA requests—organized for your parish team.
            </h1>
            <p className="mt-2 text-sm sm:text-base font-semibold tracking-wide text-brand-foreground">
              The Operating System for Parish Ministry
            </p>
            <p className="text-lg sm:text-xl text-gray-600 mt-3 mb-3">
              No more missed follow-ups, scattered emails, or manual tracking.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
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
              <div className="flex flex-col items-center sm:items-start">
                <Link href="/login" className={landingButtonPrimary}>
                  Staff Sign In
                </Link>
                <p className="text-xs text-gray-500 mt-2">For parish staff members</p>
              </div>
              <Link href="#intake-forms" className={landingButtonSecondary}>
                See Parish Intake Forms
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Built for real parish workflows — not generic software.
            </p>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-2xl">
              Securely manage parish requests. Submissions are reviewed by parish staff.
            </p>
          </div>
        </section>

        {/* What Vinea helps you do */}
        <section className="border-t bg-white py-12 sm:py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className={sectionHeadingClassName}>What Vinea Helps You Do</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-gray-700">
              <li className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                Track incoming requests (baptisms, funerals, weddings, OCIA)
              </li>
              <li className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                Assign and manage follow-ups so nothing gets missed
              </li>
              <li className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                Coordinate parish schedules and availability
              </li>
              <li className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                Keep clear visibility on what needs attention
              </li>
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t bg-gray-50 py-12 sm:py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className={sectionHeadingClassName}>How It Works</h2>
            <ol className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-gray-700">
              <li className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                <span className="font-semibold text-gray-900">1.</span> Parishioner submits a
                request
              </li>
              <li className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                <span className="font-semibold text-gray-900">2.</span> Staff reviews and assigns
                follow-ups
              </li>
              <li className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                <span className="font-semibold text-gray-900">3.</span> Track progress and
                coordinate scheduling
              </li>
              <li className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                <span className="font-semibold text-gray-900">4.</span> Mark complete and retain
                records
              </li>
            </ol>
          </div>
        </section>

        {/* Why Vinea */}
        <section className="border-t bg-white py-12 sm:py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className={sectionHeadingClassName}>Why Vinea</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-700">
              Vinea is built to support real parish ministry: fewer dropped handoffs, clearer
              pastoral follow-through, and a calm, consistent process your team can rely on.
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-700">
              It keeps the work human—while the system keeps the details organized.
            </p>
          </div>
        </section>

        {/* Workflow cards */}
        <section
          id="intake-forms"
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
                title="Join the parish"
                description="New households share address, sacramental status, and how we can welcome them."
                href="/join-parish-request"
                cta="Open form →"
                accent="border-amber-300 bg-amber-50/70"
              />
              <WorkflowCard
                title="Baptism requests"
                description="Parents share child details, preferred timing, and notes for preparation."
                href="/baptism-request"
                cta="Open form →"
                accent="border-blue-200 bg-blue-50/50"
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
              <div className="sm:col-span-2 xl:col-span-4">
                <WorkflowCard
                  title="Funeral planning"
                  description="Families reach out for liturgy planning with clear, compassionate intake fields."
                  href="/funeral-request"
                  cta="Open form →"
                  accent="border-slate-200 bg-slate-50/80"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-gray-50 py-14 sm:py-16">
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
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap justify-center sm:justify-start">
              <Link href="/login" className={landingButtonPrimary}>
                Staff Sign In
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
