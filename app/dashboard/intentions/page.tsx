import { loadMassIntentionsList } from '@/lib/server/loadMassIntentionsList'
import { IntentionsListView } from './IntentionsListView'

export default async function DashboardIntentionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; fulfilled?: string | string[] }>
}) {
  const params = await searchParams
  const result = await loadMassIntentionsList(params)
  return <IntentionsListView {...result} />
}
