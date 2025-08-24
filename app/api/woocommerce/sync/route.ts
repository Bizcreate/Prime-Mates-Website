import { type NextRequest, NextResponse } from "next/server"
import { WooCommerceIntegration } from "@/lib/woocommerce-integration"

export async function GET() {
  try {
    const woocommerce = new WooCommerceIntegration({
      url: process.env.WOOCOMMERCE_URL!,
      consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY!,
      consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET!,
      version: "v3",
    })

    // Fetch products from WooCommerce
    const products = await woocommerce.fetchProducts()

    // Sync each product to database
    const syncResults = []
    for (const product of products) {
      try {
        await woocommerce.syncProductToDatabase(product)
        syncResults.push({ id: product.id, status: "success" })
      } catch (error) {
        syncResults.push({ id: product.id, status: "error", error: error.message })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${products.length} products`,
      products: products,
      results: syncResults,
    })
  } catch (error) {
    console.error("WooCommerce sync error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET()
}
