import { NextResponse } from 'next/server'
import {
  buildPublicHealthCheckResponse,
  runHealthChecks,
} from '@/lib/server/healthCheck'

export const dynamic = 'force-dynamic'

/**
 * Deployment health check (no auth). Does not expose secret values.
 */
export async function GET() {
  const result = await runHealthChecks()
  const response = NextResponse.json(
    buildPublicHealthCheckResponse(result, {
      includeFailureDetails: process.env.NODE_ENV !== 'production',
    }),
    { status: result.ok ? 200 : 503 }
  )

  response.headers.set('Cache-Control', 'no-store, max-age=0')
  response.headers.set('Pragma', 'no-cache')

  return response
}
