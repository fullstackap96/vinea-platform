import { NextResponse, type NextRequest } from 'next/server'
import { formatGlobalSearchResponse } from '@/lib/globalSearch/formatGlobalSearchResults'
import { loadGlobalSearch } from '@/lib/server/loadGlobalSearch'
import { createSupabaseRouteHandlerReadOnlyClient } from '@/lib/supabase/routeHandlerClient'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''
  const supabase = createSupabaseRouteHandlerReadOnlyClient(request)

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const loadResult = await loadGlobalSearch(supabase, q)
  return NextResponse.json(formatGlobalSearchResponse(loadResult))
}
