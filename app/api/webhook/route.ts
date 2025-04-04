import { NextRequest, NextResponse } from 'next/server'
import { storeMessage } from '@/lib/chatStore'

export async function POST(req: NextRequest) {
  const data = await req.formData()
  const from = data.get('From')?.toString() || ''
  const body = data.get('Body')?.toString() || ''

  if (!from || !body) {
    return NextResponse.json({ error: 'Missing from or body' }, { status: 400 })
  }

  storeMessage(from, from, body)
  return NextResponse.json({ success: true })
}
