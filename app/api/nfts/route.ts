import { type NextRequest, NextResponse } from "next/server"
import { fetchUserNFTs } from "@/lib/nft-utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("wallet")

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    console.log("[v0] Fetching NFTs for wallet:", walletAddress)

    const allNFTs = await fetchUserNFTs(walletAddress)

    console.log("[v0] Total NFTs found for wallet:", allNFTs.length)

    return NextResponse.json({
      success: true,
      nfts: allNFTs,
      total: allNFTs.length,
      wallet: walletAddress,
    })
  } catch (error) {
    console.error("[v0] Error in NFT API:", error)
    return NextResponse.json({ error: "Failed to fetch NFTs", details: error.message }, { status: 500 })
  }
}
