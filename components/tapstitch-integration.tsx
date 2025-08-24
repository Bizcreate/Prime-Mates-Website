"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Palette, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TapstitchProduct {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string
  tapstitchId?: string
}

export function TapstitchIntegration() {
  const [products, setProducts] = useState<TapstitchProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [designFile, setDesignFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleDesignUpload = async (file: File) => {
    setLoading(true)
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append("design", file)
      formData.append("productType", "tshirt")
      formData.append("collection", "prime-mates")

      // Simulate Tapstitch API call
      const response = await fetch("/api/tapstitch/upload-design", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Design Uploaded",
          description: `Design uploaded to Tapstitch successfully. Product ID: ${result.productId}`,
        })
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload design to Tapstitch. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const syncTapstitchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/tapstitch/sync-products")
      const tapstitchProducts = await response.json()

      setProducts(tapstitchProducts)
      toast({
        title: "Products Synced",
        description: `Synced ${tapstitchProducts.length} products from Tapstitch`,
      })
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync products from Tapstitch",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Design Upload Section */}
      <Card className="bg-gray-900 border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-yellow-400 flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Upload Design to Tapstitch
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="design-upload" className="text-white">
              Design File
            </Label>
            <Input
              id="design-upload"
              type="file"
              accept="image/*,.ai,.psd,.svg"
              onChange={(e) => setDesignFile(e.target.files?.[0] || null)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Product Type</Label>
              <Select>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tshirt">T-Shirt</SelectItem>
                  <SelectItem value="hoodie">Hoodie</SelectItem>
                  <SelectItem value="tank">Tank Top</SelectItem>
                  <SelectItem value="longsleeve">Long Sleeve</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Collection</Label>
              <Select>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select collection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pmbc">Prime Mates Board Club</SelectItem>
                  <SelectItem value="pttb">Prime to the Bone</SelectItem>
                  <SelectItem value="halloween">Prime Halloween</SelectItem>
                  <SelectItem value="christmas">Prime Christmas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => designFile && handleDesignUpload(designFile)}
            disabled={!designFile || loading}
            className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            {loading ? "Uploading..." : "Upload to Tapstitch"}
          </Button>
        </CardContent>
      </Card>

      {/* Product Sync Section */}
      <Card className="bg-gray-900 border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-yellow-400 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Tapstitch Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-300">Sync products from your Tapstitch account</p>
            <Button
              onClick={syncTapstitchProducts}
              disabled={loading}
              className="bg-yellow-400 text-black hover:bg-yellow-500"
            >
              {loading ? "Syncing..." : "Sync Products"}
            </Button>
          </div>

          {products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <img
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    <h3 className="font-semibold text-white">{product.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-400 font-bold">${product.price}</span>
                      <span className="text-xs text-gray-500">{product.category}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
