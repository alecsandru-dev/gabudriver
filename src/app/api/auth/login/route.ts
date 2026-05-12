import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

function computeToken(secret: string): string {
  return createHash('sha256')
    .update('pisipilot-v1:' + secret)
    .digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    const appPassword = process.env.APP_PASSWORD
    const cookieSecret = process.env.APP_COOKIE_SECRET

    if (!appPassword || !cookieSecret) {
      return NextResponse.json({ error: 'server_error' }, { status: 500 })
    }

    if (!password || password !== appPassword) {
      return NextResponse.json({ error: 'invalid_password' }, { status: 401 })
    }

    const token = computeToken(cookieSecret)

    const response = NextResponse.json({ success: true })
    response.cookies.set('pisipilot_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }
}
