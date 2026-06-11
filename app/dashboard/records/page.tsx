import { loadSacramentalRecordsList } from '@/lib/server/loadSacramentalRecordsList'
import { RecordsListView } from './RecordsListView'

export default async function DashboardRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; type?: string | string[] }>
}) {
  const params = await searchParams
  const result = await loadSacramentalRecordsList(params)
  return <RecordsListView {...result} />
}
