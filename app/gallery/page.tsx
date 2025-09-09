"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ExternalLink, Loader2, Palette, RefreshCw } from "lucide-react"
import { useActiveAccount } from "thirdweb/react"
import { Insight } from "thirdweb"
import { ethereum, polygon } from "thirdweb/chains"
import { thirdwebClient } from "@/packages/prime-shared/thirdweb/client"
import { ConnectWidget } from "@/components/ConnectWidget"

const collections = [
  {
    name: "Prime Mates Board Club",
    address: "0x12662b6a2a424a0090b7d09401fb775a9b968898",
    totalSupply: 2222,
    theme: "gold",
    chainId: 1,
  },
  {
    name: "Prime To The Bone",
    address: "0x72bcde3c41c4afa153f8e7849a9cf64e2cc84e75",
    totalSupply: 999,
    theme: "red",
    chainId: 137,
  },
  {
    name: "Prime Halloween",
    address: "0x46d5dcd9d8a9ca46e7972f53d584e14845968cf8",
    totalSupply: 666,
    theme: "orange",
    chainId: 1,
  },
  {
    name: "Prime Mates Christmas Club",
    address: "0xab9f149a82c6ad66c3795fbceb06ec351b13cfcf",
    totalSupply: 1111,
    theme: "green",
    chainId: 137,
  },
] as const

interface NFTData {
  tokenId: string
  name: string
  image: string
  description?: string
  attributes?: Array<{ trait_type: string; value: string }>
  owner?: string | null
  collection?: string
  tokenAddress?: string
  chainId?: number
}

const IPFS_GATEWAYS = ["https://ipfs.io/ipfs/", "https://cloudflare-ipfs.com/ipfs/", "https://nftstorage.link/ipfs/"]

function ipfsToHttp(url?: string): string | undefined {
  if (!url) return undefined
  if (!url.startsWith("ipfs://")) return url
  const rest = url.replace("ipfs://", "")
  return `${IPFS_GATEWAYS[0]}${rest}`
}

function pickImage(meta: any): string {
  return (
    ipfsToHttp(meta?.image) ||
    ipfsToHttp(meta?.image_url) ||
    ipfsToHttp(meta?.imageURI) ||
    ipfsToHttp(meta?.animation_url) ||
    "/prime-mates-nft.jpg"
  )
}

function chainFromId(id: number) {
  return id === 1 ? ethereum : polygon
}

function openSeaUrl(chainId: number, contract: string, tokenId: string | number) {
  const base = chainId === 1 ? "ethereum" : "matic"
  return `https://opensea.io/assets/${base}/${contract}/${tokenId}`
}

function themeGradient(theme: string) {
  switch (theme) {
    case "gold":
      return "from-yellow-500 to-yellow-600"
    case "red":
      return "from-red-500 to-red-600"
    case "orange":
      return "from-orange-500 to-orange-600"
    case "green":
      return "from-green-500 to-green-600"
    default:
      return "from-yellow-500 to-yellow-600"
  }
}

export default function GalleryPage() {
  const account = useActiveAccount()
  const walletAddress = account?.address
  const isConnected = !!account

  const [activeTab, setActiveTab] = useState("collections")

  // Collections tab state
  const [selectedCollection, setSelectedCollection] = useState<(typeof collections)[number]>(collections[0])
  const [searchTokenId, setSearchTokenId] = useState("")
  const [nfts, setNfts] = useState<NFTData[]>([])
  const [searchedNFT, setSearchedNFT] = useState<NFTData | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const perPage = 12

  // My collection state
  const [userNFTs, setUserNFTs] = useState<NFTData[]>([])
  const [walletLoading, setWalletLoading] = useState(false)

  const collectionByAddr = useMemo(
    () => Object.fromEntries(collections.map((c) => [c.address.toLowerCase(), { name: c.name, chainId: c.chainId }])),
    [],
  )

  async function loadUserNFTs() {
    if (!isConnected || !walletAddress) {
      setUserNFTs([])
      return
    }
    setWalletLoading(true)
    try {
      const addrs = collections.map((c) => c.address)
      const owned = await Insight.getOwnedNFTs({
        client: thirdwebClient,
        chains: [ethereum, polygon],
        ownerAddress: walletAddress,
        contractAddresses: addrs,
        includeMetadata: true,
        queryOptions: { resolve_metadata_links: "true", limit: 500 },
      })

      const mapped: NFTData[] = owned.map((n) => {
        const meta = n.metadata || {}
        const info = collectionByAddr[n.tokenAddress.toLowerCase()]
        return {
          tokenId: n.id.toString(),
          name: meta.name || `${info?.name ?? "Token"} #${n.id.toString()}`,
          image: pickImage(meta),
          description: meta.description,
          attributes: Array.isArray(meta.attributes) ? meta.attributes : [],
          owner: n.owner,
          collection: info?.name,
          tokenAddress: n.tokenAddress,
          chainId: n.chainId,
        }
      })

      mapped.sort((a, b) =>
        a.collection === b.collection
          ? Number(a.tokenId) - Number(b.tokenId)
          : (a.collection || "").localeCompare(b.collection || ""),
      )

      setUserNFTs(mapped)
    } catch (err) {
      console.error("[gallery] loadUserNFTs error", err)
      setUserNFTs([])
    } finally {
      setWalletLoading(false)
    }
  }

  async function loadCollectionNFTs(reset = false) {
    setLoading(true)
    try {
      const usePage = reset ? 1 : page
      const chain = chainFromId(selectedCollection.chainId)

      const list = await Insight.getContractNFTs({
        client: thirdwebClient,
        chains: [chain],
        contractAddress: selectedCollection.address,
        includeMetadata: true,
        includeOwners: true,
        queryOptions: { resolve_metadata_links: "true", limit: perPage, page: usePage },
      })

      const mapped: NFTData[] = list.map((n) => ({
        tokenId: n.id.toString(),
        name: n.metadata?.name || `${selectedCollection.name} #${n.id.toString()}`,
        image: pickImage(n.metadata),
        description: n.metadata?.description,
        attributes: Array.isArray(n.metadata?.attributes) ? n.metadata?.attributes : [],
        owner: n.owner,
        collection: selectedCollection.name,
        tokenAddress: n.tokenAddress,
        chainId: n.chainId,
      }))

      setNfts((prev) => (reset ? mapped : [...prev, ...mapped]))
      if (reset) setPage(1)
    } catch (err) {
      console.error("[gallery] loadCollectionNFTs error", err)
      setNfts([])
    } finally {
      setLoading(false)
    }
  }

  async function searchNFT() {
    if (!searchTokenId || isNaN(Number(searchTokenId))) return
    setLoading(true)
    try {
      const tokenId = BigInt(searchTokenId)
      const nft = await Insight.getNFT({
        client: thirdwebClient,
        chain: chainFromId(selectedCollection.chainId),
        contractAddress: selectedCollection.address,
        tokenId,
        includeOwners: true,
        queryOptions: { resolve_metadata_links: "true" },
      })

      if (nft) {
        const meta = nft.metadata || {}
        setSearchedNFT({
          tokenId: nft.id.toString(),
          name: meta.name || `${selectedCollection.name} #${nft.id.toString()}`,
          image: pickImage(meta),
          description: meta.description,
          attributes: Array.isArray(meta.attributes) ? meta.attributes : [],
          owner: nft.owner,
          collection: selectedCollection.name,
          tokenAddress: nft.tokenAddress,
          chainId: nft.chainId,
        })
      } else {
        setSearchedNFT({
          tokenId: tokenId.toString(),
          name: `${selectedCollection.name} #${tokenId.toString()}`,
          image: "/abstract-nft-concept.png",
          description: `${selectedCollection.name} NFT #${tokenId.toString()} - This token may not be minted yet.`,
          attributes: [{ trait_type: "Status", value: "Not Minted" }],
        })
      }
    } catch (err) {
      console.error("[gallery] searchNFT error", err)
    } finally {
      setLoading(false)
    }
  }

  function isNFTOwned(nft: NFTData): boolean {
    if (!walletAddress || !nft.owner) return false
    return walletAddress.toLowerCase() === nft.owner.toLowerCase()
  }

  function openGestureBuilder(nft: NFTData, collectionName: string) {
    const slug = collectionName.toLowerCase().replace(/\s+/g, "-")
    window.location.href = `/gesture/${slug}/${nft.tokenId}`
  }

  useEffect(() => {
    if (activeTab === "collections") {
      setSearchedNFT(null)
      setNfts([])
      setPage(1)
      loadCollectionNFTs(true)
    }
  }, [selectedCollection, activeTab])

  useEffect(() => {
    loadUserNFTs()
  }, [isConnected, walletAddress])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-gray-900 to-black py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                NFT Collection Gallery
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Explore the complete Prime Mates NFT ecosystem. Browse collections, search specific tokens, and discover
              unique digital art.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900 border border-gray-800 mb-8">
            <TabsTrigger
              value="collections"
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              Collections
            </TabsTrigger>
            <TabsTrigger
              value="my-collection"
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              My Collection
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collections">
            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-6 mb-12">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Collection</label>
                <Select
                  value={selectedCollection.address}
                  onValueChange={(value) => {
                    const c = collections.find((x) => x.address === value)
                    if (c) setSelectedCollection(c)
                  }}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {collections.map((c) => (
                      <SelectItem key={c.address} value={c.address} className="text-white hover:bg-gray-700">
                        {c.name} ({c.totalSupply} NFTs)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">Search Token ID</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={`1 - ${selectedCollection.totalSupply}`}
                    value={searchTokenId}
                    onChange={(e) => setSearchTokenId(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    min={1}
                    max={selectedCollection.totalSupply}
                  />
                  <Button
                    onClick={searchNFT}
                    disabled={loading || !searchTokenId}
                    className={`bg-gradient-to-r ${themeGradient(selectedCollection.theme)} hover:opacity-90 text-black font-semibold`}
                    aria-label="Search NFT by token id"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={() => loadCollectionNFTs(true)}
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                    aria-label="Refresh collection"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Collection Info */}
            <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedCollection.name}</h2>
                  <p className="text-gray-400">Contract: {selectedCollection.address}</p>
                  <p className="text-gray-500 text-sm">
                    Network: {selectedCollection.chainId === 1 ? "Ethereum" : "Polygon"}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold bg-gradient-to-r ${themeGradient(selectedCollection.theme)} bg-clip-text text-transparent`}
                    >
                      {selectedCollection.totalSupply}
                    </div>
                    <div className="text-sm text-gray-400">Total Supply</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Result */}
            {searchedNFT && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold mb-6 text-center">
                  <span
                    className={`bg-gradient-to-r ${themeGradient(selectedCollection.theme)} bg-clip-text text-transparent`}
                  >
                    Search Result
                  </span>
                </h3>
                <div className="max-w-md mx-auto">
                  <Card className="bg-gray-900 border-gray-800 hover:border-yellow-500 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-800">
                        <img
                          src={searchedNFT.image || "/placeholder.svg"}
                          alt={searchedNFT.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => ((e.target as HTMLImageElement).src = "/prime-mates-nft.jpg")}
                        />
                      </div>
                      <h4 className="font-bold text-lg mb-2">{searchedNFT.name}</h4>
                      <p className="text-gray-400 text-sm mb-3">{searchedNFT.description}</p>
                      {searchedNFT.attributes?.length ? (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {searchedNFT.attributes.map((attr, i) => (
                            <Badge key={i} variant="secondary" className="bg-gray-800 text-gray-300">
                              {attr.trait_type}: {attr.value}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                      {searchedNFT.tokenAddress && searchedNFT.chainId && (
                        <a
                          href={openSeaUrl(searchedNFT.chainId, searchedNFT.tokenAddress, searchedNFT.tokenId)}
                          target="_blank"
                          rel="noreferrer"
                          className="block"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black bg-transparent"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View on OpenSea
                          </Button>
                        </a>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Collection Grid */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-center">
                <span
                  className={`bg-gradient-to-r ${themeGradient(selectedCollection.theme)} bg-clip-text text-transparent`}
                >
                  Collection Preview
                </span>
              </h3>

              {loading && nfts.length === 0 ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                  <span className="ml-2 text-gray-400">Loading NFTs...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {nfts.map((nft) => (
                      <Card
                        key={`${nft.tokenAddress}-${nft.tokenId}`}
                        className="bg-gray-900 border-gray-800 hover:border-yellow-500 transition-all duration-300 group"
                      >
                        <CardContent className="p-4">
                          <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-800">
                            <img
                              src={nft.image || "/placeholder.svg"}
                              alt={nft.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => ((e.target as HTMLImageElement).src = "/prime-mates-nft.jpg")}
                            />
                          </div>
                          <h4 className="font-bold text-lg mb-2">{nft.name}</h4>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{nft.description}</p>
                          {nft.attributes?.length ? (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {nft.attributes.slice(0, 2).map((attr, i) => (
                                <Badge key={i} variant="secondary" className="bg-gray-800 text-gray-300 text-xs">
                                  {attr.value}
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                          <div className="flex gap-2">
                            {isNFTOwned(nft) && (
                              <Button
                                onClick={() => openGestureBuilder(nft, selectedCollection.name)}
                                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white"
                                size="sm"
                              >
                                <Palette className="w-4 h-4 mr-2" />
                                Add Gesture
                              </Button>
                            )}
                            {nft.tokenAddress && nft.chainId && (
                              <a
                                href={openSeaUrl(nft.chainId, nft.tokenAddress, nft.tokenId)}
                                target="_blank"
                                rel="noreferrer"
                                className={isNFTOwned(nft) ? "flex-1" : "w-full"}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black bg-transparent"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={() => {
                        setPage((p) => p + 1)
                        loadCollectionNFTs()
                      }}
                      disabled={loading}
                      variant="outline"
                      className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load More"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-collection">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  My NFT Collection
                </span>
              </h2>
              <p className="text-gray-400 mb-6">
                Connect your wallet to view your Prime Mates NFTs across all collections
              </p>

              {!isConnected ? (
                <ConnectWidget />
              ) : (
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8">
                  <p className="text-sm text-gray-400 mb-2">Connected Wallet</p>
                  <p className="font-mono text-yellow-500">{walletAddress}</p>
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <p className="text-sm text-gray-400">Found {userNFTs.length} NFTs</p>
                    <Button
                      onClick={loadUserNFTs}
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                      aria-label="Refresh my collection"
                    >
                      <RefreshCw className={`w-4 h-4 ${walletLoading ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {walletLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                <span className="ml-2 text-gray-400">Loading your NFTs...</span>
              </div>
            ) : userNFTs.length > 0 ? (
              <div>
                {collections.map((collection) => {
                  const group = userNFTs.filter((n) => n.collection === collection.name)
                  if (group.length === 0) return null
                  return (
                    <div key={collection.address} className="mb-12">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <span
                          className={`bg-gradient-to-r ${themeGradient(collection.theme)} bg-clip-text text-transparent`}
                        >
                          {collection.name}
                        </span>
                        <Badge variant="secondary" className="bg-gray-800">
                          {group.length} NFTs
                        </Badge>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {group.map((nft) => (
                          <Card
                            key={`${nft.tokenAddress}-${nft.tokenId}`}
                            className="bg-gray-900 border-gray-800 hover:border-yellow-500 transition-all duration-300 group"
                          >
                            <CardContent className="p-4">
                              <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-800">
                                <img
                                  src={nft.image || "/placeholder.svg"}
                                  alt={nft.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => ((e.target as HTMLImageElement).src = "/prime-mates-nft.jpg")}
                                />
                              </div>
                              <h4 className="font-bold text-lg mb-2">{nft.name}</h4>
                              <div className="flex items-center justify-between mb-3">
                                <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                                  #{nft.tokenId}
                                </Badge>
                                {nft.attributes?.find((a) => a.trait_type?.toLowerCase() === "rarity")?.value && (
                                  <Badge
                                    variant="secondary"
                                    className={`bg-gradient-to-r ${themeGradient(collection.theme)} text-black`}
                                  >
                                    {nft.attributes?.find((a) => a.trait_type?.toLowerCase() === "rarity")?.value}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() =>
                                    openGestureBuilder(
                                      {
                                        tokenId: nft.tokenId,
                                        name: nft.name,
                                        image: nft.image,
                                        description: nft.description,
                                        owner: walletAddress,
                                      },
                                      collection.name,
                                    )
                                  }
                                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white"
                                  size="sm"
                                >
                                  <Palette className="w-4 h-4 mr-2" />
                                  Add Gesture
                                </Button>
                                {nft.tokenAddress && nft.chainId && (
                                  <a
                                    href={openSeaUrl(nft.chainId, nft.tokenAddress, nft.tokenId)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1"
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black bg-transparent"
                                    >
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      View on OpenSea
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : isConnected ? (
              <div className="text-center py-20">
                <div className="text-gray-400 mb-4">No Prime Mates NFTs found in your wallet</div>
                <p className="text-sm text-gray-500">
                  Make sure you're connected to the correct wallet and have NFTs from our collections
                </p>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
