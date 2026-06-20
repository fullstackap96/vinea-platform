import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  isStaffEmailAllowlisted,
  normalizeStaffEmail,
  staffAccessNotConfiguredAllowsDev,
} from '@/lib/staffAuthorization'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set(
      'next',
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    )
    return NextResponse.redirect(loginUrl)
  }

  const email = normalizeStaffEmail(user.email)
  let authorized = isStaffEmailAllowlisted(email)

  if (!authorized && email) {
    const { data: parishId } = await supabase.rpc('primary_parish_id')
    if (parishId) {
      const { data } = await supabase
        .from('staff_users')
        .select('id')
        .eq('parish_id', parishId)
        .eq('active', true)
        .ilike('email', email)
        .limit(1)
        .maybeSingle()
      authorized = Boolean(data?.id)
    }
  }

  if (!authorized && staffAccessNotConfiguredAllowsDev()) {
    authorized = true
  }

  if (!authorized) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('staff', 'unauthorized')
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*'],
}

