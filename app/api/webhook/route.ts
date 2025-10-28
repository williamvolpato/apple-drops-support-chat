// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { storeMessage } from "@/lib/chatStore";

// POST vindo do Twilio (form-urlencoded) ou teste em JSON
export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  // Caminho oficial do Twilio (application/x-www-form-urlencoded)
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const data = await req.formData();
    const from = (data.get("From") || "").toString().trim();
    const body = (data.get("Body") || "").toString();

    if (!from) {
      return NextResponse.json({ error: "Missing 'From'" }, { status: 400 });
    }

    await storeMessage(from, "client", body || "");

    // Twilio espera 200 com TwiML (pode ser vazio)
    return new Response("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
      status: 200,
    });
  }

  // Suporte a JSON para facilitar testes locais
  try {
    const { from, body } = await req.json();
    if (!from) {
      return NextResponse.json({ error: "Missing 'from'" }, { status: 400 });
    }
    await storeMessage(String(from), "client", String(body || ""));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

// GET opcional para verificar se está no ar
export async function GET() {
  return NextResponse.json({ ok: true, webhook: "ready" });
}
