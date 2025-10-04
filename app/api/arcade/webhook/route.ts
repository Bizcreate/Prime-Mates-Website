import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // accept payload, do nothing
  try {
    await req.json(); // parse to avoid body stream warnings
  } catch {}
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "arcade-webhook (disabled)" });
}
