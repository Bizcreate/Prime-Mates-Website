import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/arcade";
import { addPointsServer } from "@/lib/points";
import { postToDiscord } from "@/lib/discord";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.secret !== process.env.ARCADE_WEBHOOK_SECRET) {
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

    // fire-and-forget Discord message
    const hook = process.env.DISCORD_ARCADE_WEBHOOK || "";
    const short = `${address.slice(0, 6)}…${address.slice(-4)}`;
    postToDiscord(hook, `🎮 +${delta} XP for **${short}** ${reason ? `— _${reason}_` : ""}`);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[arcade webhook] error:", e);
    return NextResponse.json({ ok: false, error: "server-error" }, { status: 500 });
  }
}
