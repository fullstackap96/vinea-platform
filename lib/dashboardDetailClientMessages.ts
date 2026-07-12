export type DashboardDetailSurface = 'person' | 'household' | 'sacramentalRecord'

const loadFailureMessages: Record<DashboardDetailSurface, string> = {
  person: 'Could not load this person.',
  household: 'Could not load this household.',
  sacramentalRecord: 'Could not load this record.',
}

const partialDataMessages: Record<DashboardDetailSurface, string> = {
  person:
    'Some linked person details may be missing. Please refresh if this profile looks incomplete.',
  household:
    'Some linked household details may be missing. Please refresh if this household looks incomplete.',
  sacramentalRecord:
    'Some linked record details may be missing. Please refresh if this record looks incomplete.',
}

export function dashboardDetailLoadFailureMessage(surface: DashboardDetailSurface): string {
  return loadFailureMessages[surface]
}

export function dashboardDetailPartialDataMessage(surface: DashboardDetailSurface): string {
  return partialDataMessages[surface]
}
