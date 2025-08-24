import { readContract, readContracts } from "wagmi/actions"
import { config, ERC721_ABI } from "./web3-config"
import { formatEther } from "viem"

export interface NFTMetadata {
  id: string
  name: string
  image: string
  tokenId: number
  collection: string
  rarity?: string
  contractAddress: string
  chainId: number
}

export interface NFTTokenData {
  tokenId: string
  name: string
  image: string
  description?: string
  attributes?: Array<{ trait_type: string; value: string }>
  owner?: string
}

export async function fetchNFTMetadata(tokenURI: string): Promise<any> {
  try {
    // Handle IPFS URLs
    let url = tokenURI
    if (tokenURI.startsWith("ipfs://")) {
      url = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const metadata = await response.json()

    // Process image URL
    if (metadata.image && metadata.image.startsWith("ipfs://")) {
      metadata.image = metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
    }

    return metadata
  } catch (error) {
    console.error("Failed to fetch NFT metadata:", error)
    return null
  }
}

export async function fetchNFTByTokenId(
  contractAddress: string,
  tokenId: number,
  chainId: number,
): Promise<NFTTokenData | null> {
  try {
    console.log(`[v0] Fetching NFT ${tokenId} from contract ${contractAddress} on chain ${chainId}`)

    // Check if token exists by trying to get owner
    const owner = await readContract(config, {
      address: contractAddress as `0x${string}`,
      abi: ERC721_ABI,
      functionName: "ownerOf",
      args: [BigInt(tokenId)],
      chainId,
    })

    if (!owner) {
      console.log(`[v0] Token ${tokenId} does not exist or not minted yet`)
      return null
    }

    console.log(`[v0] Token ${tokenId} owned by: ${owner}`)

    // Get token URI
    const tokenURI = await readContract(config, {
      address: contractAddress as `0x${string}`,
      abi: ERC721_ABI,
      functionName: "tokenURI",
      args: [BigInt(tokenId)],
      chainId,
    })

    console.log(`[v0] Token URI: ${tokenURI}`)

    // Fetch metadata
    const metadata = await fetchNFTMetadata(tokenURI as string)

    if (metadata) {
      return {
        tokenId: tokenId.toString(),
        name: metadata.name || `Token #${tokenId}`,
        image: metadata.image || "/abstract-nft-concept.png",
        description: metadata.description,
        attributes: metadata.attributes || [],
        owner: owner as string,
      }
    }

    // Fallback if metadata fetch fails
    return {
      tokenId: tokenId.toString(),
      name: `Token #${tokenId}`,
      image: "/abstract-nft-concept.png",
      description: `NFT #${tokenId} from this collection`,
      attributes: [{ trait_type: "Status", value: "Minted" }],
      owner: owner as string,
    }
  } catch (error) {
    console.log(`[v0] Token ${tokenId} does not exist or not minted yet`)
    return null
  }
}

export async function fetchCollectionNFTs(
  contractAddress: string,
  chainId: number,
  startId = 1,
  count = 12,
): Promise<NFTTokenData[]> {
  try {
    console.log(`[v0] Fetching ${count} NFTs from collection ${contractAddress}`)

    let totalSupply = 0
    try {
      const supply = await readContract(config, {
        address: contractAddress as `0x${string}`,
        abi: ERC721_ABI,
        functionName: "totalSupply",
        chainId,
      })
      totalSupply = Number(supply)
      console.log(`[v0] Collection total supply: ${totalSupply}`)
    } catch (error) {
      console.log("[v0] Could not get total supply, using fallback")
      if (contractAddress.toLowerCase() === "0x46d5dcd9d8a9ca46e7972f53d584e14845968cf8") {
        // Prime Halloween might be on Ethereum mainnet, not Polygon
        if (chainId === 137) {
          // Try Ethereum mainnet instead
          return await fetchCollectionNFTs(contractAddress, 1, startId, count)
        }
        startId = 1
        totalSupply = 666 // Known supply from collection details
      } else if (chainId === 137) {
        // Polygon
        startId = 0 // Some Polygon contracts start from 0
        totalSupply = 1000 // Increased fallback for larger collections
      }
    }

    const nfts: NFTTokenData[] = []

    const tokenIds = []
    if (contractAddress.toLowerCase() === "0x46d5dcd9d8a9ca46e7972f53d584e14845968cf8") {
      for (let i = 1; i <= count && i <= 666; i++) {
        tokenIds.push(i)
      }
    } else if (startId === 1 && totalSupply === 0) {
      // Try both 0-based and 1-based indexing
      for (let i = 0; i < count / 2; i++) {
        tokenIds.push(i)
      }
      for (let i = 1; i <= count / 2; i++) {
        tokenIds.push(i)
      }
    } else {
      for (let i = startId; i < startId + count && i <= totalSupply; i++) {
        tokenIds.push(i)
      }
    }

    // Try to fetch NFTs in parallel for better performance
    const tokenPromises: Promise<NFTTokenData | null>[] = []

    for (const tokenId of tokenIds) {
      tokenPromises.push(fetchNFTByTokenId(contractAddress, tokenId, chainId))
    }

    const results = await Promise.allSettled(tokenPromises)

    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        nfts.push(result.value)
      }
    })

    console.log(`[v0] Successfully fetched ${nfts.length} NFTs`)

    if (nfts.length > 0) {
      console.log(`[v0] Successfully loaded ${nfts.length} real NFTs`)
      return nfts
    } else {
      console.log(`[v0] No real NFTs found, using placeholders`)
      return []
    }
  } catch (error) {
    console.error("[v0] Error fetching collection NFTs:", error)
    return []
  }
}

export async function fetchUserNFTs(
  userAddress: string,
  contractAddress?: string,
  chainId?: number,
): Promise<NFTTokenData[]> {
  if (contractAddress && chainId) {
    // Get NFTs from specific collection
    try {
      const balance = await readContract(config, {
        address: contractAddress as `0x${string}`,
        abi: ERC721_ABI,
        functionName: "balanceOf",
        args: [userAddress as `0x${string}`],
        chainId,
      })

      const balanceNum = Number(balance)
      console.log(`[v0] User has ${balanceNum} NFTs in collection ${contractAddress}`)

      if (balanceNum > 0) {
        const userNFTs: NFTTokenData[] = []
        const maxTokensToCheck = Math.min(balanceNum * 10, 100)
        let foundTokens = 0

        for (let tokenId = 1; tokenId <= maxTokensToCheck && foundTokens < balanceNum; tokenId++) {
          try {
            const owner = await readContract(config, {
              address: contractAddress as `0x${string}`,
              abi: ERC721_ABI,
              functionName: "ownerOf",
              args: [BigInt(tokenId)],
              chainId,
            })

            if (owner?.toLowerCase() === userAddress.toLowerCase()) {
              const nftData = await fetchNFTByTokenId(contractAddress, tokenId, chainId)
              if (nftData) {
                userNFTs.push(nftData)
                foundTokens++
              }
            }
          } catch (error) {
            // Token doesn't exist, continue
          }
        }

        return userNFTs
      }
    } catch (error) {
      console.error(`Error fetching NFTs for collection ${contractAddress}:`, error)
    }

    return []
  } else {
    // Get NFTs from all collections (convert NFTMetadata to NFTTokenData format)
    const collections = [
      { address: "0x12662b6a2a424a0090b7d09401fb775a9b968898", name: "Prime Mates Board Club", chainId: 1 },
      { address: "0x72bcde3c41c4afa153f8e7849a9cf64e2cc84e75", name: "Prime To The Bone", chainId: 137 },
      { address: "0x46d5dcd9d8a9ca46e7972f53d584e14845968cf8", name: "Prime Halloween", chainId: 1 }, // Try Ethereum mainnet
      { address: "0xab9f149a82c6ad66c3795fbceb06ec351b13cfcf", name: "Prime Mates Christmas Club", chainId: 137 },
    ]

    const userNFTs: NFTTokenData[] = []

    for (const collection of collections) {
      try {
        // Get user's balance for this collection
        const balance = await readContract(config, {
          address: collection.address as `0x${string}`,
          abi: ERC721_ABI,
          functionName: "balanceOf",
          args: [userAddress as `0x${string}`],
          chainId: collection.chainId,
        })

        const balanceNum = Number(balance)
        console.log(`[v0] User has ${balanceNum} NFTs in ${collection.name}`)

        if (balanceNum > 0) {
          // Try to find user's tokens by checking ownership
          // This is a simplified approach - in production you'd use events or indexing
          const maxTokensToCheck = Math.min(balanceNum * 10, 100) // Check up to 100 tokens
          let foundTokens = 0

          for (let tokenId = 1; tokenId <= maxTokensToCheck && foundTokens < balanceNum; tokenId++) {
            try {
              const owner = await readContract(config, {
                address: collection.address as `0x${string}`,
                abi: ERC721_ABI,
                functionName: "ownerOf",
                args: [BigInt(tokenId)],
                chainId: collection.chainId,
              })

              if (owner?.toLowerCase() === userAddress.toLowerCase()) {
                const nftData = await fetchNFTByTokenId(collection.address, tokenId, collection.chainId)
                if (nftData) {
                  userNFTs.push(nftData)
                  foundTokens++
                }
              }
            } catch (error) {
              // Token doesn't exist or other error, continue
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching NFTs for ${collection.name}:`, error)
      }
    }

    return userNFTs
  }
}

export async function getCollectionStats(contractAddress: string, chainId: number) {
  try {
    const contracts = [
      {
        address: contractAddress as `0x${string}`,
        abi: ERC721_ABI,
        functionName: "totalSupply",
        chainId,
      },
      {
        address: contractAddress as `0x${string}`,
        abi: ERC721_ABI,
        functionName: "maxSupply",
        chainId,
      },
      {
        address: contractAddress as `0x${string}`,
        abi: ERC721_ABI,
        functionName: "mintPrice",
        chainId,
      },
    ]

    const results = await readContracts(config, { contracts })

    return {
      totalSupply: results[0].status === "success" ? Number(results[0].result) : 0,
      maxSupply: results[1].status === "success" ? Number(results[1].result) : 0,
      mintPrice: results[2].status === "success" ? formatEther(results[2].result as bigint) : "0",
    }
  } catch (error) {
    console.error("Error fetching collection stats:", error)
    return { totalSupply: 0, maxSupply: 0, mintPrice: "0" }
  }
}

export async function fetchCollectionHolders(
  contractAddress: string,
  chainId: number,
): Promise<Array<{ address: string; count: number }>> {
  try {
    const holders: Map<string, number> = new Map()

    // Get total supply first
    let totalSupply = 0
    try {
      const supply = await readContract(config, {
        address: contractAddress as `0x${string}`,
        abi: ERC721_ABI,
        functionName: "totalSupply",
        chainId,
      })
      totalSupply = Number(supply)
    } catch (error) {
      // Use fallback supplies based on collection
      if (contractAddress.toLowerCase() === "0x12662b6a2a424a0090b7d09401fb775a9b968898")
        totalSupply = 1662 // PMBC
      else if (contractAddress.toLowerCase() === "0x72bcde3c41c4afa153f8e7849a9cf64e2cc84e75")
        totalSupply = 439 // PTTB
      else if (contractAddress.toLowerCase() === "0x46d5dcd9d8a9ca46e7972f53d584e14845968cf8")
        totalSupply = 666 // Halloween
      else if (contractAddress.toLowerCase() === "0xab9f149a82c6ad66c3795fbceb06ec351b13cfcf") totalSupply = 1112 // Christmas
    }

    // Sample a portion of tokens to get holder distribution (checking all would be too expensive)
    const sampleSize = Math.min(100, totalSupply)
    const step = Math.max(1, Math.floor(totalSupply / sampleSize))

    for (let tokenId = 1; tokenId <= totalSupply; tokenId += step) {
      try {
        const owner = await readContract(config, {
          address: contractAddress as `0x${string}`,
          abi: ERC721_ABI,
          functionName: "ownerOf",
          args: [BigInt(tokenId)],
          chainId,
        })

        if (owner) {
          const ownerStr = owner as string
          holders.set(ownerStr, (holders.get(ownerStr) || 0) + step)
        }
      } catch (error) {
        // Token doesn't exist, continue
      }
    }

    // Convert to array and sort by count
    return Array.from(holders.entries())
      .map(([address, count]) => ({ address, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50) // Top 50 holders
  } catch (error) {
    console.error("Error fetching collection holders:", error)
    return []
  }
}

export async function fetchAllCollectionStats() {
  const collections = [
    { address: "0x12662b6a2a424a0090b7d09401fb775a9b968898", name: "Prime Mates Board Club", chainId: 1 },
    { address: "0x72bcde3c41c4afa153f8e7849a9cf64e2cc84e75", name: "Prime To The Bone", chainId: 137 },
    { address: "0x46d5dcd9d8a9ca46e7972f53d584e14845968cf8", name: "Prime Halloween", chainId: 1 }, // Try Ethereum mainnet
    { address: "0xab9f149a82c6ad66c3795fbceb06ec351b13cfcf", name: "Prime Mates Christmas Club", chainId: 137 },
  ]

  const stats = []

  for (const collection of collections) {
    try {
      const holders = await fetchCollectionHolders(collection.address, collection.chainId)
      const collectionStats = await getCollectionStats(collection.address, collection.chainId)

      stats.push({
        ...collection,
        holders: holders.length,
        totalSupply: collectionStats.totalSupply,
        topHolders: holders.slice(0, 10),
      })
    } catch (error) {
      console.error(`Error fetching stats for ${collection.name}:`, error)
    }
  }

  return stats
}
