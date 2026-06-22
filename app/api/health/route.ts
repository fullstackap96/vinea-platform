import { NextResponse } from 'next/server'
import { runHealthChecks } from '@/lib/server/healthCheck'

/**
 * Deployment health check (no auth). Keep the public response coarse so
 * missing env names, provider status, and schema state are not enumerable.
 */
export async function GET() {
  const result = await runHealthChecks()
  return NextResponse.json({ ok: result.ok }, { status: result.ok ? 200 : 503 })
}
