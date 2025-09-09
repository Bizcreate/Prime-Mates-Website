import { type NextRequest, NextResponse } from "next/server"
import { getContract } from "thirdweb"
import { thirdwebClient } from "@/packages/prime-shared/thirdweb/client"
import { ethereum, polygon } from "thirdweb/chains"
import { readContract } from "thirdweb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contractAddress = searchParams.get("contract")
    const tokenId = searchParams.get("tokenId")
    const chain = searchParams.get("chain")

    if (!contractAddress || !tokenId || !chain) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    const contract = getContract({
      client: thirdwebClient,
      chain: chain === "ethereum" ? ethereum : polygon,
      address: contractAddress,
    })

    const tokenURI = await readContract({
      contract,
      method: "function tokenURI(uint256 tokenId) view returns (string)",
      params: [BigInt(tokenId)],
    })

    return NextResponse.json({ tokenURI })
  } catch (error) {
    console.error("Error fetching token URI:", error)
    return NextResponse.json({ error: "Failed to fetch token URI" }, { status: 500 })
  }
}
