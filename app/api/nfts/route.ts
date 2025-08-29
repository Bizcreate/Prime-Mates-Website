import { type NextRequest, NextResponse } from "next/server"
import { createThirdwebClient, getContract } from "thirdweb"
import { getNFTs } from "thirdweb/extensions/erc721"
import { ethereum, polygon } from "thirdweb/chains"

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "053f689d02c509dbd4ddac25f35a002b",
})

const CONTRACTS = {
  PMBC: {
    address: "0x13374200c29C757FDCc72F15Da98fb94f286d71e" as const,
    chain: ethereum,
    name: "Prime Mates Board Club",
  },
  PTTB: {
    address: "0x6Be69B2a9b153737887cfcdca7781ed1511c7e36" as const,
    chain: polygon,
    name: "Prime To The Bone",
  },
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("wallet")

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    console.log("[v0] Fetching NFTs for wallet:", walletAddress)

    const allNFTs = []

    // Fetch from PMBC (Ethereum)
    try {
      const pmbcContract = getContract({
        client,
        chain: CONTRACTS.PMBC.chain,
        address: CONTRACTS.PMBC.address,
      })

      const pmbcNFTs = await getNFTs({
        contract: pmbcContract,
        start: 0,
        count: 100,
      })

      // Filter NFTs owned by the wallet
      const ownedPMBC = pmbcNFTs.filter((nft) => nft.owner?.toLowerCase() === walletAddress.toLowerCase())

      allNFTs.push(
        ...ownedPMBC.map((nft) => ({
          ...nft,
          collection: "PMBC",
          collectionName: CONTRACTS.PMBC.name,
          chain: "ethereum",
        })),
      )

      console.log("[v0] Found", ownedPMBC.length, "PMBC NFTs")
    } catch (error) {
      console.error("[v0] Error fetching PMBC NFTs:", error)
    }

    // Fetch from PTTB (Polygon)
    try {
      const pttbContract = getContract({
        client,
        chain: CONTRACTS.PTTB.chain,
        address: CONTRACTS.PTTB.address,
      })

      const pttbNFTs = await getNFTs({
        contract: pttbContract,
        start: 0,
        count: 100,
      })

      // Filter NFTs owned by the wallet
      const ownedPTTB = pttbNFTs.filter((nft) => nft.owner?.toLowerCase() === walletAddress.toLowerCase())

      allNFTs.push(
        ...ownedPTTB.map((nft) => ({
          ...nft,
          collection: "PTTB",
          collectionName: CONTRACTS.PTTB.name,
          chain: "polygon",
        })),
      )

      console.log("[v0] Found", ownedPTTB.length, "PTTB NFTs")
    } catch (error) {
      console.error("[v0] Error fetching PTTB NFTs:", error)
    }

    console.log("[v0] Total NFTs found:", allNFTs.length)

    return NextResponse.json({
      nfts: allNFTs,
      total: allNFTs.length,
      wallet: walletAddress,
    })
  } catch (error) {
    console.error("[v0] Error in NFT API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch NFTs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
