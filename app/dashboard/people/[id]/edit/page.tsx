import { loadPersonDetail } from '@/lib/server/loadPersonDetail'
import { EditPersonPage } from './EditPersonPage'

export default async function DashboardEditPersonPage({
  params,
}: {
  params: Promise<{ id?: string }>
}) {
  const { id } = await params
  const result = await loadPersonDetail(id)

  return <EditPersonPage {...result} />
}
