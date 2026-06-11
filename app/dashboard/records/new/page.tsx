import { Suspense } from 'react'
import { NewSacramentalRecordPage } from './NewSacramentalRecordPage'

export default function DashboardNewRecordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center px-4" aria-busy="true">
          <p className="text-sm font-medium text-gray-700">Loading new record…</p>
        </div>
      }
    >
      <NewSacramentalRecordPage />
    </Suspense>
  )
}
