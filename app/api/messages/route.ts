import { NextResponse } from 'next/server'
import { getChats } from '@/lib/chatStore'

export async function GET() {
  const chats = getChats()
  return NextResponse.json(chats)
}
