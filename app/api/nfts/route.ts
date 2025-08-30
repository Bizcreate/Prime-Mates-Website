import { type NextRequest, NextResponse } from "next/server"
import { getContract, getNFTs } from "thirdweb"
import { ethereum, polygon } from "thirdweb/chains"
import { client } from "@/lib/client"
import { COLLECTIONS } from "@/config/contracts"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("wallet")

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    console.log("[v0] Fetching NFTs for wallet:", walletAddress)

    const allNFTs = []

    // Fetch PMBC NFTs from Ethereum
    try {
      const pmbcContract = getContract({
        client,
        chain: ethereum,
        address: COLLECTIONS.pmbc.address,
      })

      const pmbcNFTs = await getNFTs({
        contract: pmbcContract,
        start: 0,
        count: 100,
      })

      console.log("[v0] Found", pmbcNFTs.length, "PMBC NFTs total")

      // Filter NFTs owned by the wallet
      const ownedPMBC = []
      for (const nft of pmbcNFTs) {
        try {
          // Check if this NFT is owned by the wallet
          const owner = await nft.owner
          if (owner && owner.toLowerCase() === walletAddress.toLowerCase()) {
            ownedPMBC.push({
              id: nft.id.toString(),
              name: nft.metadata.name || `PMBC #${nft.id}`,
              image: nft.metadata.image || "/pmbc-nft.png",
              collection: "PMBC",
              chain: "ethereum",
              contractAddress: COLLECTIONS.pmbc.address,
              tokenId: nft.id.toString(),
              metadata: nft.metadata,
            })
          }
        } catch (error) {
          console.log("[v0] Error checking NFT ownership for token", nft.id.toString(), ":", error)
        }
      }

      console.log("[v0] User owns", ownedPMBC.length, "PMBC NFTs")
      allNFTs.push(...ownedPMBC)
    } catch (error) {
      console.error("[v0] Error fetching PMBC NFTs:", error)
    }

    // Fetch PTTB NFTs from Polygon
    try {
      const pttbContract = getContract({
        client,
        chain: polygon,
        address: COLLECTIONS.pttb.address,
      })

      const pttbNFTs = await getNFTs({
        contract: pttbContract,
        start: 0,
        count: 100,
      })

      console.log("[v0] Found", pttbNFTs.length, "PTTB NFTs total")

      // Filter NFTs owned by the wallet
      const ownedPTTB = []
      for (const nft of pttbNFTs) {
        try {
          const owner = await nft.owner
          if (owner && owner.toLowerCase() === walletAddress.toLowerCase()) {
            ownedPTTB.push({
              id: nft.id.toString(),
              name: nft.metadata.name || `PTTB #${nft.id}`,
              image: nft.metadata.image || "/pttb-nft.png",
              collection: "PTTB",
              chain: "polygon",
              contractAddress: COLLECTIONS.pttb.address,
              tokenId: nft.id.toString(),
              metadata: nft.metadata,
            })
          }
        } catch (error) {
          console.log("[v0] Error checking NFT ownership for token", nft.id.toString(), ":", error)
        }
      }

      console.log("[v0] User owns", ownedPTTB.length, "PTTB NFTs")
      allNFTs.push(...ownedPTTB)
    } catch (error) {
      console.error("[v0] Error fetching PTTB NFTs:", error)
    }

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
