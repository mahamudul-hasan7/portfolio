import { NextResponse } from 'next/server'
import { getAdminCookieName, getClearedCookieOptions } from '@/lib/admin-auth'

export const runtime = 'nodejs'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(getAdminCookieName(), '', getClearedCookieOptions())
  return response
}
