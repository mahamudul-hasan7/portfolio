import { NextResponse, type NextRequest } from 'next/server'
import { hasValidAdminSession } from '@/lib/admin-auth'
import { getPortfolioStore, updatePortfolioContent } from '@/lib/portfolio-data'

export const runtime = 'nodejs'

function deny() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET(request: NextRequest) {
  if (!hasValidAdminSession(request)) {
    return deny()
  }

  const store = await getPortfolioStore()
  return NextResponse.json(store)
}

export async function PUT(request: NextRequest) {
  if (!hasValidAdminSession(request)) {
    return deny()
  }

  const body = (await request.json().catch(() => null)) as { content?: unknown } | null
  const content = body?.content as Parameters<typeof updatePortfolioContent>[0] | undefined

  if (!content) {
    return NextResponse.json({ error: 'Missing content payload' }, { status: 400 })
  }

  const updated = await updatePortfolioContent(content)
  return NextResponse.json({ content: updated })
}
