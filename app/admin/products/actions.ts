"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category: string | null
  created_at: Date
}

export async function getProducts(): Promise<Product[]> {
  try {
    const products = await sql<Product[]>`SELECT * FROM products ORDER BY created_at DESC`
    return products
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export async function addProduct(formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = Number.parseFloat(formData.get("price") as string)
  const imageUrl = formData.get("imageUrl") as string
  const category = formData.get("category") as string

  if (!name || isNaN(price)) {
    return { success: false, message: "Name and Price are required." }
  }

  try {
    await sql`
      INSERT INTO products (name, description, price, image_url, category)
      VALUES (${name}, ${description || null}, ${price}, ${imageUrl || null}, ${category || null})
    `
    revalidatePath("/admin/products")
    revalidatePath("/merch") // Revalidate the merch page as it now displays products
    return { success: true, message: "Product added successfully!" }
  } catch (error) {
    console.error("Error adding product:", error)
    return { success: false, message: "Failed to add product." }
  }
}

export async function updateProduct(formData: FormData) {
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = Number.parseFloat(formData.get("price") as string)
  const imageUrl = formData.get("imageUrl") as string
  const category = formData.get("category") as string

  if (!id || !name || isNaN(price)) {
    return { success: false, message: "Product ID, Name, and Price are required for update." }
  }

  try {
    await sql`
      UPDATE products
      SET name = ${name},
          description = ${description || null},
          price = ${price},
          image_url = ${imageUrl || null},
          category = ${category || null}
      WHERE id = ${id}
    `
    revalidatePath("/admin/products")
    revalidatePath("/merch") // Revalidate the merch page
    return { success: true, message: "Product updated successfully!" }
  } catch (error) {
    console.error("Error updating product:", error)
    return { success: false, message: "Failed to update product." }
  }
}

export async function deleteProduct(id: string) {
  if (!id) {
    return { success: false, message: "Product ID is required for deletion." }
  }

  try {
    await sql`DELETE FROM products WHERE id = ${id}`
    revalidatePath("/admin/products")
    revalidatePath("/merch") // Revalidate the merch page
    return { success: true, message: "Product deleted successfully!" }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { success: false, message: "Failed to delete product." }
  }
}
