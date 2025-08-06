import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from './lib/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  try {
    // Get session with error handling
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session error in middleware:', sessionError)
    }

    console.log('Middleware - Path:', req.nextUrl.pathname, 'Session exists:', !!session)

    // Protect admin routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (!session) {
        console.log('Redirecting to auth from admin - no session')
        return NextResponse.redirect(new URL('/auth', req.url))
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role !== 'admin') {
        console.log('Redirecting to chat from admin - not admin role')
        return NextResponse.redirect(new URL('/chat', req.url))
      }
    }

    // Protect authenticated routes
    if (req.nextUrl.pathname.startsWith('/chat') || req.nextUrl.pathname.startsWith('/profile')) {
      if (!session) {
        console.log('Redirecting to auth from protected route - no session')
        return NextResponse.redirect(new URL('/auth', req.url))
      }
    }

    // Redirect authenticated users away from auth page
    if (req.nextUrl.pathname === '/auth' && session) {
      console.log('Redirecting to chat from auth - user already authenticated')
      return NextResponse.redirect(new URL('/chat', req.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // In case of error, allow the request to proceed
    return res
  }
}

export const config = {
  matcher: ['/admin/:path*', '/chat/:path*', '/profile/:path*', '/auth']
}
