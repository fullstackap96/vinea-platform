import { NextResponse, type NextRequest } from 'next/server'
import { formatGlobalSearchResponse } from '@/lib/globalSearch/formatGlobalSearchResults'
import { loadGlobalSearch } from '@/lib/server/loadGlobalSearch'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const loadResult = await loadGlobalSearch(staff.supabase, q)
  return NextResponse.json(formatGlobalSearchResponse(loadResult))
}
