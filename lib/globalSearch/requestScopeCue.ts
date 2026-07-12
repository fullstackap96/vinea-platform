export type GlobalSearchRequestScopeCue = {
  title: string
  description: string
  requestEmptyHint: string
  boundaryNote: string
}

function selectedParishLabel(activeParishName: string | null | undefined): string {
  const label = String(activeParishName ?? '').trim()
  return label || 'the selected parish'
}

export function buildGlobalSearchRequestScopeCue({
  activeParishName,
  hasSearched,
  requestResultCount,
}: {
  activeParishName?: string | null
  hasSearched: boolean
  requestResultCount: number
}): GlobalSearchRequestScopeCue {
  const parishLabel = selectedParishLabel(activeParishName)
  const noRequestResults = hasSearched && requestResultCount === 0

  return {
    title: `Request search follows ${parishLabel}`,
    description: `Request matches are limited to requests tied to linked parishioners in ${parishLabel}. Switch parishes to search another authorized parish.`,
    requestEmptyHint: noRequestResults
      ? `If you expected to see a request, confirm it is linked to a parishioner in ${parishLabel}.`
      : 'Search by family name, child name, contact email, household, or sacramental record name.',
    boundaryNote:
      'This note is read-only. It does not link records, change requests, merge people, override parish permissions, or make sacramental decisions.',
  }
}
