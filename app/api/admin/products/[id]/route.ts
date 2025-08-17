import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await sql`
      SELECT * FROM products WHERE id = ${params.id}
    `

    if (product.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product[0])
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    console.log("[v0] Update request body:", body)
    console.log("[v0] Product ID:", params.id)

    const { name, description, price, category, sku, inventory_quantity, image_url, sizes, status } = body

    console.log("[v0] Extracted fields:", {
      name,
      description,
      price,
      category,
      sku,
      inventory_quantity,
      image_url,
      sizes,
      status,
    })

    const existingProduct = await sql`
      SELECT id FROM products WHERE id = ${params.id}
    `

    if (existingProduct.length === 0) {
      console.log("[v0] Product not found with ID:", params.id)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    console.log("[v0] Product exists, proceeding with update")

    const updatedProduct = await sql`
      UPDATE products 
      SET 
        name = ${name || ""},
        description = ${description || ""},
        price = ${price ? Number.parseFloat(price) : 0},
        category = ${category || ""},
        sku = ${sku || ""},
        inventory_quantity = ${inventory_quantity ? Number.parseInt(inventory_quantity) : 0},
        image_url = ${image_url || ""},
        sizes = ${sizes ? JSON.stringify(sizes) : "[]"}::jsonb,
        status = ${status || "draft"},
        is_active = ${status === "published"},
        updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `

    console.log("[v0] Update result:", updatedProduct)

    if (updatedProduct.length === 0) {
      console.log("[v0] No rows updated")
      return NextResponse.json({ error: "Product not found or no changes made" }, { status: 404 })
    }

    console.log("[v0] Product updated successfully")
    return NextResponse.json(updatedProduct[0])
  } catch (error) {
    console.error("[v0] Error updating product:", error)
    console.error("[v0] Error stack:", error.stack)
    return NextResponse.json(
      {
        error: "Failed to update product",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deletedProduct = await sql`
      DELETE FROM products WHERE id = ${params.id}
      RETURNING *
    `

    if (deletedProduct.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
