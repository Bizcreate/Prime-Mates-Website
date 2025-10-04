import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/arcade";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Link a Telegram user id to a wallet address.
 * Expected JSON:
 * {
 *   "secret": "ARCADE_WEBHOOK_SECRET",
 *   "telegramId": "123456789",
 *   "address": "0xabc..."
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.secret !== process.env.ARCADE_WEBHOOK_SECRET) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    const telegramId = String(body?.telegramId || "");
    const address = String(body?.address || "").toLowerCase();
    if (!telegramId || !address) {
      return NextResponse.json({ ok: false, error: "invalid-payload" }, { status: 400 });
    }

    // reverse index for convenience
    await setDoc(doc(db!, "links", telegramId), {
      address,
      updatedAt: serverTimestamp(),
    });

    // also store on the user doc
    await setDoc(
      doc(db!, "users", address),
      { telegramId, updatedAt: serverTimestamp() },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[arcade link] error:", e);
    return NextResponse.json({ ok: false, error: "server-error" }, { status: 500 });
  }
}
