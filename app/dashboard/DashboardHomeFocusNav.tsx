import { Activity, ClipboardCheck, HeartHandshake, UsersRound } from 'lucide-react'

type DashboardHomeFocusNavProps = {
  activeParishName: string | null
  actionRequiredCount: number
  handoffItemCount: number
  healthScore: number
  healthLabel: string
  prioritizedWorkCount: number
  loading: boolean
  dataUnavailable: boolean
}

type FocusDestination = {
  href: string
  label: string
  detail: string
  icon: typeof Activity
  tone: string
}

export function DashboardHomeFocusNav({
  activeParishName,
  actionRequiredCount,
  handoffItemCount,
  healthScore,
  healthLabel,
  prioritizedWorkCount,
  loading,
  dataUnavailable,
}: DashboardHomeFocusNavProps) {
  const metric = (value: string) => {
    if (loading) return 'Loading'
    if (dataUnavailable) return 'Unavailable'
    return value
  }

  const destinations: FocusDestination[] = [
    {
      href: '#dashboard-focus-now',
      label: 'Focus now',
      detail: metric(
        actionRequiredCount === 0
          ? 'No urgent requests'
          : `${actionRequiredCount} ${actionRequiredCount === 1 ? 'request needs' : 'requests need'} attention`,
      ),
      icon: HeartHandshake,
      tone: 'border-rose-100 bg-rose-50/70 text-rose-950',
    },
    {
      href: '#dashboard-handoff',
      label: 'Office handoff',
      detail: metric(
        handoffItemCount === 0
          ? 'Handoff is clear'
          : `${handoffItemCount} ${handoffItemCount === 1 ? 'item' : 'items'} to review`,
      ),
      icon: ClipboardCheck,
      tone: 'border-amber-100 bg-amber-50/70 text-amber-950',
    },
    {
      href: '#dashboard-health',
      label: 'Parish health',
      detail: metric(`${healthScore} · ${healthLabel}`),
      icon: Activity,
      tone: 'border-emerald-100 bg-emerald-50/70 text-emerald-950',
    },
    {
      href: '#dashboard-team',
      label: 'Team queues',
      detail: metric(
        prioritizedWorkCount === 0
          ? 'No prioritized rows'
          : `${prioritizedWorkCount} prioritized ${prioritizedWorkCount === 1 ? 'row' : 'rows'}`,
      ),
      icon: UsersRound,
      tone: 'border-sky-100 bg-sky-50/70 text-sky-950',
    },
  ]

  return (
    <nav
      aria-label="Home dashboard sections"
      className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm ring-1 ring-gray-900/[0.03]"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:px-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Today&apos;s workspace
        </p>
        <p className="text-xs leading-snug text-gray-500 sm:text-right">
          {activeParishName ? `Viewing ${activeParishName}` : 'Viewing the selected parish'}
        </p>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {destinations.map((destination) => {
          const Icon = destination.icon
          return (
            <a
              key={destination.href}
              href={destination.href}
              className={`group flex min-w-0 items-center gap-3 rounded-lg border px-3 py-2.5 transition-[border-color,background-color,box-shadow] duration-150 hover:border-gray-300 hover:bg-white hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${destination.tone}`}
            >
              <span
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-black/10 bg-white/80"
                aria-hidden="true"
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-tight">
                  {destination.label}
                </span>
                <span className="mt-0.5 block text-xs leading-snug opacity-75">
                  {destination.detail}
                </span>
              </span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
