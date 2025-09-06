import { client } from "@/lib/client"
import { getContract, readContract } from "thirdweb"
import { COLLECTIONS } from "./web3-config"

interface NFTData {
  tokenId: string
  name: string
  image: string
  description?: string
  attributes?: Array<{ trait_type: string; value: string }>
  owner?: string
}

interface CollectionStats {
  address: string
  name: string
  chainId: number
  holders: number
  totalSupply: number
  topHolders: Array<{ address: string; count: number }>
}

function convertIpfsUrl(url: string): string {
  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/")
  }
  return url
}

function parseNFTMetadata(metadata: any): any {
  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata)
    } catch {
      return { name: metadata, image: "", description: "" }
    }
  }
  return metadata || {}
}

export async function fetchAllCollectionStats(): Promise<CollectionStats[]> {
  const stats: CollectionStats[] = []

  for (const collection of COLLECTIONS) {
    try {
      const contract = getContract({
        client,
        chain: collection.chain,
        address: collection.address,
      })

      const totalSupply = await readContract({
        contract,
        method: "function totalSupply() view returns (uint256)",
      })

      const mockHolders = Array.from({ length: 10 }, (_, i) => ({
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        count: Math.floor(Math.random() * 20) + 1,
      }))

      stats.push({
        address: collection.address,
        name: collection.name,
        chainId: collection.chainId,
        holders: Math.floor(Math.random() * 500) + 100,
        totalSupply: Number(totalSupply),
        topHolders: mockHolders,
      })
    } catch (error) {
      console.error(`Error fetching stats for ${collection.name}:`, error)
      stats.push({
        address: collection.address,
        name: collection.name,
        chainId: collection.chainId,
        holders: 250,
        totalSupply: 1000,
        topHolders: [],
      })
    }
  }

  return stats
}

export async function fetchCollectionNFTs(contractAddress: string, chainId: number, limit = 12): Promise<NFTData[]> {
  try {
    const collection = COLLECTIONS.find((c) => c.address.toLowerCase() === contractAddress.toLowerCase())
    if (!collection) {
      throw new Error("Collection not found")
    }

    const contract = getContract({
      client,
      chain: collection.chain,
      address: contractAddress,
    })

    const nfts: NFTData[] = []

    for (let i = 1; i <= limit; i++) {
      try {
        const tokenURI = await readContract({
          contract,
          method: "function tokenURI(uint256 tokenId) view returns (string)",
          params: [BigInt(i)],
        })

        if (tokenURI) {
          const metadataUrl = convertIpfsUrl(tokenURI)
          const response = await fetch(metadataUrl)
          const metadata = await response.json()
          const parsedMetadata = parseNFTMetadata(metadata)

          nfts.push({
            tokenId: i.toString(),
            name: parsedMetadata.name || `${collection.name} #${i}`,
            image: convertIpfsUrl(parsedMetadata.image || ""),
            description: parsedMetadata.description || "",
            attributes: parsedMetadata.attributes || [],
          })
        }
      } catch (error) {
        console.error(`Error fetching NFT ${i}:`, error)
        continue
      }
    }

    return nfts
  } catch (error) {
    console.error("Error fetching collection NFTs:", error)
    return []
  }
}

export async function fetchNFTByTokenId(
  contractAddress: string,
  tokenId: number,
  chainId: number,
): Promise<NFTData | null> {
  try {
    const collection = COLLECTIONS.find((c) => c.address.toLowerCase() === contractAddress.toLowerCase())
    if (!collection) {
      throw new Error("Collection not found")
    }

    const contract = getContract({
      client,
      chain: collection.chain,
      address: contractAddress,
    })

    const tokenURI = await readContract({
      contract,
      method: "function tokenURI(uint256 tokenId) view returns (string)",
      params: [BigInt(tokenId)],
    })

    if (!tokenURI) {
      return null
    }

    const metadataUrl = convertIpfsUrl(tokenURI)
    const response = await fetch(metadataUrl)
    const metadata = await response.json()
    const parsedMetadata = parseNFTMetadata(metadata)

    const owner = await readContract({
      contract,
      method: "function ownerOf(uint256 tokenId) view returns (address)",
      params: [BigInt(tokenId)],
    })

    return {
      tokenId: tokenId.toString(),
      name: parsedMetadata.name || `${collection.name} #${tokenId}`,
      image: convertIpfsUrl(parsedMetadata.image || ""),
      description: parsedMetadata.description || "",
      attributes: parsedMetadata.attributes || [],
      owner: owner as string,
    }
  } catch (error) {
    console.error("Error fetching NFT by token ID:", error)
    return null
  }
}
