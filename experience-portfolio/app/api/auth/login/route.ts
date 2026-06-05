import { NextResponse } from 'next/server'
import { allowRequest } from '@/lib/rate-limit'
import { areAdminSecretsConfigured, createAdminSessionToken, getAdminCookieName, getSessionCookieOptions, verifyCredentials } from '@/lib/admin-auth'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!areAdminSecretsConfigured()) {
    return NextResponse.json({ error: 'Admin secrets are not configured' }, { status: 503 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!allowRequest(`${ip}:login`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many login attempts' }, { status: 429 })
  }

  const body = (await request.json().catch(() => null)) as { username?: string; password?: string } | null
  const username = String(body?.username || '').trim()
  const password = String(body?.password || '')

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
  }

  if (!verifyCredentials(username, password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = createAdminSessionToken()
  if (!token) {
    return NextResponse.json({ error: 'Session secret is not configured' }, { status: 503 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(getAdminCookieName(), token, getSessionCookieOptions())
  return response
}
