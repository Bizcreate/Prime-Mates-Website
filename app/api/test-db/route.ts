import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("[v0] Testing database connection...")

    // Test basic connection
    const result = await sql`SELECT NOW() as current_time`
    console.log("[v0] Database connection successful:", result)

    // Test products table
    const products = await sql`SELECT COUNT(*) as count FROM products`
    console.log("[v0] Products table query successful:", products)

    return Response.json({
      success: true,
      message: "Database connection working",
      currentTime: result[0].current_time,
      productCount: products[0].count,
    })
  } catch (error) {
    console.error("[v0] Database connection failed:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
