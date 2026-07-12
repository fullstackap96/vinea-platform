import { loadSacramentalRecordDetail } from '@/lib/server/loadSacramentalRecordDetail'
import { EditSacramentalRecordPage } from './EditSacramentalRecordPage'

export default async function DashboardEditRecordPage({
  params,
}: {
  params: Promise<{ id?: string }>
}) {
  const { id } = await params
  const result = await loadSacramentalRecordDetail(id)
  const pageKey = [
    result.record?.id ?? 'missing',
    result.record?.person_id ?? 'unlinked',
    result.peopleOptions.map((person) => person.id).join(','),
  ].join(':')

  return <EditSacramentalRecordPage key={pageKey} {...result} />
}
