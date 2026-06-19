'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Mail, MessageSquareText, Phone } from 'lucide-react'
import type {
  ParishCommunicationFilter,
  ParishCommunicationItem,
  ParishCommunicationPriority,
} from '@/lib/parishCommunicationCenter'
import { chipBase } from '@/lib/chipStyles'
import { primaryButtonSm, secondaryButtonSm } from '@/lib/buttonStyles'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaEmptyStateClassName } from '@/lib/vineaUi'
import { logCommunicationTouchpoint, updateCommunicationFollowUp } from './actions'

type FilterKey = 'all' | ParishCommunicationFilter

type Props = {
  items: ParishCommunicationItem[]
  errorMessage?: string
  softWarnings?: string[]
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'needs_reply', label: 'Needs reply' },
  { key: 'overdue_follow_up', label: 'Overdue follow-up' },
  { key: 'no_first_contact', label: 'No first contact' },
  { key: 'recent_contact', label: 'Recent contact' },
  { key: 'funeral', label: 'Funerals' },
  { key: 'wedding', label: 'Weddings' },
  { key: 'baptism', label: 'Baptisms' },
  { key: 'ocia', label: 'OCIA' },
]

function priorityTone(priority: ParishCommunicationPriority): string {
  if (priority === 'urgent') return 'border-rose-200 bg-rose-50 text-rose-950'
  if (priority === 'high') return 'border-amber-200 bg-amber-50 text-amber-950'
  return 'border-slate-200 bg-slate-50 text-slate-900'
}

function priorityLabel(priority: ParishCommunicationPriority): string {
  if (priority === 'urgent') return 'Urgent'
  if (priority === 'high') return 'Needs reply'
  return 'Review'
}

function filterItems(items: ParishCommunicationItem[], filter: FilterKey) {
  if (filter === 'all') return items
  return items.filter((item) => item.filters.includes(filter))
}

export function DashboardCommunicationsPageClient({
  items,
  errorMessage = '',
  softWarnings = [],
}: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterKey>('needs_reply')
  const [openItemId, setOpenItemId] = useState<string | null>(null)
  const [savingItemId, setSavingItemId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, string>>({})
  const visibleItems = useMemo(() => filterItems(items, filter), [items, filter])
  const needsReplyCount = items.filter((item) => item.filters.includes('needs_reply')).length
  const overdueCount = items.filter((item) => item.filters.includes('overdue_follow_up')).length
  const noFirstContactCount = items.filter((item) => item.filters.includes('no_first_contact')).length

  function setItemMessage(itemId: string, message: string) {
    setMessages((current) => ({ ...current, [itemId]: message }))
  }

  async function saveTouchpoint(item: ParishCommunicationItem, formData: FormData) {
    setSavingItemId(item.id)
    setItemMessage(item.id, '')
    try {
      const result = await logCommunicationTouchpoint({
        requestId: item.requestId,
        method: formData.get('method'),
        notes: formData.get('notes'),
        nextFollowUpDate: formData.get('nextFollowUpDate'),
      })
      if (!result.ok) {
        setItemMessage(item.id, `Could not save: ${result.error}`)
        return
      }
      setItemMessage(item.id, 'Communication saved.')
      setOpenItemId(null)
      router.refresh()
    } finally {
      setSavingItemId(null)
    }
  }

  async function saveFollowUp(item: ParishCommunicationItem, formData: FormData) {
    setSavingItemId(item.id)
    setItemMessage(item.id, '')
    try {
      const result = await updateCommunicationFollowUp({
        requestId: item.requestId,
        nextFollowUpDate: formData.get('nextFollowUpDate'),
      })
      if (!result.ok) {
        setItemMessage(item.id, `Could not save: ${result.error}`)
        return
      }
      setItemMessage(item.id, 'Follow-up date updated.')
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
            Communication center
          </p>
          <h1 className={`${sectionHeadingClassName} mt-1`}>
            Who needs to hear from us?
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
            Calls, emails, voicemails, follow-ups, and communication context across active
            parish requests.
          </p>
        </div>
        <Link href="/dashboard/requests" className={`${secondaryButtonSm} gap-2`}>
          All requests
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      {errorMessage ? (
        <div className={vineaEmptyStateClassName} role="alert">
          <p className="text-base font-semibold text-gray-900">Communications unavailable</p>
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
            <div className={`rounded-xl border px-4 py-3 ${priorityTone(needsReplyCount > 0 ? 'high' : 'normal')}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">Needs reply</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{needsReplyCount}</p>
            </div>
            <div className={`rounded-xl border px-4 py-3 ${priorityTone(overdueCount > 0 ? 'urgent' : 'normal')}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">Overdue</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{overdueCount}</p>
            </div>
            <div className={`rounded-xl border px-4 py-3 ${priorityTone(noFirstContactCount > 0 ? 'high' : 'normal')}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">No first contact</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{noFirstContactCount}</p>
            </div>
          </section>

          <div className="mt-5 flex flex-wrap gap-2" aria-label="Communication filters">
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
              <p className="font-semibold">No communication items in this view.</p>
              <p className="mt-1">Try another filter or continue with the daily care brief.</p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {visibleItems.map((item) => (
                <article key={item.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`${chipBase} border text-[10px] uppercase ${priorityTone(item.priority)}`}>
                          {priorityLabel(item.priority)}
                        </span>
                        <span className={`${chipBase} border border-gray-200 bg-gray-50 text-[10px] uppercase text-gray-700`}>
                          {item.requestTypeLabel}
                        </span>
                        {item.hasDraft ? (
                          <span className={`${chipBase} border border-sky-200 bg-sky-50 text-[10px] uppercase text-sky-950`}>
                            Draft ready
                          </span>
                        ) : null}
                      </div>
                      <h2 className="mt-2 text-lg font-bold leading-snug text-gray-950">{item.title}</h2>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.reason}</p>
                      <div className="mt-3 rounded-xl border border-brand/15 bg-brand-muted/30 px-3 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-brand-foreground">
                          Recommended next step
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-relaxed text-gray-950">
                          {item.recommendedAction}
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-gray-700">
                        <span className="font-semibold">Latest note: </span>
                        {item.latestNote}
                      </p>
                    </div>

                    <div className="w-full shrink-0 lg:w-80">
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                        <div className="grid gap-2">
                          <span className="inline-flex items-center gap-2">
                            <Phone className="h-4 w-4" aria-hidden />
                            {item.contactLine}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <MessageSquareText className="h-4 w-4" aria-hidden />
                            {item.lastContactLabel}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <Mail className="h-4 w-4" aria-hidden />
                            Next: {item.nextFollowUpLabel}
                          </span>
                          <span className="text-xs font-medium text-gray-500">
                            Owner: {item.ownerLabel}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className={secondaryButtonSm}
                          onClick={() => setOpenItemId((current) => (current === item.id ? null : item.id))}
                        >
                          Log touchpoint
                        </button>
                        <Link href={item.href} className={`${primaryButtonSm} gap-2`}>
                          Open request
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {openItemId === item.id ? (
                    <form
                      className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3"
                      action={(formData) => void saveTouchpoint(item, formData)}
                    >
                      <p className="text-sm font-semibold text-gray-950">Log communication</p>
                      <div className="mt-3 grid gap-3 lg:grid-cols-[12rem_1fr_12rem]">
                        <label className="text-sm font-medium text-gray-700">
                          Method
                          <select
                            name="method"
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
                          Note
                          <input
                            type="text"
                            name="notes"
                            placeholder="Short note for the communication history"
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
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="submit" className={primaryButtonSm} disabled={savingItemId === item.id}>
                          {savingItemId === item.id ? 'Saving...' : 'Save communication'}
                        </button>
                        <button
                          type="button"
                          className={secondaryButtonSm}
                          onClick={() => setOpenItemId(null)}
                          disabled={savingItemId === item.id}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className={secondaryButtonSm}
                          disabled={savingItemId === item.id}
                          onClick={() => {
                            const formData = new FormData()
                            formData.set('nextFollowUpDate', item.currentFollowUpDate)
                            void saveFollowUp(item, formData)
                          }}
                        >
                          Keep follow-up date
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
