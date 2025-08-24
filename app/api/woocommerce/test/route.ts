import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[v0] Testing WooCommerce connection...")

    const { WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET } = process.env

    if (!WOOCOMMERCE_URL || !WOOCOMMERCE_CONSUMER_KEY || !WOOCOMMERCE_CONSUMER_SECRET) {
      console.log("[v0] Missing WooCommerce environment variables")
      return NextResponse.json(
        {
          error: "Missing WooCommerce configuration",
          missing: {
            url: !WOOCOMMERCE_URL,
            key: !WOOCOMMERCE_CONSUMER_KEY,
            secret: !WOOCOMMERCE_CONSUMER_SECRET,
          },
        },
        { status: 500 },
      )
    }

    // Test connection by fetching store info
    const auth = Buffer.from(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`).toString("base64")

    console.log("[v0] Making test request to:", `${WOOCOMMERCE_URL}/wp-json/wc/v3/system_status`)

    const response = await fetch(`${WOOCOMMERCE_URL}/wp-json/wc/v3/system_status`, {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    })

    console.log("[v0] WooCommerce response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] WooCommerce error response:", errorText)
      return NextResponse.json(
        {
          error: "WooCommerce API error",
          status: response.status,
          message: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("[v0] WooCommerce connection successful")

    return NextResponse.json({
      success: true,
      message: "WooCommerce connection successful",
      store: data.settings?.general?.title || "Connected",
    })
  } catch (error) {
    console.error("[v0] WooCommerce test error:", error)
    return NextResponse.json(
      {
        error: "Connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
