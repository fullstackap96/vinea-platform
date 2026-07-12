import { loadHouseholdDetail } from '@/lib/server/loadHouseholdDetail'
import { HouseholdDetailPage } from './HouseholdDetailPage'

export default async function DashboardHouseholdDetailPage({
  params,
}: {
  params: Promise<{ id?: string }>
}) {
  const { id } = await params
  const result = await loadHouseholdDetail(id)

  return <HouseholdDetailPage {...result} />
}
