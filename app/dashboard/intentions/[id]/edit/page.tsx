import { loadMassIntentionDetail } from '@/lib/server/loadMassIntentionDetail'
import { EditMassIntentionPage } from './EditMassIntentionPage'

export default async function DashboardEditMassIntentionPage({
  params,
}: {
  params: Promise<{ id?: string }>
}) {
  const { id } = await params
  const result = await loadMassIntentionDetail(id)
  return <EditMassIntentionPage {...result} />
}
