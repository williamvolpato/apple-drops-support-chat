// app/api/messages/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  const messages = [
    {
      sender: "+12523903613",
      text: "Hi, I received a message and I’m interested."
    },
    {
      sender: "Suporte",
      text: "Hi! I can help you complete your order."
    }
  ];

  return NextResponse.json(messages);
}
