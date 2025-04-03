import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const { to, message } = body

  const accountSid = process.env.TWILIO_ACCOUNT_SID!
  const authToken = process.env.TWILIO_AUTH_TOKEN!
  const from = process.env.TWILIO_PHONE_NUMBER!

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      To: to,
      From: from,
      Body: message,
    }),
  })

  const data = await res.json()
  return NextResponse.json(data)
}
