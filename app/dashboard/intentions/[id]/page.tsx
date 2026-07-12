import { loadMassIntentionDetail } from '@/lib/server/loadMassIntentionDetail'
import { MassIntentionDetailPage } from './MassIntentionDetailPage'

export default async function DashboardMassIntentionDetailPage({
  params,
}: {
  params: Promise<{ id?: string }>
}) {
  const { id } = await params
  const result = await loadMassIntentionDetail(id)
  return <MassIntentionDetailPage {...result} />
}
