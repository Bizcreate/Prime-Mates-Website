// app/api/proxy/route.ts
import type { NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return new Response("Missing url", { status: 400 });

  try {
    const upstream = await fetch(url, {
      // keep it simple: request images
      headers: { Accept: "image/*" },
      // avoid sending cookies/referrers to third-party
      redirect: "follow",
    });

    if (!upstream.ok || !upstream.body) {
      return new Response("Upstream error", { status: 502 });
    }

    const headers = new Headers(upstream.headers);
    headers.set("Cache-Control", "public, max-age=86400, immutable");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.delete("content-security-policy");
    headers.delete("x-frame-options");

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (e) {
    return new Response("Fetch failed", { status: 500 });
  }
}
