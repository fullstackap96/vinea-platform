import { formatGlobalSearchResponse } from '@/lib/globalSearch/formatGlobalSearchResults'
import { loadGlobalSearch } from '@/lib/server/loadGlobalSearch'
import { loadActiveStaffParishSwitcherContext } from '@/lib/server/loadActiveStaffParishSwitcher'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { GlobalSearchResultsView } from '../_components/GlobalSearchResultsView'

export default async function DashboardSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  const params = await searchParams
  const query = String(Array.isArray(params.q) ? params.q[0] : params.q ?? '').trim()

  const parishSwitcher = await loadActiveStaffParishSwitcherContext()
  const activeParishName = parishSwitcher.ok
    ? parishSwitcher.parishes.find((parish) => parish.id === parishSwitcher.activeParishId)?.name ??
      null
    : null

  const supabase = await createSupabaseServerClient()
  const loadResult = await loadGlobalSearch(supabase, query)
  const formatted = formatGlobalSearchResponse(loadResult)

  return (
    <GlobalSearchResultsView
      query={formatted.query}
      results={formatted.results}
      totalCount={formatted.totalCount}
      errorMessage={formatted.errorMessage}
      warningMessage={formatted.warningMessage}
      activeParishName={activeParishName}
    />
  )
}
