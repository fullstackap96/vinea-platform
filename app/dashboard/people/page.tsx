import { loadPeopleList } from '@/lib/server/loadPeopleList'
import { PeopleListView } from './PeopleListView'

export default async function DashboardPeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  const params = await searchParams
  const result = await loadPeopleList(params)
  return <PeopleListView {...result} />
}
