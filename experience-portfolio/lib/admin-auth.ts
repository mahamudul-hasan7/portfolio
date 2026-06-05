import crypto from 'crypto'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE = 'portfolio_admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 8

function getRequiredSecret(name: string): string | null {
  const value = process.env[name]?.trim()
  return value || null
}

function getUsername(): string | null {
  return getRequiredSecret('ADMIN_USERNAME') ?? 'admin'
}

function getPassword(): string | null {
  return getRequiredSecret('ADMIN_PASSWORD')
}

function getSessionSecret(): string | null {
  return getRequiredSecret('ADMIN_SESSION_SECRET')
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value).toString('base64url')
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url')
}

export function areAdminSecretsConfigured(): boolean {
  return Boolean(getPassword() && getSessionSecret())
}

export function verifyCredentials(username: string, password: string): boolean {
  const expectedUsername = getUsername()
  const expectedPassword = getPassword()

  if (!expectedUsername || !expectedPassword) {
    return false
  }

  const providedUser = Buffer.from(username)
  const expectedUser = Buffer.from(expectedUsername)
  const providedPass = Buffer.from(password)
  const expectedPass = Buffer.from(expectedPassword)

  return (
    providedUser.length === expectedUser.length &&
    providedPass.length === expectedPass.length &&
    crypto.timingSafeEqual(providedUser, expectedUser) &&
    crypto.timingSafeEqual(providedPass, expectedPass)
  )
}

export function createAdminSessionToken(): string | null {
  const secret = getSessionSecret()
  if (!secret) {
    return null
  }

  const payload = JSON.stringify({
    sub: 'admin',
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
    iat: Date.now(),
  })

  return `${base64UrlEncode(payload)}.${sign(payload, secret)}`
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  const secret = getSessionSecret()
  if (!secret || !token) {
    return false
  }

  const [encodedPayload, providedSignature] = token.split('.')
  if (!encodedPayload || !providedSignature) {
    return false
  }

  try {
    const payload = base64UrlDecode(encodedPayload)
    const expectedSignature = sign(payload, secret)

    if (providedSignature.length !== expectedSignature.length) {
      return false
    }

    if (!crypto.timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature))) {
      return false
    }

    const parsed = JSON.parse(payload) as { exp?: number }
    return typeof parsed.exp === 'number' && parsed.exp > Date.now()
  } catch {
    return false
  }
}

export function hasValidAdminSession(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  return verifyAdminSessionToken(token)
}

export function getAdminCookieName(): string {
  return SESSION_COOKIE
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  }
}

export function getClearedCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  }
}
