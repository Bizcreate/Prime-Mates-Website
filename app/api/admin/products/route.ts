import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { crypto } from "crypto"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const products = await sql`
      SELECT * FROM products 
      ORDER BY created_at DESC
    `

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Creating product with data:", body)

    const {
      name,
      description,
      price,
      category,
      sku,
      inventory_quantity,
      image_url,
      sizes,
      weight,
      status = "draft",
    } = body

    if (!name || !description || !price || !category) {
      console.log("[v0] Missing required fields")
      return NextResponse.json(
        { error: "Missing required fields: name, description, price, category" },
        { status: 400 },
      )
    }

    const productId = crypto.randomUUID()
    console.log("[v0] Generated product ID:", productId)

    const [product] = await sql`
      INSERT INTO products (
        id, name, description, price, category, sku, 
        inventory_quantity, image_url, sizes, weight, 
        status, is_active, created_at, updated_at
      )
      VALUES (
        ${productId}, ${name}, ${description}, ${Number.parseFloat(price) || 0}, ${category}, ${sku || `PM-${Date.now()}`},
        ${Number.parseInt(inventory_quantity) || 0}, ${image_url || ""}, ${JSON.stringify(sizes || [])}, ${Number.parseFloat(weight) || 0},
        ${status}, ${status === "published"}, NOW(), NOW()
      )
      RETURNING *
    `

    console.log("[v0] Product created successfully:", product)
    return NextResponse.json(product)
  } catch (error) {
    console.error("[v0] Error creating product:", error)
    console.error("[v0] Error details:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json(
      {
        error: "Failed to create product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    await sql`DELETE FROM products WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
