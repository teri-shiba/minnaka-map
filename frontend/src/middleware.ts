import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const PROTECTED_PATHS = ['/settings', '/favorites']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtectedPath = PROTECTED_PATHS.some(path =>
    pathname.startsWith(path),
  )

  if (!isProtectedPath)
    return NextResponse.next()

  const authCookie = request.cookies.get('auth_cookie')?.value

  if (!authCookie)
    return NextResponse.redirect(new URL('/?error=auth_required', request.url))

  try {
    const decoded = decodeURIComponent(authCookie)
    const parsed = JSON.parse(decoded)

    const hasValidAuth
      = typeof parsed['access-token'] === 'string' && parsed['access-token'].length > 0
        && typeof parsed.client === 'string' && parsed.client.length > 0
        && typeof parsed.uid === 'string' && parsed.uid.length > 0

    if (!hasValidAuth)
      return NextResponse.redirect(new URL('/?error=auth_required', request.url))
  }
  catch {
    return NextResponse.redirect(new URL('/?error=auth_required', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/settings/:path*', '/favorites/:path*'],
}
