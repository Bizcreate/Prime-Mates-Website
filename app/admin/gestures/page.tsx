"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Upload, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GestureOverlay {
  id: string
  name: string
  description: string
  imageUrl: string
  category: "greetings" | "emotions" | "achievements" | "seasonal" | "custom"
  isActive: boolean
  uploadedAt: string
}

export default function GestureAdminPage() {
  const [overlays, setOverlays] = useState<GestureOverlay[]>([
    {
      id: "1",
      name: "GM Coffee Mug",
      description: "Good morning coffee mug overlay",
      imageUrl: "/gestures/gm-coffee.png",
      category: "greetings",
      isActive: true,
      uploadedAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Love Heart",
      description: "Heart overlay for showing love",
      imageUrl: "/gestures/love-heart.png",
      category: "emotions",
      isActive: true,
      uploadedAt: "2024-01-14",
    },
    {
      id: "3",
      name: "Gold Star",
      description: "Achievement star overlay",
      imageUrl: "/gestures/gold-star.png",
      category: "achievements",
      isActive: true,
      uploadedAt: "2024-01-13",
    },
  ])

  const [newOverlay, setNewOverlay] = useState({
    name: "",
    description: "",
    category: "custom" as const,
  })
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, GIF)",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Simulate upload process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newGesture: GestureOverlay = {
        id: Date.now().toString(),
        name: newOverlay.name || file.name.replace(/\.[^/.]+$/, ""),
        description: newOverlay.description || `Uploaded gesture overlay`,
        imageUrl: URL.createObjectURL(file),
        category: newOverlay.category,
        isActive: true,
        uploadedAt: new Date().toISOString().split("T")[0],
      }

      setOverlays((prev) => [...prev, newGesture])
      setNewOverlay({ name: "", description: "", category: "custom" })

      toast({
        title: "Gesture uploaded successfully",
        description: `${newGesture.name} is now available for users`,
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your gesture overlay",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const toggleOverlayStatus = (id: string) => {
    setOverlays((prev) =>
      prev.map((overlay) => (overlay.id === id ? { ...overlay, isActive: !overlay.isActive } : overlay)),
    )
  }

  const deleteOverlay = (id: string) => {
    setOverlays((prev) => prev.filter((overlay) => overlay.id !== id))
    toast({
      title: "Gesture deleted",
      description: "The gesture overlay has been removed",
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      greetings: "bg-green-100 text-green-800",
      emotions: "bg-pink-100 text-pink-800",
      achievements: "bg-yellow-100 text-yellow-800",
      seasonal: "bg-blue-100 text-blue-800",
      custom: "bg-gray-100 text-gray-800",
    }
    return colors[category as keyof typeof colors] || colors.custom
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2">
            Gesture Overlay Management
          </h1>
          <p className="text-gray-400">Upload and manage overlay images that users can add to their NFTs</p>
        </div>

        {/* Upload New Gesture */}
        <Card className="bg-gray-900 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-yellow-400">Upload New Gesture Overlay</CardTitle>
            <CardDescription>Add transparent PNG images that users can overlay on their NFTs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                placeholder="Gesture name (e.g., GM Coffee Mug)"
                value={newOverlay.name}
                onChange={(e) => setNewOverlay((prev) => ({ ...prev, name: e.target.value }))}
                className="bg-gray-800 border-gray-600"
              />
              <select
                value={newOverlay.category}
                onChange={(e) => setNewOverlay((prev) => ({ ...prev, category: e.target.value as any }))}
                className="bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
              >
                <option value="greetings">Greetings</option>
                <option value="emotions">Emotions</option>
                <option value="achievements">Achievements</option>
                <option value="seasonal">Seasonal</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <Input
              placeholder="Description (optional)"
              value={newOverlay.description}
              onChange={(e) => setNewOverlay((prev) => ({ ...prev, description: e.target.value }))}
              className="bg-gray-800 border-gray-600"
            />
            <div className="flex gap-4">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-yellow-600 hover:bg-yellow-700 text-black"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload Image"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Existing Gestures */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {overlays.map((overlay) => (
            <Card key={overlay.id} className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-white">{overlay.name}</CardTitle>
                    <CardDescription className="text-sm">{overlay.description}</CardDescription>
                  </div>
                  <Badge className={getCategoryColor(overlay.category)}>{overlay.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gray-800 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  <img
                    src={overlay.imageUrl || "/placeholder.svg"}
                    alt={overlay.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                  <span>Uploaded: {overlay.uploadedAt}</span>
                  <Badge variant={overlay.isActive ? "default" : "secondary"}>
                    {overlay.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleOverlayStatus(overlay.id)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {overlay.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteOverlay(overlay.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* WooCommerce Integration Info */}
        <Card className="bg-gray-900 border-gray-700 mt-8">
          <CardHeader>
            <CardTitle className="text-yellow-400">WooCommerce Integration Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-2">Recommended Approach:</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Use WooCommerce REST API v3</li>
                  <li>• Sync products via webhook endpoints</li>
                  <li>• Cache product data in your database</li>
                  <li>• Use Tapstitch API for design uploads</li>
                  <li>• Implement real-time inventory sync</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Required Environment Variables:</h3>
                <ul className="space-y-1 text-gray-300 text-sm font-mono">
                  <li>WOOCOMMERCE_URL</li>
                  <li>WOOCOMMERCE_CONSUMER_KEY</li>
                  <li>WOOCOMMERCE_CONSUMER_SECRET</li>
                  <li>TAPSTITCH_API_KEY</li>
                  <li>TAPSTITCH_WEBHOOK_SECRET</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
