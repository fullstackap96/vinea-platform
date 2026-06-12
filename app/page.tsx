import Image from 'next/image'
import Link from 'next/link'
import {
  BookOpen,
  Briefcase,
  Calendar,
  Church,
  ClipboardList,
  Flame,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Lightbulb,
  Mail,
  Sparkles,
  UserCircle,
  Users,
  type LucideIcon,
} from 'lucide-react'
import {
  LEGAL_ENTITY_FOOTER_LINE,
  PARISH_OPERATIONS_DESCRIPTOR,
  PRODUCT_NAME,
} from '@/lib/productBranding'
import { primaryButtonLanding } from '@/lib/buttonStyles'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { ScheduleDemoForm } from '@/app/_components/landing/ScheduleDemoForm'

const sectionIntroClass = 'mt-3 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg'

export default function Home() {
  const baseButton =
    'inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-medium w-full sm:w-auto transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
  const primaryButton = `${baseButton} bg-brand text-white hover:bg-brand-hover active:bg-brand-active focus-visible:ring-brand-ring`
  const secondaryButton = `${baseButton} border border-gray-800 text-gray-900 bg-white hover:border-gray-900 hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-brand-ring/35`
  const accentButton = `${baseButton} border border-brand/25 bg-brand-muted/40 text-brand-foreground hover:bg-brand-muted/60 active:bg-brand-muted/75 focus-visible:ring-brand-ring/35`

  return (
    <div className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans">
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <Link
              href="#schedule-demo"
              className="text-sm font-medium text-brand-foreground hover:text-brand underline-offset-2 hover:underline shrink-0 sm:text-right"
            >
              Schedule a demo
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-blue-800 underline underline-offset-2 hover:text-blue-900 shrink-0 sm:text-right"
            >
              Staff login
            </Link>
          </div>
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
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-14 sm:pt-16 sm:pb-18">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-14">
              <div className="max-w-2xl">
                <p className="inline-flex w-fit items-center gap-2 rounded-full border border-brand/15 bg-white/80 px-3 py-1 text-xs sm:text-sm font-semibold tracking-wide text-brand-foreground shadow-sm">
                  <Sparkles className="h-4 w-4 text-brand" aria-hidden />
                  {PARISH_OPERATIONS_DESCRIPTOR} for Catholic parishes
                </p>
                <h1 className="mt-5 text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-gray-900 tracking-tight leading-[1.12] text-balance">
                  Never lose track of a parish request again.
                </h1>
                <p className="mt-5 text-lg sm:text-xl text-gray-600 leading-relaxed text-pretty">
                  <span className="font-semibold text-gray-900">{PRODUCT_NAME}</span> keeps
                  baptisms, funerals, weddings, OCIA, sacramental records, people, households,
                  and follow-ups organized in one place—so your staff spends less time searching
                  and more time serving.
                </p>
                <div className="mt-8 flex flex-col items-stretch sm:items-start gap-3">
                  <Link href="#schedule-demo" className={primaryButton}>
                    Schedule a Demo
                  </Link>
                  <div className="flex flex-col w-full sm:flex-row sm:flex-wrap gap-3">
                    <Link href="/login" className={secondaryButton}>
                      Staff Sign In
                    </Link>
                    <Link href="#platform" className={accentButton}>
                      Explore the Platform
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <Link
                  href="/"
                  className="block w-fit max-w-full rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                >
                  <Image
                    src="/vinea-logo.png"
                    alt={PRODUCT_NAME}
                    width={900}
                    height={360}
                    className="h-36 w-auto object-contain sm:h-44 lg:h-52"
                    priority
                    unoptimized
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Credibility */}
        <section className="border-t border-gray-100 bg-white py-12 sm:py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="rounded-2xl border border-gray-200/80 bg-gray-50/80 px-6 py-7 sm:px-8 sm:py-8">
              <p className="text-center text-sm font-semibold uppercase tracking-wider text-brand-foreground">
                Built for real parish work
              </p>
              <p className="mx-auto mt-3 max-w-3xl text-center text-base leading-relaxed text-gray-700 sm:text-lg">
                Designed with Catholic parish workflows in mind: sacramental preparation,
                pastoral follow-up, parish records, and staff coordination.
              </p>
            </div>
          </div>
        </section>

        {/* Platform overview */}
        <section id="platform" className="border-t border-gray-100 bg-white py-16 sm:py-20 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className={sectionHeadingClassName}>Everything your parish team needs in one place</h2>
            <p className={sectionIntroClass}>
              From the first family inquiry to the final certificate, Vinea connects intake,
              follow-up, records, and people—without spreadsheets or scattered email threads.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <PlatformCard
                icon={Inbox}
                title="Intake & follow-up"
                body="Public forms for baptism, funeral, wedding, OCIA, and joining the parish. Staff work from a command center with a follow-up queue, assignments, and clear status."
              />
              <PlatformCard
                icon={BookOpen}
                title="Sacramental records & certificates"
                body="Keep your parish register organized. Create records from completed requests and generate baptism certificates when ready."
              />
              <PlatformCard
                icon={Users}
                title="People & households"
                body="Build profiles linked to intake contacts, requests, and records. Organize households with relationships and primary contacts."
              />
              <PlatformCard
                icon={Flame}
                title="Mass intentions"
                body="Track who requested each intention, offering details, dates, and fulfillment status in the same staff workspace."
              />
              <PlatformCard
                icon={Mail}
                title="Email & AI assistance"
                body="Send email from the request workflow. Draft replies and internal summaries with AI—you review every message before it goes out."
              />
              <PlatformCard
                icon={Lightbulb}
                title="Never miss the next step"
                body="Vinea highlights missing records, unlinked people, overdue follow-ups, and certificate opportunities before they become problems."
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-gray-100 bg-gray-50 py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className={sectionHeadingClassName}>How it works</h2>
            <p className={sectionIntroClass}>
              Simple for families. Clear for staff. Connected across your parish.
            </p>
            <ol className="mt-10 grid gap-5 sm:grid-cols-2">
              {[
                {
                  title: 'Families submit requests',
                  body: 'Parishioners use dedicated intake forms for each sacramental path or joining the parish. Submissions arrive as structured requests—not scattered emails.',
                },
                {
                  title: 'Staff manage the work',
                  body: 'Your team reviews the command center, assigns follow-ups, logs communications, syncs Google Calendar, and works checklists until each request is complete.',
                },
                {
                  title: 'Built-in follow-up guidance',
                  body: 'Vinea surfaces overdue follow-ups, missing register entries, and people who still need to be linked—always for staff review, never automatic.',
                },
                {
                  title: 'Records, people, and follow-ups stay connected',
                  body: 'Sacramental records, households, mass intentions, and communication history live alongside requests so pastoral context travels with the work.',
                },
              ].map((step, idx) => (
                <li
                  key={step.title}
                  className="rounded-2xl border border-gray-200/70 bg-white px-5 py-5 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand-foreground ring-1 ring-brand/15 shadow-sm">
                      <span className="text-sm font-bold">{idx + 1}</span>
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Who it's for */}
        <section className="border-t border-gray-100 bg-white py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className={sectionHeadingClassName}>Who it&apos;s for</h2>
            <p className={sectionIntroClass}>
              Vinea supports the people who keep parish life running—each with the visibility
              they need, in one shared system.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <AudienceCard
                icon={ClipboardList}
                title="Parish secretaries"
                body="Manage intake, scheduling, records, and communications from one calm workspace."
              />
              <AudienceCard
                icon={Church}
                title="Priests & deacons"
                body="See upcoming work, assignments, and sacramental preparation at a glance."
              />
              <AudienceCard
                icon={GraduationCap}
                title="OCIA coordinators"
                body="Track inquiries, sessions, and follow-ups without losing contact with inquirers."
              />
              <AudienceCard
                icon={Briefcase}
                title="Business managers"
                body="Maintain visibility and continuity across parish operations and staff handoffs."
              />
            </div>
          </div>
        </section>

        {/* Built for parish staff */}
        <section className="border-t border-gray-100 bg-gray-50 py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className={sectionHeadingClassName}>Built for parish staff</h2>
            <p className={sectionIntroClass}>
              Six core areas—grouped the way your office actually works.
            </p>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <StaffModule
                icon={Inbox}
                title="Requests & intake"
                body="Parish intake forms, command center dashboard, assignments, and status tracking."
              />
              <StaffModule
                icon={Mail}
                title="Follow-up & communication"
                body="Follow-up queue, email from requests, AI summaries and reply drafts, communication history."
              />
              <StaffModule
                icon={BookOpen}
                title="Sacramental records"
                body="Digital register, baptism certificates, and links back to the original request."
              />
              <StaffModule
                icon={Users}
                title="People & households"
                body="People profiles, household rosters, and connections to requests and records."
              />
              <StaffModule
                icon={Flame}
                title="Mass intentions"
                body="Intention requests, dates, fulfillment tracking, and parish-scoped lists."
              />
              <StaffModule
                icon={Calendar}
                title="Calendar & scheduling"
                body="Google Calendar integration, confirmed dates, and parish settings with priest directory."
              />
            </ul>
          </div>
        </section>

        {/* Why Vinea */}
        <section className="border-t border-gray-100 bg-white py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className={sectionHeadingClassName}>Why Vinea</h2>
            <div className="mt-6 rounded-2xl border border-brand/15 bg-brand-muted/35 px-6 py-7 shadow-sm sm:px-10 sm:py-9">
              <div className="max-w-3xl space-y-4 text-base leading-relaxed text-gray-800 sm:text-lg">
                <p>Parish ministry is relational. The software supporting it should be too.</p>
                <p>
                  Vinea keeps every conversation, follow-up, sacramental record, and family
                  connection organized in one place.
                </p>
                <p className="font-medium text-gray-900">
                  No spreadsheets. No scattered emails. No wondering who followed up last.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* See the workflow */}
        <section id="workflow" className="border-t border-gray-100 bg-gray-50 py-16 sm:py-20 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className={sectionHeadingClassName}>See the workflow</h2>
            <p className={sectionIntroClass}>
              A calm, parish-friendly interface designed for daily staff use.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <WorkflowScreenshotCard
                icon={LayoutDashboard}
                title="Command center dashboard"
                description="See what needs attention today—follow-ups, assignments, and open requests in one view."
                src="/screenshots/dashboard-command-center.png"
                alt="Vinea command center dashboard showing follow-ups, assignments, and open requests"
              />
              <WorkflowScreenshotCard
                icon={ClipboardList}
                title="Request detail workflow"
                description="Checklists, communications, calendar events, and notes on a single request record."
                src="/screenshots/request-detail.png"
                alt="Vinea request detail view with checklists, communications, and calendar events"
              />
              <WorkflowScreenshotCard
                icon={UserCircle}
                title="People profile"
                description="Household links, related requests, and sacramental history for each parishioner."
                src="/screenshots/people-profile.png"
                alt="Vinea people profile with household links and related requests"
              />
              <WorkflowScreenshotCard
                icon={BookOpen}
                title="Sacramental records"
                description="Register entries, certificate generation, and links to people and requests."
                src="/screenshots/sacramental-records.png"
                alt="Vinea sacramental records register with certificate generation"
              />
            </div>
          </div>
        </section>

        {/* Family-facing intake */}
        <section
          id="intake-forms"
          className="border-t border-gray-100 bg-white py-16 sm:py-20 scroll-mt-20"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className={sectionHeadingClassName}>Family-facing intake</h2>
            <p className={sectionIntroClass}>
              Share these links with parishioners. Each path has a dedicated form; every
              submission creates a structured request your team sees on the dashboard.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                title="Funeral planning"
                description="Families reach out for liturgy planning with clear, compassionate intake fields."
                href="/funeral-request"
                cta="Open form →"
                accent="border-slate-200/70 bg-slate-50/80"
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
            </div>
          </div>
        </section>

        {/* Schedule a demo */}
        <section
          id="schedule-demo"
          className="border-t border-gray-100 bg-gray-50 py-16 sm:py-20 scroll-mt-20"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="rounded-2xl border border-gray-200/70 bg-gradient-to-b from-white to-gray-50 px-6 py-8 shadow-sm sm:px-10 sm:py-12">
              <h2 className={sectionHeadingClassName}>Schedule a demo</h2>
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-gray-600">
                Tell us about your parish and we&apos;ll set up a personal walkthrough—intake,
                dashboard, records, and people.
              </p>
              <ScheduleDemoForm submitButtonClassName={primaryButton} />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-gray-100 bg-white py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="rounded-2xl border border-gray-200/70 bg-gradient-to-b from-white to-gray-50 px-6 py-8 shadow-sm sm:px-10 sm:py-12 text-center sm:text-left">
              <h2 className={sectionHeadingClassName}>See Vinea in action</h2>
              <p className="mx-auto max-w-xl text-gray-600 sm:mx-0 text-base leading-relaxed">
                Schedule a 15-minute walkthrough and see how Vinea can organize requests,
                records, follow-ups, and parish communication in one place.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap justify-center sm:justify-start">
                <Link href="#schedule-demo" className={`${primaryButtonLanding} border border-transparent`}>
                  Schedule a Demo
                </Link>
                <Link href="/login" className={secondaryButton}>
                  Staff Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
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

function PlatformCard({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon
  title: string
  body: string
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-200/70 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-muted text-brand ring-1 ring-brand/10">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{body}</p>
    </article>
  )
}

function AudienceCard({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon
  title: string
  body: string
}) {
  return (
    <article className="rounded-2xl border border-gray-200/70 bg-white p-6 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-muted/80 text-brand ring-1 ring-brand/10">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{body}</p>
    </article>
  )
}

function BrowserWindowFrame({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-black/[0.04]">
      <div
        className="flex items-center gap-3 border-b border-gray-200/80 bg-gray-100/95 px-3 py-2.5 sm:px-3.5 sm:py-3"
        aria-hidden
      >
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] ring-1 ring-black/[0.06]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] ring-1 ring-black/[0.06]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] ring-1 ring-black/[0.06]" />
        </div>
        <div className="min-w-0 flex-1 rounded-md border border-gray-200/70 bg-white/80 px-3 py-1 text-center text-[10px] font-medium text-gray-400 sm:text-[11px]">
          {PRODUCT_NAME}
        </div>
      </div>
      <div className="bg-gray-50">{children}</div>
      <span className="sr-only">{title}</span>
    </div>
  )
}

function WorkflowScreenshotCard({
  icon: Icon,
  title,
  description,
  src,
  alt,
}: {
  icon: LucideIcon
  title: string
  description: string
  src: string
  alt: string
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-4 sm:p-5">
        <BrowserWindowFrame title={title}>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-[16/10] overflow-hidden transition-shadow hover:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-ring"
            aria-label={`View full-size screenshot: ${title}`}
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover object-top transition-transform duration-200 group-hover:scale-[1.01]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </a>
        </BrowserWindowFrame>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-brand shrink-0" aria-hidden />
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
      </div>
    </article>
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
      className={`group flex h-full flex-col rounded-2xl border border-gray-200/70 p-6 ${accent} shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}
    >
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed flex-1">{description}</p>
      <Link
        href={href}
        className="mt-5 inline-flex items-center text-sm font-semibold text-blue-800 underline decoration-blue-800/70 underline-offset-2 hover:text-blue-900"
      >
        {cta}
      </Link>
    </div>
  )
}

function StaffModule({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon
  title: string
  body: string
}) {
  return (
    <li className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-muted/80 text-brand ring-1 ring-brand/10">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{body}</p>
        </div>
      </div>
    </li>
  )
}
