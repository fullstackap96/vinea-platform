import { loadPersonDetail } from '@/lib/server/loadPersonDetail'
import { PersonDetailPage } from './PersonDetailPage'

export default async function DashboardPersonDetailPage({
  params,
}: {
  params: Promise<{ id?: string }>
}) {
  const { id } = await params
  const result = await loadPersonDetail(id)

  return <PersonDetailPage {...result} />
}
