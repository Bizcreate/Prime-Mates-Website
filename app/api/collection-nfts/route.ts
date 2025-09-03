import { type NextRequest, NextResponse } from "next/server"
import { createThirdwebClient, getContract } from "thirdweb"
import { ethereum, polygon } from "thirdweb/chains"
import { getNFTs } from "thirdweb/extensions/erc721"
import { convertIpfsUrl, parseNFTMetadata } from "@/lib/nft-utils"

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")
    const chainId = searchParams.get("chainId")
    const limit = Number.parseInt(searchParams.get("limit") || "12")

    if (!address || !chainId) {
      return NextResponse.json({ success: false, error: "Missing address or chainId" })
    }

    console.log("[v0] Fetching collection NFTs for:", address, "on chain:", chainId)

    const chain = chainId === "1" ? ethereum : polygon
    const contract = getContract({
      client,
      chain,
      address,
    })

    // Fetch NFTs from the collection
    const nfts = await getNFTs({
      contract,
      start: 0,
      count: limit,
    })

    console.log("[v0] Found", nfts.length, "NFTs in collection")

    const processedNFTs = await Promise.all(
      nfts.map(async (nft) => {
        const metadata = await parseNFTMetadata(nft.metadata)
        return {
          tokenId: nft.id.toString(),
          name: metadata.name || `Token #${nft.id}`,
          image: convertIpfsUrl(metadata.image || ""),
          description: metadata.description || "",
          attributes: metadata.attributes || [],
          owner: nft.owner || "",
        }
      }),
    )

    return NextResponse.json({
      success: true,
      nfts: processedNFTs,
      total: processedNFTs.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching collection NFTs:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      nfts: [],
    })
  }
}
