// app/api/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Twilio } from "twilio";
import { storeMessage } from "@/lib/chatStore";

const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken  = process.env.TWILIO_AUTH_TOKEN || "";
const fromPhone  = process.env.FROM_PHONE || process.env.TWILIO_PHONE_NUMBER || "";

// Se quiser forçar modo “sem Twilio” em dev, defina TWILIO_DRY_RUN=true no .env.local
const DRY_RUN = process.env.TWILIO_DRY_RUN === "true" || !accountSid || !authToken || !fromPhone;

const client = (!DRY_RUN) ? new Twilio(accountSid, authToken) : null;

function normalizeToE164(raw: string): string {
  if (!raw) return raw;
  let s = raw.trim();
  if (!s.startsWith("+")) s = "+" + s.replace(/[^\d]/g, "");
  return s.replace(/[^\d+]/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const { to, message } = await req.json();
    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: "Campos obrigatórios: to, message" },
        { status: 400 }
      );
    }

    const toPhone = normalizeToE164(String(to));
    const text = String(message);

    let sid: string | undefined;

    if (!DRY_RUN && client) {
      // Envia pela Twilio
      const result = await client.messages.create({
        body: text,
        from: String(fromPhone),
        to: toPhone,
      });
      sid = result.sid;
    }

    // Sempre grava no Redis como mensagem do agente
    await storeMessage(toPhone, "agent", text);

    return NextResponse.json({ success: true, sid, dryRun: DRY_RUN });
  } catch (err: any) {
    // Mesmo se der erro na Twilio, gravamos no Redis para não sumir no polling
    try {
      const body = await req.json().catch(() => ({} as any));
      const toPhone = normalizeToE164(String(body?.to || ""));
      const text = String(body?.message || "");
      if (toPhone && text) {
        await storeMessage(toPhone, "agent", text);
      }
    } catch {}

    console.error("[/api/send] Error:", err?.message || err);
    return NextResponse.json(
      { success: false, error: "Failed to send (saved locally)", saved: true },
      { status: 500 }
    );
  }
}
