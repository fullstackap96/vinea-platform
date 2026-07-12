import { loadHouseholdDetail } from '@/lib/server/loadHouseholdDetail'
import { EditHouseholdPage } from './EditHouseholdPage'

export default async function DashboardEditHouseholdPage({
  params,
}: {
  params: Promise<{ id?: string }>
}) {
  const { id } = await params
  const result = await loadHouseholdDetail(id)
  const pageKey = [
    result.household?.id ?? 'missing',
    result.members.map((member) => member.id).join(','),
    result.peopleOptions.map((person) => person.id).join(','),
  ].join(':')

  return <EditHouseholdPage key={pageKey} {...result} />
}
