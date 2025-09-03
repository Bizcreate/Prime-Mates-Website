"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Zap } from "lucide-react"

interface NFTCardProps {
  nft: {
    id: string
    name: string
    image: string
    collection: string
    chain: string
    contractAddress: string
    tokenId: string
    metadata: any
  }
  showStaking?: boolean
  onStake?: (nft: any) => void
}

export default function SharedNFTCard({ nft, showStaking = false, onStake }: NFTCardProps) {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const getChainColor = (chain: string) => {
    switch (chain.toLowerCase()) {
      case "ethereum":
        return "bg-blue-500"
      case "polygon":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getOpenseaUrl = () => {
    const baseUrl = nft.chain === "polygon" ? "https://opensea.io/assets/matic" : "https://opensea.io/assets/ethereum"
    return `${baseUrl}/${nft.contractAddress}/${nft.tokenId}`
  }

  return (
    <Card className="bg-cards border-borders2 hover:border-primary/50 transition-all duration-300 group">
      <CardContent className="p-4">
        <div className="relative aspect-square mb-4 rounded-lg overflow-hidden">
          <img
            src={imageError ? "/placeholder.svg?height=300&width=300" : nft.image}
            alt={nft.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
          />
          <Badge className={`absolute top-2 right-2 ${getChainColor(nft.chain)} text-white text-xs`}>{nft.chain}</Badge>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-primary text-lg">{nft.name}</h3>
            <p className="text-secondary text-sm">{nft.collection} Collection</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-borders2 hover:border-primary/50 bg-transparent"
              onClick={() => window.open(getOpenseaUrl(), "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              OpenSea
            </Button>

            {showStaking && onStake && (
              <Button
                size="sm"
                className="flex-1 bg-primary text-black hover:bg-primary/90"
                onClick={() => onStake(nft)}
              >
                <Zap className="w-4 h-4 mr-2" />
                Stake
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
