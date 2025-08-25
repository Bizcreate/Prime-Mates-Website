import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { items, total } = await request.json()

    // WooCommerce checkout integration
    const wooCommerceUrl = process.env.WOOCOMMERCE_URL
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET

    if (!wooCommerceUrl || !consumerKey || !consumerSecret) {
      throw new Error("WooCommerce configuration missing")
    }

    // Create order in WooCommerce
    const orderData = {
      payment_method: "bacs", // Bank transfer - can be changed
      payment_method_title: "Direct Bank Transfer",
      set_paid: false,
      billing: {
        first_name: "Customer",
        last_name: "Name",
        address_1: "Address Line 1",
        address_2: "",
        city: "City",
        state: "State",
        postcode: "12345",
        country: "US",
        email: "customer@example.com",
        phone: "(555) 555-5555",
      },
      shipping: {
        first_name: "Customer",
        last_name: "Name",
        address_1: "Address Line 1",
        address_2: "",
        city: "City",
        state: "State",
        postcode: "12345",
        country: "US",
      },
      line_items: items.map((item: any) => ({
        product_id: Number.parseInt(item.product_id),
        quantity: item.quantity,
      })),
      shipping_lines: [
        {
          method_id: "flat_rate",
          method_title: "Flat Rate",
          total: "10.00",
        },
      ],
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")

    const response = await fetch(`${wooCommerceUrl}/wp-json/wc/v3/orders`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })

    if (response.ok) {
      const order = await response.json()
      return NextResponse.json({
        checkout_url: `${wooCommerceUrl}/checkout/order-pay/${order.id}/?pay_for_order=true&key=${order.order_key}`,
        order_id: order.id,
      })
    } else {
      // Fallback to direct WooCommerce checkout
      return NextResponse.json({
        checkout_url: `${wooCommerceUrl}/checkout`,
      })
    }
  } catch (error) {
    console.error("Checkout API error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
