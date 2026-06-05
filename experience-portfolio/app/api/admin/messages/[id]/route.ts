import { NextResponse, type NextRequest } from 'next/server'
import { hasValidAdminSession } from '@/lib/admin-auth'
import { deleteMessage, setMessageStatus } from '@/lib/portfolio-data'

export const runtime = 'nodejs'

function deny() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!hasValidAdminSession(request)) {
    return deny()
  }

  const { id } = params
  const body = (await request.json().catch(() => null)) as { status?: 'read' | 'unread' } | null
  const status = body?.status === 'read' ? 'read' : 'unread'
  const updated = await setMessageStatus(id, status)

  if (!updated) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }

  return NextResponse.json({ message: updated })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!hasValidAdminSession(request)) {
    return deny()
  }

  const { id } = params
  const removed = await deleteMessage(id)

  if (!removed) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
