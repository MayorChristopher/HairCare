import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from './lib/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Protect admin routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (!session) {
        return NextResponse.redirect(new URL('/auth', req.url))
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/chat', req.url))
      }
    }

    // Protect authenticated routes
    if (req.nextUrl.pathname.startsWith('/chat') || req.nextUrl.pathname.startsWith('/profile')) {
      if (!session) {
        return NextResponse.redirect(new URL('/auth', req.url))
      }
    }

    // Redirect authenticated users away from auth page
    if (req.nextUrl.pathname === '/auth' && session) {
      return NextResponse.redirect(new URL('/chat', req.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: ['/admin/:path*', '/chat/:path*', '/profile/:path*', '/auth']
}
