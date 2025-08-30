"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ExternalLink, Loader2, Palette } from "lucide-react"
import { useActiveAccount } from "thirdweb/react"
import { ConnectWidget } from "@/components/ConnectWidget"
import { COLLECTIONS } from "@/config/contracts"

const collections = [
  {
    name: COLLECTIONS.pmbc.name,
    address: COLLECTIONS.pmbc.address,
    totalSupply: 2222,
    theme: "gold",
    chainId: COLLECTIONS.pmbc.chainId,
  },
  {
    name: COLLECTIONS.pttb.name,
    address: COLLECTIONS.pttb.address,
    totalSupply: 999,
    theme: "red",
    chainId: COLLECTIONS.pttb.chainId,
  },
]

interface NFTData {
  tokenId: string
  name: string
  image: string
  description?: string
  attributes?: Array<{ trait_type: string; value: string }>
  owner?: string
}

export default function GalleryPage() {
  const [selectedCollection, setSelectedCollection] = useState(collections[0])
  const [searchTokenId, setSearchTokenId] = useState("")
  const [nfts, setNfts] = useState<NFTData[]>([])
  const [searchedNFT, setSearchedNFT] = useState<NFTData | null>(null)
  const [activeTab, setActiveTab] = useState("collections")
  const [loading, setLoading] = useState(false)

  const account = useActiveAccount()
  const walletAddress = account?.address
  const isConnected = !!account
  const [userNFTs, setUserNFTs] = useState<any[]>([])
  const [walletLoading, setWalletLoading] = useState(false)

  useEffect(() => {
    const fetchUserNFTs = async () => {
      if (!isConnected || !walletAddress) {
        setUserNFTs([])
        return
      }

      setWalletLoading(true)
      try {
        console.log("[v0] Fetching user NFTs for wallet:", walletAddress)

        const response = await fetch(`/api/nfts?wallet=${walletAddress}`)
        const data = await response.json()

        if (data.success) {
          console.log("[v0] Successfully fetched", data.total, "NFTs from API")
          setUserNFTs(data.nfts)
        } else {
          console.error("[v0] API error:", data.error)
          setUserNFTs([])
        }
      } catch (error) {
        console.error("[v0] Error fetching user NFTs:", error)
        setUserNFTs([])
      } finally {
        setWalletLoading(false)
      }
    }

    fetchUserNFTs()
  }, [isConnected, walletAddress])

  const loadCollectionNFTs = async (collection: (typeof collections)[0]) => {
    setLoading(true)
    try {
      console.log("[v0] Loading NFTs for collection:", collection.name)

      const sampleNFTs: NFTData[] = []
      const sampleCount = Math.min(12, collection.totalSupply)

      for (let i = 1; i <= sampleCount; i++) {
        const tokenId = Math.floor(Math.random() * collection.totalSupply) + 1
        sampleNFTs.push({
          tokenId: tokenId.toString(),
          name: `${collection.name} #${tokenId}`,
          image: collection.name.includes("PMBC") ? "/pmbc-nft.png" : "/pttb-nft.png",
          description: `A unique ${collection.name} NFT with distinctive traits and characteristics.`,
          attributes: [
            { trait_type: "Rarity", value: ["Common", "Rare", "Epic", "Legendary"][Math.floor(Math.random() * 4)] },
            { trait_type: "Background", value: ["Blue", "Red", "Green", "Purple"][Math.floor(Math.random() * 4)] },
            { trait_type: "Eyes", value: ["Normal", "Laser", "Glowing", "Closed"][Math.floor(Math.random() * 4)] },
          ],
        })
      }
      setNfts(sampleNFTs)
    } catch (error) {
      console.error("[v0] Error loading NFTs:", error)
      setNfts([])
    } finally {
      setLoading(false)
    }
  }

  const searchNFT = async () => {
    if (!searchTokenId || isNaN(Number(searchTokenId))) return

    setLoading(true)
    try {
      const tokenId = Number.parseInt(searchTokenId)
      if (tokenId > 0 && tokenId <= selectedCollection.totalSupply) {
        console.log("[v0] Searching for NFT", tokenId, "in collection", selectedCollection.name)

        const searchResult: NFTData = {
          tokenId: tokenId.toString(),
          name: `${selectedCollection.name} #${tokenId}`,
          image: selectedCollection.name.includes("PMBC") ? "/pmbc-nft.png" : "/pttb-nft.png",
          description: `${selectedCollection.name} NFT #${tokenId} - This token may not be minted yet.`,
          attributes: [{ trait_type: "Status", value: "Searching..." }],
        }
        setSearchedNFT(searchResult)
      }
    } catch (error) {
      console.error("[v0] Error searching NFT:", error)
    } finally {
      setLoading(false)
    }
  }

  const openGestureBuilder = (nft: NFTData, collectionName: string) => {
    const collectionSlug = collectionName.toLowerCase().replace(/\s+/g, "-")
    window.location.href = `/gesture/${collectionSlug}/${nft.tokenId}`
  }

  const isNFTOwned = (nft: NFTData): boolean => {
    if (!walletAddress || !nft.owner) return false
    return walletAddress.toLowerCase() === nft.owner.toLowerCase()
  }

  useEffect(() => {
    if (activeTab === "collections") {
      loadCollectionNFTs(selectedCollection)
      setSearchedNFT(null)
    }
  }, [selectedCollection, activeTab])

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case "gold":
        return "from-yellow-500 to-yellow-600"
      case "red":
        return "from-red-500 to-red-600"
      default:
        return "from-yellow-500 to-yellow-600"
    }
  }

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
        {/* Tabs for Collections and My Collection */}
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
            {/* Collection Selector and Search */}
            <div className="flex flex-col lg:flex-row gap-6 mb-12">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Collection</label>
                <Select
                  value={selectedCollection.address}
                  onValueChange={(value) => {
                    const collection = collections.find((c) => c.address === value)
                    if (collection) setSelectedCollection(collection)
                  }}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {collections.map((collection) => (
                      <SelectItem
                        key={collection.address}
                        value={collection.address}
                        className="text-white hover:bg-gray-700"
                      >
                        {collection.name} ({collection.totalSupply} NFTs)
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
                    min="1"
                    max={selectedCollection.totalSupply}
                  />
                  <Button
                    onClick={searchNFT}
                    disabled={loading || !searchTokenId}
                    className={`bg-gradient-to-r ${getThemeColors(selectedCollection.theme)} hover:opacity-90 text-black font-semibold`}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
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
                      className={`text-2xl font-bold bg-gradient-to-r ${getThemeColors(selectedCollection.theme)} bg-clip-text text-transparent`}
                    >
                      {selectedCollection.totalSupply}
                    </div>
                    <div className="text-sm text-gray-400">Total Supply</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Searched NFT Result */}
            {searchedNFT && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold mb-6 text-center">
                  <span
                    className={`bg-gradient-to-r ${getThemeColors(selectedCollection.theme)} bg-clip-text text-transparent`}
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
                        />
                      </div>
                      <h4 className="font-bold text-lg mb-2">{searchedNFT.name}</h4>
                      <p className="text-gray-400 text-sm mb-3">{searchedNFT.description}</p>
                      {searchedNFT.attributes && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {searchedNFT.attributes.map((attr, index) => (
                            <Badge key={index} variant="secondary" className="bg-gray-800 text-gray-300">
                              {attr.trait_type}: {attr.value}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black bg-transparent"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on OpenSea
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* NFT Grid */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-center">
                <span
                  className={`bg-gradient-to-r ${getThemeColors(selectedCollection.theme)} bg-clip-text text-transparent`}
                >
                  Collection Preview
                </span>
              </h3>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                  <span className="ml-2 text-gray-400">Loading NFTs...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {nfts.map((nft) => (
                    <Card
                      key={nft.tokenId}
                      className="bg-gray-900 border-gray-800 hover:border-yellow-500 transition-all duration-300 group"
                    >
                      <CardContent className="p-4">
                        <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-800">
                          <img
                            src={nft.image || "/placeholder.svg"}
                            alt={nft.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h4 className="font-bold text-lg mb-2">{nft.name}</h4>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{nft.description}</p>
                        {nft.attributes && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {nft.attributes.slice(0, 2).map((attr, index) => (
                              <Badge key={index} variant="secondary" className="bg-gray-800 text-gray-300 text-xs">
                                {attr.value}
                              </Badge>
                            ))}
                          </div>
                        )}
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
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${isNFTOwned(nft) ? "flex-1" : "w-full"} border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black bg-transparent`}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                  <p className="text-sm text-gray-400 mt-2">Found {userNFTs.length} NFTs</p>
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
                {/* Group NFTs by collection */}
                {collections.map((collection) => {
                  const collectionNFTs = userNFTs.filter(
                    (nft) =>
                      (nft.collection === "PMBC" && collection.name.includes("PMBC")) ||
                      (nft.collection === "PTTB" && collection.name.includes("PTTB")),
                  )
                  if (collectionNFTs.length === 0) return null

                  return (
                    <div key={collection.name} className="mb-12">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <span
                          className={`bg-gradient-to-r ${collection.theme === "gold" ? "from-yellow-500 to-yellow-600" : "from-red-500 to-red-600"} bg-clip-text text-transparent`}
                        >
                          {collection.name}
                        </span>
                        <Badge variant="secondary" className="bg-gray-800">
                          {collectionNFTs.length} NFTs
                        </Badge>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {collectionNFTs.map((nft) => (
                          <Card
                            key={nft.id}
                            className="bg-gray-900 border-gray-800 hover:border-yellow-500 transition-all duration-300 group"
                          >
                            <CardContent className="p-4">
                              <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-800">
                                <img
                                  src={nft.image || "/placeholder.svg"}
                                  alt={nft.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <h4 className="font-bold text-lg mb-2">{nft.name}</h4>
                              <div className="flex items-center justify-between mb-3">
                                <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                                  #{nft.tokenId}
                                </Badge>
                                <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                                  {nft.chain}
                                </Badge>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black bg-transparent"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View on OpenSea
                                </Button>
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
                <p className="text-sm text-gray-500">Connected wallet: {walletAddress}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Make sure you're connected to the wallet that holds your Prime Mates NFTs
                </p>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
