import { NextRequest, NextResponse } from 'next/server';

type Message = { sender: string; text: string };
const chats = new Map<string, Message[]>(); // memória temporária

export async function GET(req: NextRequest) {
  const data: { [phone: string]: Message[] } = {};
  for (const [key, value] of chats.entries()) {
    data[key] = value;
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { phone, text } = await req.json();

  if (!phone || !text) {
    return NextResponse.json({ error: 'Missing phone or text' }, { status: 400 });
  }

  // Armazena no histórico
  if (!chats.has(phone)) chats.set(phone, []);
  chats.get(phone)?.push({ sender: 'Suporte', text });

  // Envia com Twilio
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_PHONE_NUMBER!;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const body = new URLSearchParams({
    To: phone,
    From: from,
    Body: text,
  });

  const twilioRes = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const result = await twilioRes.json();
  return NextResponse.json({ success: true, result });
}
