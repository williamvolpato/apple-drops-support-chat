import { NextResponse } from 'next/server'
import { storeMessage, getMessages } from '@/lib/chatStore'

export async function GET() {
  const messages = getMessages()
  return NextResponse.json({ messages })
}

export async function POST(req: Request) {
  const { From, Body } = await req.json()

  if (!From || !Body) {
    return NextResponse.json({ error: 'Missing From or Body' }, { status: 400 })
  }

  storeMessage(From, 'Cliente', Body)

  return NextResponse.json({ success: true })
}
