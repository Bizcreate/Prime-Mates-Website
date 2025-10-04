// app/api/arcade/webhook/route.ts
import { NextResponse } from "next/server";
import { sendDiscord } from "@/lib/discord";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ArcadeEvent = {
  type?: string;
  userId?: string;
  wallet?: string;
  amount?: number;
  reason?: string;
  metadata?: Record<string, unknown>;
};

function safeJson(obj: unknown) {
  try { return JSON.stringify(obj); } catch { return undefined; }
}

export async function POST(req: Request) {
  let body: ArcadeEvent | undefined;
  try {
    body = (await req.json()) as ArcadeEvent;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const lines: string[] = [];
  if (body?.type) lines.push(`**Event:** ${body.type}`);
  if (body?.userId) lines.push(`**User:** ${body.userId}`);
  if (body?.wallet) lines.push(`**Wallet:** \`${body.wallet}\``);
  if (typeof body?.amount === "number") lines.push(`**Amount:** ${body.amount}`);
  if (body?.reason) lines.push(`**Reason:** ${body.reason}`);

  const content = lines.length ? lines.join("\n") : "Arcade webhook event received.";
  const embedMeta = body?.metadata ? safeJson(body.metadata) : undefined;

  try {
    await sendDiscord({
      content,
      embeds: embedMeta ? [{ title: "Metadata", description: "```json\n" + embedMeta + "\n```", color: 0xfbc535, timestamp: new Date().toISOString() }] : undefined,
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("[arcade webhook] Discord error:", err);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "arcade-webhook" });
}
