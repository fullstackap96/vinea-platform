import { NextResponse } from 'next/server'
import { runHealthChecks } from '@/lib/server/healthCheck'

/**
 * Deployment health check (no auth). Does not expose secret values.
 */
export async function GET() {
  const result = await runHealthChecks()
  return NextResponse.json(result, { status: result.ok ? 200 : 503 })
}
