import { NextRequest, NextResponse } from 'next/server'

async function computeToken(secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode('pisipilot-v1:' + secret)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json'

  if (isPublic) {
    return NextResponse.next()
  }

  const secret = process.env.APP_COOKIE_SECRET
  const authCookie = request.cookies.get('pisipilot_auth')?.value

  if (!secret || !authCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const expected = await computeToken(secret)

  if (authCookie !== expected) {
    const res = NextResponse.redirect(new URL('/login', request.url))
    res.cookies.delete('pisipilot_auth')
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|icons|favicon.ico|manifest.json).*)'],
}
