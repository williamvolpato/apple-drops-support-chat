import { NextRequest, NextResponse } from 'next/server'
import { Twilio } from 'twilio'
import { storeMessage } from '@/lib/chatStore'

const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken = process.env.TWILIO_AUTH_TOKEN!
const fromPhone = process.env.TWILIO_PHONE_NUMBER!

const client = new Twilio(accountSid, authToken)

export async function POST(req: NextRequest) {
  const { to, message } = await req.json()

  try {
    const result = await client.messages.create({
      body: message,
      from: fromPhone,
      to,
    })

    storeMessage(to, 'Suporte', message)

    return NextResponse.json({ success: true, sid: result.sid })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 })
  }
}
