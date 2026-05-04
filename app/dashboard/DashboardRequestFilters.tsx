'use client'

import { secondaryButtonMd } from '@/lib/buttonStyles'
import {
  countActiveDashboardFilters,
  DASHBOARD_REQUEST_TYPE_VALUES,
  defaultDashboardRowFilters,
  isDashboardWaitingOnFilter,
  type DashboardRowFilters,
} from '@/lib/dashboardRequestFilter'
import { formatRequestType } from '@/lib/formatRequestType'
import { getStatusLabel, REQUEST_STATUS_VALUES } from '@/lib/requestStatus'
import { REQUEST_WAITING_ON_OPTIONS } from '@/lib/requestWaitingOn'
import { vineaInputFieldClassName, vineaSectionShellClassName } from '@/lib/vineaUi'

const labelClass =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500'
const fieldClass = `${vineaInputFieldClassName} disabled:bg-gray-50 disabled:text-gray-500`
const checkClass =
  'h-4 w-4 rounded border-gray-400 text-brand focus:ring-brand/30'

type Props = {
  filters: DashboardRowFilters
  onChange: (next: DashboardRowFilters) => void
  staffOptions: string[]
  priestOptions: string[]
  searchQuery: string
  onSearchChange: (value: string) => void
  disabled?: boolean
}

export function DashboardRequestFilters({
  filters,
  onChange,
  staffOptions,
  priestOptions,
  searchQuery,
  onSearchChange,
  disabled,
}: Props) {
  const active = countActiveDashboardFilters(filters)

  function patch(p: Partial<DashboardRowFilters>) {
    onChange({ ...filters, ...p })
  }

  return (
    <section
      className={vineaSectionShellClassName}
      aria-labelledby="dashboard-filters-heading"
    >
      <div className="flex flex-col gap-3 border-b border-gray-100/90 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="dashboard-filters-heading"
            className="text-base font-semibold text-gray-900"
          >
            Find requests
          </h2>
          <p className="mt-1 max-w-2xl text-base leading-relaxed text-gray-600">
            Narrow the list by type, who is assigned, follow-up timing, and more. Search still
            matches names and emails below.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          {active > 0 ? (
            <span className="text-xs font-medium text-gray-600 sm:text-right">
              {active} filter{active === 1 ? '' : 's'} active
            </span>
          ) : null}
          <button
            type="button"
            disabled={disabled || active === 0}
            onClick={() => onChange(defaultDashboardRowFilters())}
            className={`${secondaryButtonMd} w-full justify-center whitespace-nowrap sm:w-auto`}
          >
            Clear all filters
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="dash-filter-type" className={labelClass}>
            Request type
          </label>
          <select
            id="dash-filter-type"
            className={fieldClass}
            disabled={disabled}
            value={filters.requestType}
            onChange={(e) => patch({ requestType: e.target.value })}
          >
            <option value="all">All types</option>
            {DASHBOARD_REQUEST_TYPE_VALUES.map((v) => (
              <option key={v} value={v}>
                {formatRequestType(v)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dash-filter-status" className={labelClass}>
            Status
          </label>
          <select
            id="dash-filter-status"
            className={fieldClass}
            disabled={disabled}
            value={filters.status}
            onChange={(e) => patch({ status: e.target.value })}
          >
            <option value="all">All statuses</option>
            {REQUEST_STATUS_VALUES.map((v) => (
              <option key={v} value={v}>
                {getStatusLabel(v)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dash-filter-waiting" className={labelClass}>
            Waiting on
          </label>
          <select
            id="dash-filter-waiting"
            className={fieldClass}
            disabled={disabled}
            value={filters.waitingOn}
            onChange={(e) => {
              const v = e.target.value
              patch({
                waitingOn: isDashboardWaitingOnFilter(v) ? v : 'all',
              })
            }}
          >
            <option value="all">Any</option>
            <option value="none">Not set</option>
            {REQUEST_WAITING_ON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dash-filter-staff" className={labelClass}>
            Assigned staff
          </label>
          <select
            id="dash-filter-staff"
            className={fieldClass}
            disabled={disabled || filters.unassignedOnly}
            value={filters.staffAssignee}
            onChange={(e) => {
              const v = e.target.value
              patch({
                staffAssignee: v,
                unassignedOnly: v ? false : filters.unassignedOnly,
              })
            }}
          >
            <option value="">Anyone</option>
            {staffOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dash-filter-priest" className={labelClass}>
            Assigned priest
          </label>
          <select
            id="dash-filter-priest"
            className={fieldClass}
            disabled={disabled || filters.unassignedOnly}
            value={filters.priestAssignee}
            onChange={(e) => {
              const v = e.target.value
              patch({
                priestAssignee: v,
                unassignedOnly: v ? false : filters.unassignedOnly,
              })
            }}
          >
            <option value="">Anyone</option>
            {priestOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col justify-end gap-3 rounded-xl border border-gray-100 bg-slate-50/70 p-4 sm:min-h-[5.5rem]">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-gray-800">
            <input
              type="checkbox"
              className={checkClass}
              disabled={disabled}
              checked={filters.overdueOnly}
              onChange={(e) => patch({ overdueOnly: e.target.checked })}
            />
            Overdue follow-ups only
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-gray-800">
            <input
              type="checkbox"
              className={checkClass}
              disabled={disabled}
              checked={filters.unassignedOnly}
              onChange={(e) => {
                const on = e.target.checked
                patch(
                  on
                    ? {
                        unassignedOnly: true,
                        staffAssignee: '',
                        priestAssignee: '',
                      }
                    : { unassignedOnly: false }
                )
              }}
            />
            Unassigned only (no staff, priest, or deacon)
          </label>
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <p className={labelClass}>Submitted date</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="dash-filter-from" className="sr-only">
                Submitted from
              </label>
              <input
                id="dash-filter-from"
                type="date"
                className={fieldClass}
                disabled={disabled}
                value={filters.submittedFrom}
                onChange={(e) => patch({ submittedFrom: e.target.value })}
              />
              <span className="mt-1 block text-xs text-gray-500">From</span>
            </div>
            <div>
              <label htmlFor="dash-filter-to" className="sr-only">
                Submitted to
              </label>
              <input
                id="dash-filter-to"
                type="date"
                className={fieldClass}
                disabled={disabled}
                value={filters.submittedTo}
                onChange={(e) => patch({ submittedTo: e.target.value })}
              />
              <span className="mt-1 block text-xs text-gray-500">To</span>
            </div>
          </div>
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="dash-filter-search" className={labelClass}>
            Search
          </label>
          <input
            id="dash-filter-search"
            type="search"
            className={fieldClass}
            disabled={disabled}
            placeholder="Search by parent or partner name, email, child, follow-up date…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </section>
  )
}
