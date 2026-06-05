import { NextResponse, type NextRequest } from 'next/server'
import { allowRequest } from '@/lib/rate-limit'
import { addContactMessage } from '@/lib/portfolio-data'

export const runtime = 'nodejs'

function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!allowRequest(`${ip}:contact`, 3, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = (await request.json().catch(() => null)) as {
    name?: string
    email?: string
    message?: string
    _hp?: string
  } | null

  const name = String(body?.name || '').trim().slice(0, 120)
  const email = String(body?.email || '').trim().slice(0, 120)
  const message = String(body?.message || '').trim().slice(0, 2000)
  const honeypot = String(body?._hp || '').trim()

  if (honeypot) {
    return NextResponse.json({ ok: true })
  }

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  if (message.length < 10) {
    return NextResponse.json({ error: 'Message is too short' }, { status: 400 })
  }

  await addContactMessage({ name, email, message })
  return NextResponse.json({ ok: true })
}
