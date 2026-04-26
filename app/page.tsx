import Image from 'next/image'
import Link from 'next/link'
import { Check, Sparkles } from 'lucide-react'
import {
  LEGAL_ENTITY_FOOTER_LINE,
  PARISH_OPERATIONS_DESCRIPTOR,
  PRODUCT_NAME,
} from '@/lib/productBranding'
import { primaryButtonLanding } from '@/lib/buttonStyles'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { ScheduleDemoForm } from '@/app/_components/landing/ScheduleDemoForm'

export default function Home() {
  const baseButton =
    'inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-medium w-full sm:w-auto transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
  const primaryButton = `${baseButton} bg-brand text-white hover:bg-brand-hover active:bg-brand-active focus-visible:ring-brand-ring`
  const secondaryButton = `${baseButton} border border-gray-800 text-gray-900 bg-white hover:border-gray-900 hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-brand-ring/35`
  const accentButton = `${baseButton} border border-brand/25 bg-brand-muted/40 text-brand-foreground hover:bg-brand-muted/60 active:bg-brand-muted/75 focus-visible:ring-brand-ring/35`

  return (
    <div className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans">
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur">
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
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-white to-gray-50"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-[520px] w-[780px] -translate-x-1/2 rounded-full bg-brand-muted/60 blur-3xl"
          />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-14 sm:pt-16 sm:pb-18">
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
            <h1 className="max-w-xl text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
              Baptism, funeral, wedding, and OCIA requests—organized for your parish team.
            </h1>
            <p className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-brand/15 bg-white/70 px-3 py-1 text-xs sm:text-sm font-semibold tracking-wide text-brand-foreground shadow-sm">
              <Sparkles className="h-4 w-4 text-brand" aria-hidden />
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
            <div className="mt-7 flex flex-col items-center sm:items-start sm:flex-row gap-3 sm:flex-wrap">
              <div className="flex flex-col items-center sm:items-start">
                <Link href="/login" className={primaryButton}>
                  Staff Sign In
                </Link>
                <p className="text-xs text-gray-500 mt-2">For parish staff members</p>
              </div>
              <Link href="#intake-forms" className={secondaryButton}>
                See Parish Intake Forms
              </Link>
              <Link href="#schedule-demo" className={accentButton}>
                Schedule a Demo
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Built for real parish workflows — not generic software.
            </p>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-2xl">
              Securely manage parish requests. Submissions are reviewed by parish staff.
            </p>
          </div>
          </div>
        </section>

        {/* What Vinea helps you do */}
        <section className="border-t border-gray-100 bg-white py-14 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className={sectionHeadingClassName}>What Vinea Helps You Do</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 text-sm text-gray-700">
              {[
                'Track incoming requests (baptisms, funerals, weddings, OCIA)',
                'Assign and manage follow-ups so nothing gets missed',
                'Coordinate parish schedules and availability',
                'Keep clear visibility on what needs attention',
              ].map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-gray-200/70 bg-white px-4 py-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand-foreground ring-1 ring-brand/10">
                      <Check className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-gray-100 bg-gray-50 py-14 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className={sectionHeadingClassName}>How It Works</h2>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2 text-sm text-gray-700">
              {[
                'Parishioner submits a request',
                'Staff reviews and assigns follow-ups',
                'Track progress and coordinate scheduling',
                'Mark complete and retain records',
              ].map((step, idx) => (
                <li
                  key={step}
                  className="rounded-2xl border border-gray-200/70 bg-white px-4 py-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-brand ring-1 ring-brand/20 shadow-sm">
                      <span className="text-xs font-bold">{idx + 1}</span>
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Why Vinea */}
        <section className="border-t border-gray-100 bg-white py-14 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className={sectionHeadingClassName}>Why Vinea</h2>
            <div className="mt-5 rounded-2xl border border-brand/15 bg-brand-muted/35 px-5 py-5 shadow-sm">
              <p className="max-w-3xl text-sm leading-relaxed text-gray-800">
                Vinea is built to support real parish ministry: fewer dropped handoffs, clearer
                pastoral follow-through, and a calm, consistent process your team can rely on.
              </p>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-800">
                It keeps the work human—while the system keeps the details organized.
              </p>
            </div>
          </div>
        </section>

        {/* Workflow cards */}
        <section
          id="intake-forms"
          className="border-t border-gray-100 bg-white py-16 sm:py-20 scroll-mt-20"
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
                accent="border-amber-200/70 bg-amber-50/50"
              />
              <WorkflowCard
                title="Baptism requests"
                description="Parents share child details, preferred timing, and notes for preparation."
                href="/baptism-request"
                cta="Open form →"
                accent="border-blue-200/70 bg-blue-50/40"
              />
              <WorkflowCard
                title="Wedding preparation"
                description="Couples submit names, proposed dates, and ceremony notes in one place."
                href="/wedding-request"
                cta="Open form →"
                accent="border-rose-200/70 bg-rose-50/40"
              />
              <WorkflowCard
                title="OCIA (RCIA) inquiry"
                description="Inquirers share their background, what they are seeking, and how to reach them."
                href="/ocia-request"
                cta="Open form →"
                accent="border-emerald-200/70 bg-emerald-50/40"
              />
              <div className="sm:col-span-2 xl:col-span-4">
                <WorkflowCard
                  title="Funeral planning"
                  description="Families reach out for liturgy planning with clear, compassionate intake fields."
                  href="/funeral-request"
                  cta="Open form →"
                  accent="border-slate-200/70 bg-slate-50/80"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-gray-100 bg-gray-50 py-16 sm:py-20">
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

        {/* Schedule a demo */}
        <section
          id="schedule-demo"
          className="border-t border-gray-100 bg-white py-16 sm:py-20 scroll-mt-20"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="rounded-2xl border border-gray-200/70 bg-gradient-to-b from-white to-gray-50 px-6 py-8 shadow-sm sm:px-8 sm:py-10">
              <h2 className={sectionHeadingClassName}>Schedule a Demo</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                Tell us a little about your parish, and we’ll reach out personally to set up a
                short walkthrough.
              </p>
              <ScheduleDemoForm secondaryButtonClassName={secondaryButton} />
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="border-t border-gray-100 bg-white py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center sm:text-left">
            <div className="rounded-2xl border border-gray-200/70 bg-gradient-to-b from-white to-gray-50 px-6 py-8 shadow-sm sm:px-8 sm:py-10">
              <h2 className={sectionHeadingClassName}>Ready to see your dashboard?</h2>
              <p className="mx-auto max-w-xl text-gray-600 sm:mx-0">
                Sign in with your parish staff account to review requests, run follow-ups,
                and keep sacramental care coordinated.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap justify-center sm:justify-start">
                <Link href="/login" className={`${primaryButtonLanding} border border-transparent`}>
                  Staff Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-white py-10">
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
      className={`group rounded-2xl border border-gray-200/70 p-7 flex flex-col ${accent} shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}
    >
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed flex-1">{description}</p>
      <Link
        href={href}
        className="mt-6 inline-flex items-center text-sm font-semibold text-blue-800 underline decoration-blue-800/70 underline-offset-2 hover:text-blue-900 group-hover:text-blue-900"
      >
        {cta}
      </Link>
    </div>
  )
}

function FeatureItem({ title, body }: { title: string; body: string }) {
  return (
    <li className="rounded-2xl border border-gray-200/70 p-7 bg-white shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{body}</p>
    </li>
  )
}
