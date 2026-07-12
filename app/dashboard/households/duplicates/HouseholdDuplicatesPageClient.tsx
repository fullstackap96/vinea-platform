'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, GitMerge, RefreshCw } from 'lucide-react'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import { formatHouseholdAddressLine } from '@/lib/households'
import { duplicateReviewClientErrorMessage } from '@/lib/duplicateReviewClientMessages'
import type { HouseholdDuplicateConfidence } from '@/lib/householdDuplicateReview'
import type { HouseholdRow } from '@/lib/types/households'
import { vineaSectionShellClassName } from '@/lib/vineaUi'
import { VineaConfirmDialog } from '@/app/dashboard/_components/VineaConfirmDialog'

type MemberCounts = {
  members: number
  primaryContacts: number
}

type DuplicateHousehold = HouseholdRow & {
  memberCounts: MemberCounts
}

type DuplicateCandidate = {
  id: string
  confidence: HouseholdDuplicateConfidence
  score: number
  reasons: string[]
  households: [DuplicateHousehold, DuplicateHousehold]
}

type StatusState =
  | { kind: 'idle'; message: string }
  | { kind: 'loading'; message: string }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string }

const DUPLICATE_REVIEW_LOAD_TIMEOUT_MS = 20_000
const DUPLICATE_REVIEW_MERGE_TIMEOUT_MS = 120_000

type MergeField = keyof Pick<
  HouseholdRow,
  'name' | 'address' | 'city' | 'state' | 'postal_code' | 'notes'
>

const FIELD_LABELS: { key: MergeField; label: string }[] = [
  { key: 'name', label: 'Household name' },
  { key: 'address', label: 'Street address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'postal_code', label: 'ZIP / postal code' },
  { key: 'notes', label: 'Notes' },
]

function valueFor(household: HouseholdRow, field: MergeField): string {
  return String(household[field] ?? '').trim()
}

function defaultSelections(candidate: DuplicateCandidate, canonicalHouseholdId: string) {
  const [a, b] = candidate.households
  const other = canonicalHouseholdId === a.id ? b : a
  const canonical = canonicalHouseholdId === a.id ? a : b

  return FIELD_LABELS.reduce<Record<string, string>>((next, field) => {
    const canonicalValue = valueFor(canonical, field.key)
    const otherValue = valueFor(other, field.key)
    next[field.key] = canonicalValue || !otherValue ? canonical.id : other.id
    return next
  }, { notes: 'combine' })
}

function confidenceClass(confidence: HouseholdDuplicateConfidence) {
  if (confidence === 'high') return 'bg-red-50 text-red-800 border-red-200'
  if (confidence === 'medium') return 'bg-amber-50 text-amber-900 border-amber-200'
  return 'bg-slate-100 text-slate-800 border-slate-200'
}

export function HouseholdDuplicatesPageClient({
  activeParishName = null,
}: {
  activeParishName?: string | null
}) {
  const [candidates, setCandidates] = useState<DuplicateCandidate[]>([])
  const [selectedCandidateId, setSelectedCandidateId] = useState('')
  const [canonicalHouseholdId, setCanonicalHouseholdId] = useState('')
  const [selectedFields, setSelectedFields] = useState<Record<string, string>>({})
  const [mergeConfirmationOpen, setMergeConfirmationOpen] = useState(false)
  const operationInFlightRef = useRef<'load' | 'merge' | null>(null)
  const [reviewRequiresRefresh, setReviewRequiresRefresh] = useState(false)
  const [status, setStatus] = useState<StatusState>({
    kind: 'idle',
    message: 'Load possible duplicate households to begin cleanup.',
  })

  const selectedCandidate = useMemo(
    () => candidates.find((candidate) => candidate.id === selectedCandidateId) ?? null,
    [candidates, selectedCandidateId]
  )

  async function loadCandidatesCore(afterConfirmedMerge = false) {
    setStatus({ kind: 'loading', message: 'Looking for possible duplicate households...' })
    try {
      const res = await fetch('/api/households/duplicates', {
        credentials: 'include',
        signal: AbortSignal.timeout(DUPLICATE_REVIEW_LOAD_TIMEOUT_MS),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        if (afterConfirmedMerge) setReviewRequiresRefresh(true)
        setStatus({
          kind: 'error',
          message: afterConfirmedMerge
            ? 'Households were merged, but duplicate review could not refresh. Refresh this page before merging again.'
            : duplicateReviewClientErrorMessage('loadHouseholds', data?.error),
        })
        return
      }

      const nextCandidates = Array.isArray(data.candidates) ? data.candidates : []
      setReviewRequiresRefresh(false)
      setCandidates(nextCandidates)
      const first = nextCandidates[0] as DuplicateCandidate | undefined
      if (first) {
        const preferred =
          first.households[0].memberCounts.members >= first.households[1].memberCounts.members
            ? first.households[0].id
            : first.households[1].id
        setSelectedCandidateId(first.id)
        setCanonicalHouseholdId(preferred)
        setSelectedFields(defaultSelections(first, preferred))
        setStatus({
          kind: 'success',
          message: `${nextCandidates.length} possible duplicate household pair${
            nextCandidates.length === 1 ? '' : 's'
          } found.`,
        })
      } else {
        setSelectedCandidateId('')
        setCanonicalHouseholdId('')
        setSelectedFields({})
        setStatus({ kind: 'success', message: 'No likely duplicate households found right now.' })
      }
    } catch (error: unknown) {
      if (afterConfirmedMerge) setReviewRequiresRefresh(true)
      setStatus({
        kind: 'error',
        message: afterConfirmedMerge
          ? 'Households were merged, but duplicate review could not refresh. Refresh this page before merging again.'
          : duplicateReviewClientErrorMessage('loadHouseholds', error),
      })
    }
  }

  async function loadCandidates() {
    if (operationInFlightRef.current) return

    operationInFlightRef.current = 'load'
    try {
      await loadCandidatesCore()
    } finally {
      operationInFlightRef.current = null
    }
  }

  function selectCandidate(candidate: DuplicateCandidate) {
    const preferred =
      candidate.households[0].memberCounts.members >= candidate.households[1].memberCounts.members
        ? candidate.households[0].id
        : candidate.households[1].id
    setSelectedCandidateId(candidate.id)
    setCanonicalHouseholdId(preferred)
    setSelectedFields(defaultSelections(candidate, preferred))
  }

  function selectCanonical(candidate: DuplicateCandidate, householdId: string) {
    setCanonicalHouseholdId(householdId)
    setSelectedFields(defaultSelections(candidate, householdId))
  }

  function requestMerge() {
    if (
      reviewRequiresRefresh ||
      !selectedCandidate ||
      !canonicalHouseholdId ||
      status.kind === 'loading'
    ) return
    setMergeConfirmationOpen(true)
  }

  async function mergeSelected() {
    if (
      operationInFlightRef.current ||
      reviewRequiresRefresh ||
      !selectedCandidate ||
      !canonicalHouseholdId
    ) return
    const duplicate = selectedCandidate.households.find(
      (household) => household.id !== canonicalHouseholdId
    )
    if (!duplicate) return

    operationInFlightRef.current = 'merge'
    setMergeConfirmationOpen(false)
    setStatus({ kind: 'loading', message: 'Merging duplicate household...' })
    try {
      const res = await fetch('/api/households/duplicates', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canonicalHouseholdId,
          duplicateHouseholdId: duplicate.id,
          selectedFields,
        }),
        signal: AbortSignal.timeout(DUPLICATE_REVIEW_MERGE_TIMEOUT_MS),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus({ kind: 'error', message: duplicateReviewClientErrorMessage('mergeHouseholds', data?.error) })
        return
      }
      if (data?.ok !== true) {
        setReviewRequiresRefresh(true)
        setStatus({
          kind: 'error',
          message:
            'Vinea could not confirm whether the households were merged. Refresh duplicate review before trying again.',
        })
        return
      }
      setStatus({ kind: 'success', message: 'Households merged. Refreshing duplicate review...' })
      await loadCandidatesCore(true)
    } catch {
      setReviewRequiresRefresh(true)
      setStatus({
        kind: 'error',
        message:
          'Vinea could not confirm whether the households were merged. Refresh duplicate review before trying again.',
      })
    } finally {
      operationInFlightRef.current = null
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <p className="mb-3">
        <Link
          href="/dashboard/households"
          className="text-sm font-medium text-blue-800 underline underline-offset-2"
        >
          Back to households
        </Link>
      </p>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Household duplicate review
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            Clean up duplicate household records while preserving members and primary contacts.
          </p>
          {activeParishName ? (
            <p className="mt-2 inline-flex max-w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm">
              <span className="truncate">
                Household duplicate review is scoped to{' '}
                <span className="font-semibold text-gray-900">{activeParishName}</span>.
              </span>
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={loadCandidates}
          disabled={status.kind === 'loading'}
          aria-busy={status.kind === 'loading'}
          className={`${primaryButtonMd} gap-2`}
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Find duplicates
        </button>
      </header>

      <StatusBanner status={status} />

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(18rem,0.75fr)_minmax(0,1.25fr)]">
        <section className={vineaSectionShellClassName}>
          <h2 className="text-lg font-semibold text-gray-900">Possible matches</h2>
          {candidates.length === 0 ? (
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Start by finding duplicates. Vinea will look for similar household names and matching
              addresses.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {candidates.map((candidate) => (
                <li key={candidate.id}>
                  <button
                    type="button"
                    onClick={() => selectCandidate(candidate)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      candidate.id === selectedCandidateId
                        ? 'border-brand bg-brand/5 ring-1 ring-brand/20'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${confidenceClass(candidate.confidence)}`}
                      >
                        {candidate.confidence} confidence
                      </span>
                      <span className="text-xs font-medium text-gray-500">
                        Score {candidate.score}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {candidate.households[0].name}
                    </p>
                    <p className="text-sm text-gray-600">and {candidate.households[1].name}</p>
                    <p className="mt-2 text-xs text-gray-500">{candidate.reasons.join(', ')}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={vineaSectionShellClassName}>
          {!selectedCandidate ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-10 text-center">
              <GitMerge className="mx-auto h-8 w-8 text-gray-400" aria-hidden />
              <p className="mt-2 text-sm font-medium text-gray-800">
                Choose a possible match to review.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Merge decision</h2>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    Choose the household to keep, then choose which details should survive.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={requestMerge}
                  disabled={
                    reviewRequiresRefresh || !canonicalHouseholdId || status.kind === 'loading'
                  }
                  className={`${primaryButtonMd} gap-2`}
                >
                  <GitMerge className="h-4 w-4" aria-hidden />
                  Merge households
                </button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {selectedCandidate.households.map((household) => (
                  <HouseholdChoiceCard
                    key={household.id}
                    household={household}
                    checked={canonicalHouseholdId === household.id}
                    onChoose={() => selectCanonical(selectedCandidate, household.id)}
                  />
                ))}
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 bg-slate-50 px-4 py-3">
                  <h3 className="text-sm font-semibold text-gray-900">Fields to keep</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {FIELD_LABELS.map((field) => (
                    <FieldChooser
                      key={field.key}
                      field={field.key}
                      label={field.label}
                      households={selectedCandidate.households}
                      value={selectedFields[field.key] ?? canonicalHouseholdId}
                      onChange={(next) =>
                        setSelectedFields((current) => ({ ...current, [field.key]: next }))
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <VineaConfirmDialog
        open={mergeConfirmationOpen}
        title="Merge these households?"
        description={
          selectedCandidate && canonicalHouseholdId
            ? `Vinea will keep ${
                selectedCandidate.households.find(
                  (household) => household.id === canonicalHouseholdId
                )?.name ?? selectedCandidate.households[0].name
              }, move members and primary-contact relationships, then remove the duplicate household.`
            : ''
        }
        confirmLabel="Merge households"
        busy={status.kind === 'loading'}
        busyLabel="Merging..."
        onCancel={() => setMergeConfirmationOpen(false)}
        onConfirm={() => void mergeSelected()}
      />
    </main>
  )
}

function StatusBanner({ status }: { status: StatusState }) {
  const className =
    status.kind === 'error'
      ? 'border-red-200 bg-red-50 text-red-950'
      : status.kind === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
        : status.kind === 'loading'
          ? 'border-blue-200 bg-blue-50 text-blue-950'
          : 'border-gray-200 bg-white text-gray-700'
  const icon =
    status.kind === 'error' ? (
      <AlertCircle className="h-5 w-5 shrink-0 text-red-700" aria-hidden />
    ) : status.kind === 'success' ? (
      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden />
    ) : (
      <GitMerge className="h-5 w-5 shrink-0 text-brand" aria-hidden />
    )
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${className}`}>
      <div className="flex gap-3">
        {icon}
        <p className="font-medium">{status.message}</p>
      </div>
    </div>
  )
}

function HouseholdChoiceCard({
  household,
  checked,
  onChoose,
}: {
  household: DuplicateHousehold
  checked: boolean
  onChoose: () => void
}) {
  return (
    <label
      className={`block cursor-pointer rounded-xl border p-4 ${
        checked ? 'border-brand bg-brand/5 ring-1 ring-brand/20' : 'border-gray-200 bg-white'
      }`}
    >
      <span className="flex items-start gap-3">
        <input
          type="radio"
          checked={checked}
          onChange={onChoose}
          className="mt-1 h-4 w-4 accent-brand"
        />
        <span>
          <span className="block text-sm font-semibold text-gray-900">
            Keep {household.name}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-gray-600">
            {formatHouseholdAddressLine(household) || 'No address on file'}
          </span>
          <span className="mt-3 block text-xs font-medium text-gray-500">
            {household.memberCounts.members} members, {household.memberCounts.primaryContacts}{' '}
            primary contact{household.memberCounts.primaryContacts === 1 ? '' : 's'}
          </span>
        </span>
      </span>
    </label>
  )
}

function FieldChooser({
  field,
  label,
  households,
  value,
  onChange,
}: {
  field: MergeField
  label: string
  households: [DuplicateHousehold, DuplicateHousehold]
  value: string
  onChange: (next: string) => void
}) {
  return (
    <div className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[10rem_minmax(0,1fr)]">
      <div className="font-medium text-gray-700">{label}</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {households.map((household) => (
          <label
            key={`${field}-${household.id}`}
            className="flex gap-2 rounded-lg border border-gray-200 p-2"
          >
            <input
              type="radio"
              name={`field-${field}`}
              checked={value === household.id}
              onChange={() => onChange(household.id)}
              className="mt-1 h-4 w-4 accent-brand"
            />
            <span className="min-w-0">
              <span className="block break-words font-medium text-gray-900">
                {valueFor(household, field) || 'Blank'}
              </span>
              <span className="block truncate text-xs text-gray-500">from {household.name}</span>
            </span>
          </label>
        ))}
        {field === 'notes' ? (
          <button
            type="button"
            onClick={() => onChange('combine')}
            className={`${value === 'combine' ? primaryButtonMd : secondaryButtonMd} sm:col-span-2`}
          >
            Combine both notes
          </button>
        ) : null}
      </div>
    </div>
  )
}
