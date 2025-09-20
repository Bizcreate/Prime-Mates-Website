import { NextResponse } from "next/server";
import { wooFetch } from "@/lib/woo";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") || 1);
    const per_page = Math.min(Number(searchParams.get("per_page") || 24), 50);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;

    const params: Record<string, string | number | undefined> = {
      page,
      per_page,
      search,
      // If you want to filter by a category ID, pass 'category' (Woo expects category id)
      category,
      status: "publish",
    };

    const products = await wooFetch<any[]>("/products", params);

    return NextResponse.json({ products }, { status: 200 });
  } catch (err: any) {
    console.error("[/api/woo/products] error:", err);
    return NextResponse.json({ error: err?.message || "Woo error" }, { status: 500 });
  }
}
