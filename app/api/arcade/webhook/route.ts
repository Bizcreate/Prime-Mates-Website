import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/arcade";
import { addPointsServer } from "@/lib/points";

/**
 * Minimal webhook to receive game results from the Telegram bot server.
 * Expected JSON:
 * {
 *   "secret": "ARCADE_WEBHOOK_SECRET",
 *   "address": "0xabc...",    // EVM wallet (checksummed or lower is fine)
 *   "delta": 25,              // XP to add (int)
 *   "reason": "Flappy Ape #weekly" // optional
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const secret = body?.secret;
    if (secret !== process.env.ARCADE_WEBHOOK_SECRET) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const address: string | undefined = body?.address;
    const delta: number | undefined = Number(body?.delta);
    const reason: string | undefined = body?.reason;

    if (!address || !delta || !Number.isFinite(delta)) {
      return NextResponse.json({ ok: false, error: "invalid-payload" }, { status: 400 });
    }
    if (!db) {
      return NextResponse.json({ ok: false, error: "db-not-ready" }, { status: 500 });
    }

    await addPointsServer({ db, address, delta, reason });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[arcade webhook] error:", e);
    return NextResponse.json({ ok: false, error: "server-error" }, { status: 500 });
  }
}
