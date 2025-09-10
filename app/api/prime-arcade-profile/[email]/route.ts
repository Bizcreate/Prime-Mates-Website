import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { email: string } }) {
  try {
    const { email } = params

    // This would connect to your Prime Arcade database/API
    // For now, returning mock data structure - replace with actual Prime Arcade API call

    console.log("[v0] Looking up Prime Arcade account for email:", email)

    // Mock Prime Arcade account data - replace with actual API call
    const mockPrimeArcadeAccount = {
      id: "prime_arcade_user_123",
      name: "Jazie Lewis",
      email: email,
      connectedWallets: ["0x554188...40926d"], // User's existing wallets
      createdAt: "2024-01-01T00:00:00.000Z",
      memberTier: "Bronze",
      balance: 83612,
      energy: 444,
      shakaBalance: 3175,
      levelProgress: 6,
      achievements: ["Bronze"],
      twitterProfile: "@Jazielewis1",
      shippingAddress: {
        street: "717/3 gearin alley",
        city: "Mascot",
        state: "NSW",
        zipCode: "2020",
        country: "Australia",
      },
    }

    // TODO: Replace with actual Prime Arcade API call
    // const primeArcadeResponse = await fetch(`${PRIME_ARCADE_API_URL}/users/${email}`)
    // if (!primeArcadeResponse.ok) {
    //   return NextResponse.json({ error: "Prime Arcade account not found" }, { status: 404 })
    // }
    // const primeArcadeAccount = await primeArcadeResponse.json()

    return NextResponse.json(mockPrimeArcadeAccount)
  } catch (error) {
    console.error("[v0] Error fetching Prime Arcade profile:", error)
    return NextResponse.json({ error: "Failed to fetch Prime Arcade profile" }, { status: 500 })
  }
}
