"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Coffee, Heart, Star, Zap, Crown } from "lucide-react"

interface GestureOverlayProps {
  nftImage: string
  nftName: string
  tokenId: string
}

const GESTURE_OVERLAYS = [
  {
    id: "gm-coffee",
    name: "GM Coffee",
    icon: Coffee,
    image: "/gestures/gm-coffee.png",
    position: { x: 20, y: 20 },
    size: { width: 80, height: 80 },
  },
  {
    id: "love",
    name: "Love",
    icon: Heart,
    image: "/gestures/love-heart.png",
    position: { x: 70, y: 15 },
    size: { width: 60, height: 60 },
  },
  {
    id: "star",
    name: "Star",
    icon: Star,
    image: "/gestures/gold-star.png",
    position: { x: 15, y: 70 },
    size: { width: 50, height: 50 },
  },
  {
    id: "lightning",
    name: "Energy",
    icon: Zap,
    image: "/gestures/lightning.png",
    position: { x: 75, y: 75 },
    size: { width: 70, height: 70 },
  },
  {
    id: "crown",
    name: "Crown",
    icon: Crown,
    image: "/gestures/golden-crown.png",
    position: { x: 40, y: 5 },
    size: { width: 90, height: 60 },
  },
]

export function NFTGestureOverlay({ nftImage, nftName, tokenId }: GestureOverlayProps) {
  const [selectedGesture, setSelectedGesture] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateComposite = useCallback(async () => {
    if (!selectedGesture || !canvasRef.current) return

    setIsGenerating(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    try {
      // Load NFT image
      const nftImg = new Image()
      nftImg.crossOrigin = "anonymous"

      await new Promise((resolve, reject) => {
        nftImg.onload = resolve
        nftImg.onerror = reject
        nftImg.src = nftImage
      })

      // Set canvas size to match NFT
      canvas.width = 500
      canvas.height = 500

      // Draw NFT image
      ctx.drawImage(nftImg, 0, 0, 500, 500)

      // Load and draw gesture overlay
      const gesture = GESTURE_OVERLAYS.find((g) => g.id === selectedGesture)
      if (gesture) {
        const overlayImg = new Image()
        overlayImg.crossOrigin = "anonymous"

        await new Promise((resolve, reject) => {
          overlayImg.onload = resolve
          overlayImg.onerror = reject
          overlayImg.src = gesture.image
        })

        // Calculate position and size
        const x = (gesture.position.x / 100) * 500
        const y = (gesture.position.y / 100) * 500
        const width = (gesture.size.width / 100) * 500
        const height = (gesture.size.height / 100) * 500

        ctx.drawImage(overlayImg, x, y, width, height)
      }
    } catch (error) {
      console.error("Error generating composite:", error)
    } finally {
      setIsGenerating(false)
    }
  }, [selectedGesture, nftImage])

  const downloadComposite = () => {
    if (!canvasRef.current) return

    const link = document.createElement("a")
    link.download = `${nftName}-${tokenId}-gesture.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  return (
    <Card className="p-6 bg-gray-900 border-yellow-500/20">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-yellow-400 mb-2">NFT Gesture Studio</h3>
          <p className="text-gray-400">Add gesture overlays to your {nftName}</p>
        </div>

        {/* Gesture Selection */}
        <div className="grid grid-cols-5 gap-3">
          {GESTURE_OVERLAYS.map((gesture) => {
            const IconComponent = gesture.icon
            return (
              <Button
                key={gesture.id}
                variant={selectedGesture === gesture.id ? "default" : "outline"}
                className={`h-16 flex flex-col gap-1 ${
                  selectedGesture === gesture.id
                    ? "bg-yellow-500 text-black border-yellow-400"
                    : "border-gray-600 hover:border-yellow-500/50"
                }`}
                onClick={() => setSelectedGesture(gesture.id)}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs">{gesture.name}</span>
              </Button>
            )
          })}
        </div>

        {/* Preview Area */}
        <div className="relative">
          <div className="relative w-full max-w-md mx-auto">
            <img
              src={nftImage || "/placeholder.svg"}
              alt={nftName}
              className="w-full rounded-lg border border-gray-700"
            />

            {selectedGesture && (
              <div className="absolute inset-0">
                {(() => {
                  const gesture = GESTURE_OVERLAYS.find((g) => g.id === selectedGesture)
                  if (!gesture) return null

                  return (
                    <img
                      src={gesture.image || "/placeholder.svg"}
                      alt={gesture.name}
                      className="absolute opacity-90"
                      style={{
                        left: `${gesture.position.x}%`,
                        top: `${gesture.position.y}%`,
                        width: `${gesture.size.width}%`,
                        height: `${gesture.size.height}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  )
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={generateComposite}
            disabled={!selectedGesture || isGenerating}
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            {isGenerating ? "Generating..." : "Generate Composite"}
          </Button>

          <Button
            onClick={downloadComposite}
            variant="outline"
            className="border-yellow-500/50 hover:border-yellow-500 bg-transparent"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Hidden Canvas for Generation */}
        <canvas ref={canvasRef} className="hidden" width={500} height={500} />
      </div>
    </Card>
  )
}
