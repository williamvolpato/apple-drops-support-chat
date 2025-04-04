import { NextResponse } from 'next/server'
import {
  storeMessage,
  getMessages,
  getResolvedSenders,
  getReadSenders,
  resetData
} from '@/lib/chatStore'

export async function GET() {
  const messages = await getMessages()
  const resolvedSenders = await getResolvedSenders()
  const readSenders = await getReadSenders()

  return NextResponse.json({
    messages,
    resolvedSenders,
    readSenders
  })
}

export async function POST(req: Request) {
  const { From, Body } = await req.json()

  if (!From || !Body) {
    return NextResponse.json({ error: 'Missing From or Body' }, { status: 400 })
  }

  await storeMessage(From, 'Cliente', Body)

  return NextResponse.json({ success: true })
}

// NOVO: Rota DELETE para resetar todos os dados
export async function DELETE() {
  await resetData()
  return NextResponse.json({ success: true, message: 'Chat resetado com sucesso' })
}
