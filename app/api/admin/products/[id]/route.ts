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
    const { name, description, price, category, sku, inventory_quantity, image_url, sizes, status, is_featured } = body

    const updatedProduct = await sql`
      UPDATE products 
      SET 
        name = ${name},
        description = ${description},
        price = ${price},
        category = ${category},
        sku = ${sku},
        inventory_quantity = ${inventory_quantity},
        image_url = ${image_url},
        sizes = ${JSON.stringify(sizes || [])},
        status = ${status},
        is_active = ${status === "active"},
        updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `

    if (updatedProduct.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(updatedProduct[0])
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
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
