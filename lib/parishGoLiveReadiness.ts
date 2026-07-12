import type { ParishReadinessResult } from '@/lib/parishOnboardingReadiness'

export type ParishGoLiveReadinessStatus = 'setup_in_progress' | 'ready_for_supervised_pilot'

export type ParishMigrationSourcePlan = {
  source: string
  whatToGather: string
  caution: string
}

export type ParishGoLiveReadiness = {
  status: ParishGoLiveReadinessStatus
  headline: string
  summary: string
  nextActions: string[]
  migrationSources: ParishMigrationSourcePlan[]
  manualChecks: string[]
}

const MIGRATION_SOURCES: ParishMigrationSourcePlan[] = [
  {
    source: 'ParishSOFT or ParishStaq/Pushpay',
    whatToGather: 'People, household, sacramental record, ministry/contact, and request-history exports where available.',
    caution: 'Verify sacramental record fields manually; do not rely on a generic export as canonical proof.',
  },
  {
    source: 'PDS, eCatholic, Planning Center, Breeze, or Servant Keeper',
    whatToGather: 'Directory exports, household groupings, communication preferences, volunteer/ministry lists, and sacramental fields if present.',
    caution: 'Map family relationships and sacramental fields carefully before importing.',
  },
  {
    source: 'Spreadsheets or paper trackers',
    whatToGather: 'Column definitions, owner names, follow-up dates, request types, and any handwritten process notes.',
    caution: 'Treat spreadsheet data as operational context, not as final sacramental register authority.',
  },
]

const MANUAL_CHECKS = [
  'Confirm public request forms are tested with safe sample submissions.',
  'Confirm the parish inbox and daily brief recipient are monitored by a real staff member.',
  'Confirm at least one admin and one backup staff user can sign in.',
  'Confirm staff know where to review new requests, follow-ups, documents, and records.',
  'Confirm sacramental register entries are reviewed by authorized parish staff before certificate work.',
]

export function buildParishGoLiveReadiness(input: {
  setupReadiness: ParishReadinessResult
}): ParishGoLiveReadiness {
  const missingSetup = input.setupReadiness.items.filter((item) => !item.complete)

  if (input.setupReadiness.readyToComplete) {
    return {
      status: 'ready_for_supervised_pilot',
      headline: 'Ready for a supervised pilot',
      summary:
        'The core setup checklist is complete. Before live parish use, run a small supervised pilot with safe forms, staff sign-in, intake review, and record lookup.',
      nextActions: [
        'Run one safe sample request for each core intake form the parish plans to use.',
        'Confirm staff can assign ownership, set follow-up dates, and find the request again.',
        'Review the migration source list before importing real parish history.',
      ],
      migrationSources: MIGRATION_SOURCES,
      manualChecks: MANUAL_CHECKS,
    }
  }

  return {
    status: 'setup_in_progress',
    headline: 'Finish setup before migration',
    summary:
      'The parish is not ready for a go-live pilot yet. Complete the missing setup items first, then use the migration checklist to prepare clean source data.',
    nextActions:
      missingSetup.length > 0
        ? missingSetup.slice(0, 4).map((item) => `Finish: ${item.label}.`)
        : ['Review setup and refresh this page before planning migration.'],
    migrationSources: MIGRATION_SOURCES,
    manualChecks: MANUAL_CHECKS,
  }
}
