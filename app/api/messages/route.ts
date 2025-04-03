import { NextRequest, NextResponse } from 'next/server'

let chats = new Map()

export async function POST(req: NextRequest) {
  const data = await req.formData()
  const from = data.get('From')?.toString()
  const body = data.get('Body')?.toString()

  if (!from || !body) {
    return NextResponse.json({ error: 'Missing From or Body' }, { status: 400 })
  }

  if (!chats.has(from)) {
    chats.set(from, [])
  }

  chats.get(from).push({ sender: from, text: body })
  chats.get(from).push({ sender: 'Suporte', text: 'Hi! I can help you complete your order.' })

  return NextResponse.json({ success: true })
}

export async function GET() {
  const all = Array.from(chats.entries()).flatMap(([sender, msgs]) => msgs)
  return NextResponse.json(all)
}
