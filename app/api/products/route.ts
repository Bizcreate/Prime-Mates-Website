import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("[v0] Fetching products from WooCommerce...")

    const wooProducts = await fetchWooCommerceProducts()
    if (wooProducts && wooProducts.length > 0) {
      console.log("[v0] Successfully fetched", wooProducts.length, "products from WooCommerce")
      return NextResponse.json(wooProducts)
    }

    console.log("[v0] Falling back to database products...")
    const products = await sql`
      SELECT * FROM products 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `
    return NextResponse.json(products)
  } catch (error) {
    console.error("[v0] Failed to fetch products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

async function fetchWooCommerceProducts() {
  try {
    const { WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET } = process.env

    if (!WOOCOMMERCE_URL || !WOOCOMMERCE_CONSUMER_KEY || !WOOCOMMERCE_CONSUMER_SECRET) {
      console.log("[v0] WooCommerce credentials not configured")
      return null
    }

    const auth = Buffer.from(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`).toString("base64")

    const response = await fetch(`${WOOCOMMERCE_URL}/wp-json/wc/v3/products?status=publish&per_page=50`, {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("[v0] WooCommerce API error:", response.status, await response.text())
      return null
    }

    const wooProducts = await response.json()

    return wooProducts.map((product: any) => {
      let inventoryQuantity = 0

      // If stock management is enabled, use the actual stock quantity
      if (product.manage_stock && product.stock_quantity !== null) {
        inventoryQuantity = product.stock_quantity
      } else {
        // If stock management is disabled, check stock_status
        // "instock" means available (set to 999 to indicate unlimited stock)
        // "outofstock" means unavailable (set to 0)
        inventoryQuantity = product.stock_status === "instock" ? 999 : 0
      }

      return {
        id: product.id.toString(),
        name: product.name,
        description: product.short_description || product.description,
        price: product.price,
        image_url: product.images?.[0]?.src || null,
        category: product.categories?.[0]?.name || "Uncategorized",
        inventory_quantity: inventoryQuantity,
        sku: product.sku,
        status: product.status === "publish" ? "active" : "inactive",
        badge: product.featured ? "Featured" : null,
        created_at: product.date_created,
        updated_at: product.date_modified,
      }
    })
  } catch (error) {
    console.error("[v0] Error fetching WooCommerce products:", error)
    return null
  }
}
