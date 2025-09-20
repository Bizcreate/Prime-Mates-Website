import { NextResponse } from "next/server";
import { wooFetch } from "@/lib/woo";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const per_page = Math.min(Number(searchParams.get("per_page") || 100), 100);
    const page = Number(searchParams.get("page") || 1);

    const categories = await wooFetch<any[]>("/products/categories", { per_page, page, hide_empty: true });

    return NextResponse.json({ categories }, { status: 200 });
  } catch (err: any) {
    console.error("[/api/woo/categories] error:", err);
    return NextResponse.json({ error: err?.message || "Woo error" }, { status: 500 });
  }
}
