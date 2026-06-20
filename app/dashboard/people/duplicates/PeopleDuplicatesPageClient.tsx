'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, GitMerge, RefreshCw } from 'lucide-react'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import { formatPersonDateOfBirthDisplay, formatPersonDisplayName } from '@/lib/people'
import { vineaSectionShellClassName } from '@/lib/vineaUi'
import type { PersonDuplicateConfidence } from '@/lib/personDuplicateReview'
import type { PersonRow } from '@/lib/types/people'

type LinkCounts = {
  requests: number
  records: number
  households: number
}

type DuplicatePerson = PersonRow & {
  linkCounts: LinkCounts
}

type DuplicateCandidate = {
  id: string
  confidence: PersonDuplicateConfidence
  score: number
  reasons: string[]
  people: [DuplicatePerson, DuplicatePerson]
}

type StatusState =
  | { kind: 'idle'; message: string }
  | { kind: 'loading'; message: string }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string }

const FIELD_LABELS: { key: MergeField; label: string }[] = [
  { key: 'first_name', label: 'First name' },
  { key: 'middle_name', label: 'Middle name' },
  { key: 'last_name', label: 'Last name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'date_of_birth', label: 'Date of birth' },
  { key: 'notes', label: 'Notes' },
]

type MergeField = keyof Pick<
  PersonRow,
  'first_name' | 'middle_name' | 'last_name' | 'email' | 'phone' | 'date_of_birth' | 'notes'
>

function valueFor(person: PersonRow, field: MergeField): string {
  const value = person[field]
  if (field === 'date_of_birth') return formatPersonDateOfBirthDisplay(value)
  return String(value ?? '').trim()
}

function defaultSelections(candidate: DuplicateCandidate, canonicalPersonId: string) {
  const [a, b] = candidate.people
  const other = canonicalPersonId === a.id ? b : a
  const canonical = canonicalPersonId === a.id ? a : b

  return FIELD_LABELS.reduce<Record<string, string>>((next, field) => {
    const canonicalValue = valueFor(canonical, field.key)
    const otherValue = valueFor(other, field.key)
    next[field.key] = canonicalValue || !otherValue ? canonical.id : other.id
    return next
  }, { notes: 'combine' })
}

function confidenceClass(confidence: PersonDuplicateConfidence) {
  if (confidence === 'high') return 'bg-red-50 text-red-800 border-red-200'
  if (confidence === 'medium') return 'bg-amber-50 text-amber-900 border-amber-200'
  return 'bg-slate-100 text-slate-800 border-slate-200'
}

function totalLinks(person: DuplicatePerson) {
  return person.linkCounts.households + person.linkCounts.records + person.linkCounts.requests
}

export function PeopleDuplicatesPageClient() {
  const [candidates, setCandidates] = useState<DuplicateCandidate[]>([])
  const [selectedCandidateId, setSelectedCandidateId] = useState('')
  const [canonicalPersonId, setCanonicalPersonId] = useState('')
  const [selectedFields, setSelectedFields] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<StatusState>({
    kind: 'idle',
    message: 'Load possible duplicates to begin cleanup.',
  })

  const selectedCandidate = useMemo(
    () => candidates.find((candidate) => candidate.id === selectedCandidateId) ?? null,
    [candidates, selectedCandidateId]
  )

  async function loadCandidates() {
    setStatus({ kind: 'loading', message: 'Looking for possible duplicate people...' })
    const res = await fetch('/api/people/duplicates', { credentials: 'include' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data?.ok) {
      setStatus({ kind: 'error', message: data?.error ?? 'Could not load duplicate review.' })
      return
    }

    const nextCandidates = Array.isArray(data.candidates) ? data.candidates : []
    setCandidates(nextCandidates)
    const first = nextCandidates[0] as DuplicateCandidate | undefined
    if (first) {
      const preferred = totalLinks(first.people[0]) >= totalLinks(first.people[1])
        ? first.people[0].id
        : first.people[1].id
      setSelectedCandidateId(first.id)
      setCanonicalPersonId(preferred)
      setSelectedFields(defaultSelections(first, preferred))
      setStatus({
        kind: 'success',
        message: `${nextCandidates.length} possible duplicate pair${
          nextCandidates.length === 1 ? '' : 's'
        } found.`,
      })
    } else {
      setSelectedCandidateId('')
      setCanonicalPersonId('')
      setSelectedFields({})
      setStatus({ kind: 'success', message: 'No likely duplicate people found right now.' })
    }
  }

  function selectCandidate(candidate: DuplicateCandidate) {
    const preferred = totalLinks(candidate.people[0]) >= totalLinks(candidate.people[1])
      ? candidate.people[0].id
      : candidate.people[1].id
    setSelectedCandidateId(candidate.id)
    setCanonicalPersonId(preferred)
    setSelectedFields(defaultSelections(candidate, preferred))
  }

  function selectCanonical(candidate: DuplicateCandidate, personId: string) {
    setCanonicalPersonId(personId)
    setSelectedFields(defaultSelections(candidate, personId))
  }

  async function mergeSelected() {
    if (!selectedCandidate || !canonicalPersonId) return
    const duplicate = selectedCandidate.people.find((person) => person.id !== canonicalPersonId)
    if (!duplicate) return

    const confirmed = window.confirm(
      `Merge ${formatPersonDisplayName(duplicate)} into the selected profile? This will move linked records and remove the duplicate profile.`
    )
    if (!confirmed) return

    setStatus({ kind: 'loading', message: 'Merging duplicate profile...' })
    const res = await fetch('/api/people/duplicates', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        canonicalPersonId,
        duplicatePersonId: duplicate.id,
        selectedFields,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data?.ok) {
      setStatus({ kind: 'error', message: data?.error ?? 'Could not merge these people.' })
      return
    }
    setStatus({ kind: 'success', message: 'Profiles merged. Refreshing duplicate review...' })
    await loadCandidates()
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <p className="mb-3">
        <Link
          href="/dashboard/people"
          className="text-sm font-medium text-blue-800 underline underline-offset-2"
        >
          Back to people
        </Link>
      </p>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Duplicate review
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            Clean up imported people records without losing household links, requests, or
            sacramental records.
          </p>
        </div>
        <button type="button" onClick={loadCandidates} className={`${primaryButtonMd} gap-2`}>
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
              Start by finding duplicates. Vinea will look for matching names, emails, phone
              numbers, and birthdates.
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
                      {formatPersonDisplayName(candidate.people[0])}
                    </p>
                    <p className="text-sm text-gray-600">
                      and {formatPersonDisplayName(candidate.people[1])}
                    </p>
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
                    Choose the profile to keep, then choose which values should survive.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={mergeSelected}
                  disabled={!canonicalPersonId || status.kind === 'loading'}
                  className={`${primaryButtonMd} gap-2`}
                >
                  <GitMerge className="h-4 w-4" aria-hidden />
                  Merge profiles
                </button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {selectedCandidate.people.map((person) => (
                  <PersonChoiceCard
                    key={person.id}
                    person={person}
                    checked={canonicalPersonId === person.id}
                    onChoose={() => selectCanonical(selectedCandidate, person.id)}
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
                      people={selectedCandidate.people}
                      value={selectedFields[field.key] ?? canonicalPersonId}
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

function PersonChoiceCard({
  person,
  checked,
  onChoose,
}: {
  person: DuplicatePerson
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
            Keep {formatPersonDisplayName(person)}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-gray-600">
            {person.email || person.phone || 'No contact info'}
          </span>
          <span className="mt-3 block text-xs font-medium text-gray-500">
            {person.linkCounts.requests} requests, {person.linkCounts.records} records,{' '}
            {person.linkCounts.households} households
          </span>
        </span>
      </span>
    </label>
  )
}

function FieldChooser({
  field,
  label,
  people,
  value,
  onChange,
}: {
  field: MergeField
  label: string
  people: [DuplicatePerson, DuplicatePerson]
  value: string
  onChange: (next: string) => void
}) {
  return (
    <div className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[10rem_minmax(0,1fr)]">
      <div className="font-medium text-gray-700">{label}</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {people.map((person) => (
          <label key={`${field}-${person.id}`} className="flex gap-2 rounded-lg border border-gray-200 p-2">
            <input
              type="radio"
              name={`field-${field}`}
              checked={value === person.id}
              onChange={() => onChange(person.id)}
              className="mt-1 h-4 w-4 accent-brand"
            />
            <span className="min-w-0">
              <span className="block break-words font-medium text-gray-900">
                {valueFor(person, field) || 'Blank'}
              </span>
              <span className="block truncate text-xs text-gray-500">
                from {formatPersonDisplayName(person)}
              </span>
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
