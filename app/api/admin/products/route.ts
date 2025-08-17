import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

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
      visibility = "public",
      badge = "",
      featured = false,
    } = body

    const [product] = await sql`
      INSERT INTO products (
        name, description, price, category, sku, 
        inventory_quantity, image_url, sizes, weight, 
        status, visibility, badge, featured, created_at, updated_at
      )
      VALUES (
        ${name}, ${description}, ${price}, ${category}, ${sku},
        ${inventory_quantity}, ${image_url}, ${JSON.stringify(sizes)}, ${weight},
        ${status}, ${visibility}, ${badge}, ${featured}, NOW(), NOW()
      )
      RETURNING *
    `

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
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
