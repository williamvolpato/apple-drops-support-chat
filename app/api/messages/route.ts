import { NextRequest, NextResponse } from 'next/server'

const chats = new Map<string, { sender: string; text: string }[]>()

export function storeMessage(phone: string, sender: string, text: string) {
  if (!chats.has(phone)) chats.set(phone, [])
  chats.get(phone)!.push({ sender, text })
}

export async function GET(req: NextRequest) {
  const ordered = Array.from(chats.entries())
    .sort((a, b) => {
      const lastA = a[1].at(-1)
      const lastB = b[1].at(-1)
      return lastB?.text?.localeCompare(lastA?.text || '') || 0
    })
    .reduce((acc, [phone, msgs]) => {
      acc[phone] = msgs
      return acc
    }, {} as Record<string, { sender: string; text: string }[]>)

  return NextResponse.json(ordered)
}
