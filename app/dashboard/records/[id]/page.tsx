import { loadSacramentalRecordDetail } from '@/lib/server/loadSacramentalRecordDetail'
import { RecordDetailPage } from './RecordDetailPage'

export default async function DashboardRecordDetailPage({
  params,
}: {
  params: Promise<{ id?: string }>
}) {
  const { id } = await params
  const result = await loadSacramentalRecordDetail(id)

  return <RecordDetailPage {...result} />
}
