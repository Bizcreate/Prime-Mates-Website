import { type NextRequest, NextResponse } from "next/server"
import { getContract } from "thirdweb"
import { client } from "@/packages/prime-shared/thirdweb/client"
import { ethereum, polygon } from "thirdweb/chains"
import { readContract } from "thirdweb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contractAddress = searchParams.get("contract")
    const owner = searchParams.get("owner")
    const index = searchParams.get("index")
    const chain = searchParams.get("chain")

    if (!contractAddress || !owner || !index || !chain) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    const contract = getContract({
      client,
      chain: chain === "ethereum" ? ethereum : polygon,
      address: contractAddress,
    })

    const tokenId = await readContract({
      contract,
      method: "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
      params: [owner as `0x${string}`, BigInt(index)],
    })

    return NextResponse.json({ tokenId: tokenId.toString() })
  } catch (error) {
    console.error("Error fetching token by index:", error)
    return NextResponse.json({ error: "Failed to fetch token" }, { status: 500 })
  }
}
