import { formatRequestType } from '@/lib/formatRequestType'
import { loadFamilyPortalByToken } from '@/lib/server/requestPortalTokens'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { FamilyRequestDocumentsPortal } from './FamilyRequestDocumentsPortal'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ token: string }>
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

function ExpiredPortalMessage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Vinea document portal</p>
        <h1 className="mt-3 text-2xl font-semibold text-gray-950">This link is not available</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          The document upload link may have expired or been replaced. Please contact the parish
          office and ask for a new upload link.
        </p>
      </section>
    </main>
  )
}

export default async function FamilyRequestPortalPage({ params }: PageProps) {
  const { token } = await params
  const admin = createSupabaseServiceRoleClient()
  const portal = await loadFamilyPortalByToken(admin, token)

  if (!portal) return <ExpiredPortalMessage />

  const requestLabel = formatRequestType(portal.request.request_type) || 'Request'
  const hasSteps = portal.familySteps.length > 0

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <header className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {portal.parish.name}
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-gray-950 sm:text-3xl">
            Upload documents for your {requestLabel.toLowerCase()} request
          </h1>
          <div className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Contact</p>
              <p className="mt-1">{portal.request.contact_name || 'Family'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Request</p>
              <p className="mt-1">
                {requestLabel}
                {portal.request.child_name ? ` for ${portal.request.child_name}` : ''}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Link expires
              </p>
              <p className="mt-1">{formatDate(portal.token.expires_at)}</p>
            </div>
          </div>
        </header>

        <section className="mt-5 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-relaxed text-sky-950">
          Uploaded files go directly to the parish office for review. If you are not sure which file
          to send, upload the closest matching document or contact the parish office.
        </section>

        <div className="mt-5">
          {hasSteps ? (
            <FamilyRequestDocumentsPortal
              token={token}
              steps={portal.familySteps}
              documents={portal.documents}
            />
          ) : (
            <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm leading-relaxed text-gray-600">
              The parish has not requested any family documents through this link yet.
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
