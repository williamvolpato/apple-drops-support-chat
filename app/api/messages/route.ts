// app/api/messages/route.ts
import { NextResponse } from "next/server";
import {
  getMessages,
  getResolvedSenders,
  getReadSenders,
  updateResolvedSenders,
  updateReadSenders,
  resetData,
} from "@/lib/chatStore";

// GET -> estado completo para a UI
export async function GET() {
  const [messages, resolvedSenders, readSenders] = await Promise.all([
    getMessages(),
    getResolvedSenders(),
    getReadSenders(),
  ]);

  return NextResponse.json({ messages, resolvedSenders, readSenders });
}

// POST -> ações simples (update lists / reset)
export async function POST(req: Request) {
  try {
    const { action, list } = await req.json();

    if (action === "updateResolved") {
      await updateResolvedSenders(Array.isArray(list) ? list : []);
      return NextResponse.json({ ok: true });
    }

    if (action === "updateRead") {
      await updateReadSenders(Array.isArray(list) ? list : []);
      return NextResponse.json({ ok: true });
    }

    if (action === "reset") {
      await resetData();
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro ao processar" },
      { status: 500 }
    );
  }
}
