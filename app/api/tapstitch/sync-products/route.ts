import { NextResponse } from "next/server"

export async function GET() {
  try {
    // In a real implementation, you would fetch from Tapstitch API
    // For now, we'll return mock data
    const mockProducts = [
      {
        id: "ts_001",
        name: "Prime Mates Thrasher Tee",
        description: "Premium cotton tee with Prime Mates design",
        price: 29.99,
        category: "T-Shirts",
        imageUrl: "/placeholder.svg?height=200&width=200",
        tapstitchId: "ts_pmbc_001",
      },
      {
        id: "ts_002",
        name: "Prime Mates Shaka Hoodie",
        description: "Comfortable hoodie with shaka spirit design",
        price: 59.99,
        category: "Hoodies",
        imageUrl: "/placeholder.svg?height=200&width=200",
        tapstitchId: "ts_pmbc_002",
      },
      {
        id: "ts_003",
        name: "PTTB Skeleton Tee",
        description: "Spooky skeleton design from Prime to the Bone collection",
        price: 34.99,
        category: "T-Shirts",
        imageUrl: "/placeholder.svg?height=200&width=200",
        tapstitchId: "ts_pttb_001",
      },
    ]

    return NextResponse.json(mockProducts)
  } catch (error) {
    console.error("Tapstitch sync error:", error)
    return NextResponse.json({ error: "Failed to sync products from Tapstitch" }, { status: 500 })
  }
}
