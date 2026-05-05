'use client'

import type { StaffWorkloadRow } from '@/lib/dashboardStaffWorkload'
import { STAFF_WORKLOAD_UNASSIGNED_LABEL } from '@/lib/dashboardStaffWorkload'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

type Props = {
  rows: StaffWorkloadRow[]
  loading: boolean
  dataUnavailable?: boolean
}

const cellClass = 'px-3 py-2.5 text-right text-sm font-semibold text-gray-900 tabular-nums'
const headClass =
  'px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600'
const headNumClass =
  'px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-600'

function MetricBlock(props: { label: string; value: number; valueClass?: string }) {
  const { label, value, valueClass } = props
  return (
    <div className="rounded-lg border border-gray-200/90 bg-gray-50/80 px-3 py-2">
      <p className="text-xs font-medium text-gray-600">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold tabular-nums ${valueClass ?? 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  )
}

export function DashboardStaffWorkload({
  rows,
  loading,
  dataUnavailable = false,
}: Props) {
  const hideWorkload = Boolean(dataUnavailable && !loading)

  return (
    <section
      className={vineaSectionShellClassName}
      aria-labelledby="staff-workload-heading"
      aria-busy={loading}
    >
      <h2 id="staff-workload-heading" className={sectionHeadingClassName}>
        Staff workload
      </h2>
      <p className="mb-4 max-w-2xl text-sm leading-relaxed text-gray-600">
        Open requests grouped by staff assignee. Counts match the summary cards: action
        required means overdue or due-today follow-up, or no assignee yet.
      </p>

      {loading ? (
        <div className="space-y-3" role="status" aria-label="Loading staff workload">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-gray-200/90 bg-white ring-1 ring-gray-900/[0.03] sm:h-14"
            />
          ))}
        </div>
      ) : hideWorkload ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200/90 bg-rose-50/80 px-4 py-5 text-center text-sm text-rose-950"
        >
          <p className="text-base font-semibold">Staff workload unavailable</p>
          <p className="mt-2 max-w-xl mx-auto leading-relaxed text-rose-900/95">
            Requests could not be loaded, so workload is not shown.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-6 text-center text-sm text-gray-600">
          No open requests to show. When new intakes arrive, workload will appear here.
        </p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {rows.map((row) => (
              <article
                key={row.staffDisplay}
                className={`rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm ring-1 ring-gray-900/[0.03] ${
                  row.staffDisplay === STAFF_WORKLOAD_UNASSIGNED_LABEL
                    ? 'border-amber-200/90 bg-amber-50/30'
                    : ''
                }`}
              >
                <h3 className="text-base font-semibold text-gray-900">{row.staffDisplay}</h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <MetricBlock label="Open requests" value={row.openRequests} />
                  <MetricBlock
                    label="Overdue follow-ups"
                    value={row.overdueFollowUps}
                    valueClass={row.overdueFollowUps > 0 ? 'text-rose-800' : undefined}
                  />
                  <MetricBlock
                    label="Action required"
                    value={row.actionRequired}
                    valueClass={row.actionRequired > 0 ? 'text-amber-900' : undefined}
                  />
                  <MetricBlock
                    label="Upcoming scheduled"
                    value={row.upcomingScheduled}
                    valueClass={row.upcomingScheduled > 0 ? 'text-emerald-900' : undefined}
                  />
                </div>
              </article>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-gray-900/[0.03]">
            <table className="w-full min-w-[36rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/90">
                  <th scope="col" className={`${headClass} pl-4`}>
                    Staff member
                  </th>
                  <th scope="col" className={headNumClass}>
                    Open
                  </th>
                  <th scope="col" className={headNumClass}>
                    Overdue follow-ups
                  </th>
                  <th scope="col" className={headNumClass}>
                    Action required
                  </th>
                  <th scope="col" className={`${headNumClass} pr-4`}>
                    Upcoming scheduled
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.staffDisplay}
                    className={`border-b border-gray-100 last:border-0 ${
                      row.staffDisplay === STAFF_WORKLOAD_UNASSIGNED_LABEL
                        ? 'bg-amber-50/40'
                        : 'bg-white'
                    }`}
                  >
                    <th
                      scope="row"
                      className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-900"
                    >
                      {row.staffDisplay}
                    </th>
                    <td className={`${cellClass} text-gray-900`}>{row.openRequests}</td>
                    <td
                      className={`${cellClass} ${row.overdueFollowUps > 0 ? 'text-rose-800' : 'text-gray-700'}`}
                    >
                      {row.overdueFollowUps}
                    </td>
                    <td
                      className={`${cellClass} ${row.actionRequired > 0 ? 'text-amber-900' : 'text-gray-700'}`}
                    >
                      {row.actionRequired}
                    </td>
                    <td
                      className={`${cellClass} pr-4 ${row.upcomingScheduled > 0 ? 'text-emerald-900' : 'text-gray-700'}`}
                    >
                      {row.upcomingScheduled}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
