import { type NextRequest, NextResponse } from "next/server"
import { createThirdwebClient, getContract } from "thirdweb"
import { ethereum, polygon } from "thirdweb/chains"
import { getNFT } from "thirdweb/extensions/erc721"
import { convertIpfsUrl, parseNFTMetadata } from "@/lib/nft-utils"

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")
    const chainId = searchParams.get("chainId")
    const tokenId = searchParams.get("tokenId")

    if (!address || !chainId || !tokenId) {
      return NextResponse.json({ success: false, error: "Missing required parameters" })
    }

    console.log("[v0] Fetching NFT details for token:", tokenId, "in collection:", address)

    const chain = chainId === "1" ? ethereum : polygon
    const contract = getContract({
      client,
      chain,
      address,
    })

    // Fetch specific NFT
    const nft = await getNFT({
      contract,
      tokenId: BigInt(tokenId),
    })

    const metadata = await parseNFTMetadata(nft.metadata)

    const processedNFT = {
      tokenId: nft.id.toString(),
      name: metadata.name || `Token #${nft.id}`,
      image: convertIpfsUrl(metadata.image || ""),
      description: metadata.description || "",
      attributes: metadata.attributes || [],
      owner: nft.owner || "",
    }

    return NextResponse.json({
      success: true,
      nft: processedNFT,
    })
  } catch (error) {
    console.error("[v0] Error fetching NFT details:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      nft: null,
    })
  }
}
