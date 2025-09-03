import { client } from "./client"
import { getContract } from "thirdweb"
import { ethereum, polygon } from "thirdweb/chains"
import { getNFTs, ownerOf } from "thirdweb/extensions/erc721"

export const CONTRACTS = {
  PMBC: {
    address: "0x13178A7A8A1A9460dBE39f7eCcEbD91B31752b91",
    chain: ethereum,
  },
  PTTB: {
    address: "0x9690b63Eb85467BE5267A3603f770589Ab12Dc95",
    chain: polygon,
  },
}

export const convertIpfsUrl = (url) => {
  if (!url) return "/placeholder.svg?height=300&width=300"
  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/")
  }
  return url
}

export const parseNFTMetadata = async (metadata: any) => {
  if (!metadata) return {}

  // Handle different metadata formats
  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata)
    } catch (e) {
      return { name: metadata }
    }
  }

  // For Polygon NFTs, check if image field contains JSON metadata
  if (typeof metadata.image === "string" && metadata.image.startsWith("{")) {
    try {
      const jsonMetadata = JSON.parse(metadata.image)
      return { ...metadata, ...jsonMetadata }
    } catch (e) {
      // Keep original metadata if parsing fails
    }
  }

  return metadata
}

export const fetchUserNFTs = async (walletAddress) => {
  if (!walletAddress) return []

  try {
    const allNFTs = []

    // Fetch from both contracts
    for (const [collectionName, contractInfo] of Object.entries(CONTRACTS)) {
      const contract = getContract({
        client,
        chain: contractInfo.chain,
        address: contractInfo.address,
      })

      try {
        const nfts = await getNFTs({ contract, start: 0, count: 100 })

        for (const nft of nfts) {
          try {
            const owner = await ownerOf({ contract, tokenId: nft.id })

            if (owner.toLowerCase() === walletAddress.toLowerCase()) {
              let metadata = nft.metadata

              // Parse JSON metadata for Polygon NFTs
              if (contractInfo.chain.id === polygon.id && typeof metadata.image === "string") {
                try {
                  const jsonMetadata = JSON.parse(metadata.image)
                  metadata = { ...metadata, ...jsonMetadata }
                } catch (e) {
                  // Keep original metadata if parsing fails
                }
              }

              // Use parseNFTMetadata function to handle metadata parsing
              metadata = await parseNFTMetadata(metadata)

              allNFTs.push({
                ...nft,
                metadata: {
                  ...metadata,
                  image: convertIpfsUrl(metadata.image),
                },
                collection: collectionName,
                chain: contractInfo.chain.name,
                contractAddress: contractInfo.address,
              })
            }
          } catch (ownerError) {
            console.log(`[v0] Error checking ownership for NFT ${nft.id}:`, ownerError)
          }
        }
      } catch (contractError) {
        console.log(`[v0] Error fetching NFTs from ${collectionName}:`, contractError)
      }
    }

    return allNFTs
  } catch (error) {
    console.error("[v0] Error fetching user NFTs:", error)
    return []
  }
}
