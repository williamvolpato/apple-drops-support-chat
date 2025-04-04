import { NextResponse } from 'next/server'
import { storeMessage, getMessages } from '@/lib/chatStore'
import fs from 'fs/promises'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data/chatData.json')

export async function GET() {
  const messages = await getMessages()
  return NextResponse.json({ messages })
}

export async function POST(req: Request) {
  const { From, Body } = await req.json()

  if (!From || !Body) {
    return NextResponse.json({ error: 'Missing From or Body' }, { status: 400 })
  }

  await storeMessage(From, 'Cliente', Body)

  return NextResponse.json({ success: true })
}
