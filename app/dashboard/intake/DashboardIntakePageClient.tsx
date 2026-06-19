'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, ClipboardList, Filter } from 'lucide-react'
import type {
  ParishIntakeQueueFilter,
  ParishIntakeQueueItem,
  ParishIntakeQueuePriority,
} from '@/lib/parishIntakeQueue'
import { primaryButtonSm, secondaryButtonSm } from '@/lib/buttonStyles'
import { chipBase } from '@/lib/chipStyles'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaEmptyStateClassName } from '@/lib/vineaUi'
import { quickTriageMassIntention, quickTriageRequest } from './actions'

type FilterKey = 'all' | ParishIntakeQueueFilter

type Props = {
  items: ParishIntakeQueueItem[]
  errorMessage?: string
  softWarnings?: string[]
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All intake' },
  { key: 'needs_review', label: 'Needs review' },
  { key: 'missing_info', label: 'Missing info' },
  { key: 'ready_to_schedule', label: 'Ready to schedule' },
  { key: 'needs_owner', label: 'Needs owner' },
  { key: 'waiting', label: 'Waiting on family' },
]

function priorityTone(priority: ParishIntakeQueuePriority): string {
  if (priority === 'urgent') return 'border-rose-200 bg-rose-50 text-rose-950'
  if (priority === 'high') return 'border-amber-200 bg-amber-50 text-amber-950'
  return 'border-slate-200 bg-slate-50 text-slate-900'
}

function priorityLabel(priority: ParishIntakeQueuePriority): string {
  if (priority === 'urgent') return 'Urgent'
  if (priority === 'high') return 'Needs attention'
  return 'Normal'
}

function kindLabel(kind: ParishIntakeQueueItem['kind']): string {
  if (kind === 'mass_intention') return 'Mass intention'
  return 'Request'
}

function filterItems(items: ParishIntakeQueueItem[], filter: FilterKey) {
  if (filter === 'all') return items
  return items.filter((item) => item.filters.includes(filter))
}

export function DashboardIntakePageClient({
  items,
  errorMessage = '',
  softWarnings = [],
}: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterKey>('needs_review')
  const [openItemId, setOpenItemId] = useState<string | null>(null)
  const [savingItemId, setSavingItemId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, string>>({})
  const visibleItems = useMemo(() => filterItems(items, filter), [items, filter])
  const urgentCount = items.filter((item) => item.priority === 'urgent').length
  const missingCount = items.filter((item) => item.filters.includes('missing_info')).length
  const ownerCount = items.filter((item) => item.filters.includes('needs_owner')).length

  function setItemMessage(itemId: string, message: string) {
    setMessages((current) => ({ ...current, [itemId]: message }))
  }

  async function saveRequestTriage(item: ParishIntakeQueueItem, formData: FormData) {
    setSavingItemId(item.id)
    setItemMessage(item.id, '')
    try {
      const result = await quickTriageRequest({
        requestId: item.sourceId,
        assignedStaffName: formData.get('assignedStaffName'),
        nextFollowUpDate: formData.get('nextFollowUpDate'),
        contactMethod: formData.get('contactMethod'),
        contactNotes: formData.get('contactNotes'),
        markFirstContact: formData.get('markFirstContact') === 'on',
        doneForNow: formData.get('doneForNow') === 'on',
      })
      if (!result.ok) {
        setItemMessage(item.id, `Could not save: ${result.error}`)
        return
      }
      setItemMessage(item.id, 'Quick triage saved.')
      setOpenItemId(null)
      router.refresh()
    } finally {
      setSavingItemId(null)
    }
  }

  async function saveMassIntentionTriage(item: ParishIntakeQueueItem, formData: FormData) {
    setSavingItemId(item.id)
    setItemMessage(item.id, '')
    try {
      const result = await quickTriageMassIntention({
        intentionId: item.sourceId,
        assignedMassDate: formData.get('assignedMassDate'),
        assignedPriestName: formData.get('assignedPriestName'),
        stipendReceived: formData.get('stipendReceived') === 'on',
        doneForNow: formData.get('doneForNow') === 'on',
      })
      if (!result.ok) {
        setItemMessage(item.id, `Could not save: ${result.error}`)
        return
      }
      setItemMessage(item.id, 'Mass intention triage saved.')
      setOpenItemId(null)
      router.refresh()
    } finally {
      setSavingItemId(null)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Parish office intake
          </p>
          <h1 className={`${sectionHeadingClassName} mt-1`}>
            Review new parish work
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
            New and unfinished requests from forms, office work, and Mass intentions in one
            clear triage queue.
          </p>
        </div>
        <Link href="/dashboard/requests" className={`${secondaryButtonSm} gap-2`}>
          All requests
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      {errorMessage ? (
        <div className={vineaEmptyStateClassName} role="alert">
          <p className="text-base font-semibold text-gray-900">Intake unavailable</p>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
            {errorMessage}
          </p>
        </div>
      ) : (
        <>
          {softWarnings.length > 0 ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
              {softWarnings.join(' ')}
            </div>
          ) : null}

          <section className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className={`rounded-xl border px-4 py-3 ${priorityTone(urgentCount > 0 ? 'urgent' : 'normal')}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">Urgent contact</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{urgentCount}</p>
            </div>
            <div className={`rounded-xl border px-4 py-3 ${priorityTone(missingCount > 0 ? 'high' : 'normal')}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">Missing info</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{missingCount}</p>
            </div>
            <div className={`rounded-xl border px-4 py-3 ${priorityTone(ownerCount > 0 ? 'high' : 'normal')}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">Needs owner</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{ownerCount}</p>
            </div>
          </section>

          <div className="mt-5 flex flex-wrap items-center gap-2" aria-label="Intake filters">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600">
              <Filter className="h-4 w-4" aria-hidden />
              Show
            </span>
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                  filter === item.key
                    ? 'border-brand bg-brand text-white'
                    : 'border-gray-200 bg-white text-gray-800 hover:border-brand/40'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {visibleItems.length === 0 ? (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-5 text-sm leading-relaxed text-emerald-950">
              <p className="font-semibold">Nothing is waiting in this intake view.</p>
              <p className="mt-1">Try another filter or continue with the staff command center.</p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {visibleItems.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`${chipBase} border text-[10px] uppercase ${priorityTone(item.priority)}`}>
                          {priorityLabel(item.priority)}
                        </span>
                        <span className={`${chipBase} border border-gray-200 bg-gray-50 text-[10px] uppercase text-gray-700`}>
                          {kindLabel(item.kind)}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {item.ageLabel}
                        </span>
                      </div>
                      <h2 className="mt-2 text-lg font-bold leading-snug text-gray-950">
                        {item.title}
                      </h2>
                      <p className="mt-1 text-sm font-medium text-gray-600">{item.subtitle}</p>
                      <div className="mt-3 rounded-xl border border-brand/15 bg-brand-muted/30 px-3 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-brand-foreground">
                          Recommended next step
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-relaxed text-gray-950">
                          {item.recommendedAction}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-600">
                          Suggested owner: {item.suggestedOwner}
                        </p>
                      </div>
                    </div>

                    <div className="w-full shrink-0 lg:w-72">
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                          <ClipboardList className="h-4 w-4" aria-hidden />
                          {item.label}
                        </div>
                        {item.missingDetails.length > 0 ? (
                          <ul className="mt-2 space-y-1 text-sm leading-relaxed text-gray-600">
                            {item.missingDetails.slice(0, 3).map((detail) => (
                              <li key={detail}>- {detail}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-sm leading-relaxed text-gray-600">
                            No major intake gaps are showing.
                          </p>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className={secondaryButtonSm}
                          onClick={() =>
                            setOpenItemId((current) => (current === item.id ? null : item.id))
                          }
                        >
                          Quick triage
                        </button>
                        <Link href={item.href} className={`${primaryButtonSm} gap-2`}>
                          Open full record
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {openItemId === item.id ? (
                    <form
                      className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3"
                      action={(formData) => {
                        if (item.kind === 'mass_intention') {
                          void saveMassIntentionTriage(item, formData)
                        } else {
                          void saveRequestTriage(item, formData)
                        }
                      }}
                    >
                      <p className="text-sm font-semibold text-gray-950">
                        Quick triage
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">
                        Save the basic next step here, then open the full record only if more
                        detail is needed.
                      </p>

                      {item.kind === 'mass_intention' ? (
                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                          <label className="text-sm font-medium text-gray-700">
                            Mass date
                            <input
                              type="date"
                              name="assignedMassDate"
                              defaultValue={item.currentMassDate}
                              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="text-sm font-medium text-gray-700">
                            Priest
                            <input
                              type="text"
                              name="assignedPriestName"
                              defaultValue={item.currentPriestName}
                              placeholder="Fr. name"
                              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="flex items-end gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700">
                            <input
                              type="checkbox"
                              name="stipendReceived"
                              defaultChecked={item.stipendReceived}
                              className="mb-1"
                            />
                            Stipend received
                          </label>
                        </div>
                      ) : (
                        <div className="mt-3 grid gap-3 lg:grid-cols-2">
                          <label className="text-sm font-medium text-gray-700">
                            Staff owner
                            <input
                              type="text"
                              name="assignedStaffName"
                              defaultValue={item.currentOwner}
                              placeholder="Name of staff owner"
                              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="text-sm font-medium text-gray-700">
                            Next follow-up
                            <input
                              type="date"
                              name="nextFollowUpDate"
                              defaultValue={item.currentFollowUpDate}
                              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="text-sm font-medium text-gray-700">
                            Contact method
                            <select
                              name="contactMethod"
                              defaultValue="phone"
                              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                            >
                              <option value="phone">Phone call</option>
                              <option value="email">Email</option>
                              <option value="voicemail">Left voicemail</option>
                              <option value="in_person">In person</option>
                            </select>
                          </label>
                          <label className="text-sm font-medium text-gray-700">
                            Contact note
                            <input
                              type="text"
                              name="contactNotes"
                              placeholder="Short note for communication history"
                              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="flex items-start gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 lg:col-span-2">
                            <input type="checkbox" name="markFirstContact" className="mt-1" />
                            <span>
                              <span className="block font-semibold">Mark first contact complete</span>
                              <span className="block text-xs leading-relaxed text-gray-600">
                                Logs a communication entry and updates the request contact summary.
                              </span>
                            </span>
                          </label>
                        </div>
                      )}

                      <label className="mt-3 flex items-start gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                        <input type="checkbox" name="doneForNow" className="mt-1" />
                        <span>
                          <span className="block font-semibold">Done for now</span>
                          <span className="block text-xs leading-relaxed text-gray-600">
                            Use this when the intake item has enough ownership or scheduling to
                            leave the front-desk queue.
                          </span>
                        </span>
                      </label>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="submit"
                          className={primaryButtonSm}
                          disabled={savingItemId === item.id}
                        >
                          {savingItemId === item.id ? 'Saving...' : 'Save quick triage'}
                        </button>
                        <button
                          type="button"
                          className={secondaryButtonSm}
                          onClick={() => setOpenItemId(null)}
                          disabled={savingItemId === item.id}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {messages[item.id] ? (
                    <p
                      className={`mt-3 rounded-xl border px-3 py-2 text-sm leading-relaxed ${
                        messages[item.id].startsWith('Could not')
                          ? 'border-rose-200 bg-rose-50 text-rose-950'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-950'
                      }`}
                      role={messages[item.id].startsWith('Could not') ? 'alert' : 'status'}
                    >
                      {messages[item.id]}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
