import { NextRequest, NextResponse } from 'next/server'

// Armazena o histórico em memória
const chats = globalThis.chats || new Map()
globalThis.chats = chats

export async function POST(req: NextRequest) {
  const data = await req.formData()
  const from = data.get('From')?.toString()
  const body = data.get('Body')?.toString()

  if (!from || !body) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 })
  }

  // Salva no histórico
  if (!chats.has(from)) chats.set(from, [])
  chats.get(from).push({ sender: from, text: body })

  return NextResponse.json({ success: true })
}
