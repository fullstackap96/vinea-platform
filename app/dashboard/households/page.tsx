import { loadHouseholdsList } from '@/lib/server/loadHouseholdsList'
import { HouseholdsListView } from './HouseholdsListView'

export default async function DashboardHouseholdsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  const params = await searchParams
  const result = await loadHouseholdsList(params)
  return <HouseholdsListView {...result} />
}
