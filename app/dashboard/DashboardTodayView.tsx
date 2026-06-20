'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { CheckCircle2, HeartHandshake, MessageCircleReply, PauseCircle } from 'lucide-react'
import { RequestTypeBadge } from '@/app/_components/RequestTypeBadge'
import { primaryButtonMd, secondaryButtonSm } from '@/lib/buttonStyles'
import { chipBase } from '@/lib/chipStyles'
import type { CareCadenceResult } from '@/lib/careCadence'
import type {
  CommunicationCommitmentEvaluation,
  CommunicationCommitmentQueue,
} from '@/lib/communicationCommitments'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import type { StaffCommandCenterResult } from '@/lib/staffCommandCenter'
import { vineaEmptyStateClassName, vineaSectionShellClassName } from '@/lib/vineaUi'
import type { CareCadenceSlaRules } from '@/lib/careCadence'

type TodayCard = {
  key: string
  title: string
  count: number
  emptyText: string
  icon: ReactNode
  item:
    | {
        requestType: string
        personLabel: string
        summary: string
        href: string
        actionLabel: string
        chipLabel: string
      }
    | null
}

function commitmentPerson(row: CommunicationCommitmentEvaluation): string {
  return row.personLabel
}

function blockedCardItem(
  staffCommandCenter: StaffCommandCenterResult,
  communicationCommitments: CommunicationCommitmentQueue
): TodayCard['item'] {
  const blocked = staffCommandCenter.rows.find((row) => row.bucket === 'blocked')
  if (blocked) {
    return {
      requestType: blocked.requestType,
      personLabel: String(
        blocked.request.parishioner?.full_name ||
          blocked.request.child_name ||
          blocked.request.funeral_detail?.deceased_name ||
          blocked.request.wedding_detail?.partner_one_name ||
          'Request'
      ),
      summary: `Waiting on ${blocked.blockerLabel.toLowerCase()}.`,
      href: blocked.detailHref,
      actionLabel: 'Review blocker',
      chipLabel: blocked.bucketLabel,
    }
  }

  const waiting = communicationCommitments.rows.find(
    (row) => row.status === 'waiting_on_family' || row.status === 'internal_decision'
  )
  if (!waiting) return null
  return {
    requestType: waiting.requestType,
    personLabel: commitmentPerson(waiting),
    summary: waiting.reason,
    href: waiting.detailHref,
    actionLabel: 'Open request',
    chipLabel: waiting.status === 'internal_decision' ? 'Staff decision' : 'Waiting on family',
  }
}

function TodayWorkCard({ card }: { card: TodayCard }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-700 ring-1 ring-gray-100"
            aria-hidden
          >
            {card.icon}
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-snug text-gray-950">{card.title}</h3>
            <p className="text-sm text-gray-600">
              {card.count === 0 ? 'Clear' : `${card.count} ${card.count === 1 ? 'item' : 'items'}`}
            </p>
          </div>
        </div>
      </div>

      {card.item ? (
        <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <RequestTypeBadge requestType={card.item.requestType} />
            <span className={`${chipBase} border-gray-200 bg-white text-gray-700`}>
              {card.item.chipLabel}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold leading-snug text-gray-950">
            {card.item.personLabel}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">{card.item.summary}</p>
          <Link href={card.item.href} className={`${secondaryButtonSm} mt-3 justify-center`}>
            {card.item.actionLabel}
          </Link>
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-3 text-sm leading-relaxed text-emerald-950">
          {card.emptyText}
        </p>
      )}
    </div>
  )
}

export function DashboardTodayView({
  careCadence,
  communicationCommitments,
  staffCommandCenter,
  loading,
  dataUnavailable,
  slaRules,
}: {
  careCadence: CareCadenceResult
  communicationCommitments: CommunicationCommitmentQueue
  staffCommandCenter: StaffCommandCenterResult
  loading: boolean
  dataUnavailable: boolean
  slaRules?: CareCadenceSlaRules
}) {
  const careItem = careCadence.rows[0]
  const replyItem =
    communicationCommitments.rows.find((row) => row.status === 'staff_owes_family') ??
    communicationCommitments.rows.find((row) => row.status === 'no_recent_contact') ??
    null
  const blockedItem = blockedCardItem(staffCommandCenter, communicationCommitments)

  const needsCareCount = careCadence.summary.needsCareToday
  const repliesCount = communicationCommitments.summary.repliesOwed
  const waitingCount =
    staffCommandCenter.summary.blocked +
    communicationCommitments.summary.internalDecisions +
    communicationCommitments.summary.waitingOnFamily
  const totalAreas = [needsCareCount, repliesCount, waitingCount].filter((count) => count > 0).length

  const cards: TodayCard[] = [
    {
      key: 'care',
      title: 'Families to contact',
      count: needsCareCount,
      emptyText: 'No families need urgent pastoral follow-up right now.',
      icon: <HeartHandshake className="h-5 w-5" strokeWidth={2} />,
      item: careItem
        ? {
            requestType: careItem.requestType,
            personLabel: careItem.personLabel,
            summary: careItem.reason,
            href: careItem.detailHref,
            actionLabel: 'Work care step',
            chipLabel: careItem.level === 'urgent' ? 'Urgent' : 'Needs care',
          }
        : null,
    },
    {
      key: 'replies',
      title: 'Replies owed',
      count: repliesCount,
      emptyText: 'You are caught up on family replies.',
      icon: <MessageCircleReply className="h-5 w-5" strokeWidth={2} />,
      item: replyItem
        ? {
            requestType: replyItem.requestType,
            personLabel: replyItem.personLabel,
            summary: replyItem.reason,
            href: replyItem.detailHref,
            actionLabel: 'Work reply',
            chipLabel: replyItem.status === 'no_recent_contact' ? 'Check in' : 'Reply owed',
          }
        : null,
    },
    {
      key: 'waiting',
      title: 'Blocked or waiting',
      count: waitingCount,
      emptyText: 'No urgent blockers are waiting on staff or families.',
      icon: <PauseCircle className="h-5 w-5" strokeWidth={2} />,
      item: blockedItem,
    },
  ]

  return (
    <section
      className={vineaSectionShellClassName}
      aria-labelledby="today-view-heading"
      aria-busy={loading}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Today
          </p>
          <h2 id="today-view-heading" className={`${sectionHeadingClassName} mt-1`}>
            Start here
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            The clearest next steps for the parish office today.
          </p>
          {slaRules?.firstContactDays ? (
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              Response targets: funeral first contact within{' '}
              {slaRules.firstContactDays.funeral ?? 1} day
              {(slaRules.firstContactDays.funeral ?? 1) === 1 ? '' : 's'}, baptism within{' '}
              {slaRules.firstContactDays.baptism ?? 3} days, wedding within{' '}
              {slaRules.firstContactDays.wedding ?? 2} days, OCIA within{' '}
              {slaRules.firstContactDays.ocia ?? 3} days.
            </p>
          ) : null}
        </div>
        {!loading && !dataUnavailable ? (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              totalAreas > 0
                ? 'border-amber-200 bg-amber-50 text-amber-950'
                : 'border-emerald-200 bg-emerald-50 text-emerald-950'
            }`}
            role="status"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              <p className="font-semibold">
                {totalAreas > 0
                  ? `${totalAreas} ${totalAreas === 1 ? 'area needs' : 'areas need'} attention`
                  : 'Nothing urgent needs attention'}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-4">
              <div className="h-5 w-40 rounded bg-gray-200" />
              <div className="mt-4 h-20 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : dataUnavailable ? (
        <div className={vineaEmptyStateClassName} role="alert">
          <p className="text-base font-semibold text-gray-900">Today view is unavailable.</p>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
            It will appear after request data loads successfully.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {cards.map((card) => (
              <TodayWorkCard key={card.key} card={card} />
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="/dashboard/requests" className={`${primaryButtonMd} justify-center`}>
              Work today&apos;s list
            </Link>
            <a href="#staff-command-center-heading" className={`${secondaryButtonSm} justify-center`}>
              See detailed queue
            </a>
          </div>
        </>
      )}
    </section>
  )
}
