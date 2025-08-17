import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const products = await sql`
      SELECT * FROM products 
      WHERE is_active = true 
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
      is_active = true,
      status = "active",
    } = body

    const [product] = await sql`
      INSERT INTO products (
        name, description, price, category, sku, 
        inventory_quantity, image_url, sizes, weight, 
        is_active, status, created_at, updated_at
      )
      VALUES (
        ${name}, ${description}, ${price}, ${category}, ${sku},
        ${inventory_quantity}, ${image_url}, ${JSON.stringify(sizes)}, ${weight},
        ${is_active}, ${status}, NOW(), NOW()
      )
      RETURNING *
    `

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
