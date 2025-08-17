"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  sku: string
  inventory_quantity: number
  image_url: string
  sizes: string[]
  status: string
  visibility: string
  badge: string
  is_featured: boolean
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    // Check auth
    const authCookie = document.cookie.includes("admin-auth=true")
    if (!authCookie) {
      window.location.href = "/admin/login"
      return
    }

    fetchProduct()
  }, [])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        // Parse sizes if it's a string
        if (typeof data.sizes === "string") {
          data.sizes = JSON.parse(data.sizes)
        }
        setProduct(data)
      } else {
        throw new Error("Failed to fetch product")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch product",
        variant: "destructive",
      })
      router.push("/admin/products")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!product) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product updated successfully!",
        })
        router.push("/admin/products")
      } else {
        throw new Error("Failed to update product")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-white p-8">Loading product...</div>
  }

  if (!product) {
    return <div className="text-white p-8">Product not found</div>
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/products">
          <Button variant="ghost" className="text-gray-300 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Edit Product</h2>
          <p className="text-gray-300 mt-1">Update product information</p>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Product Name
                </Label>
                <Input
                  id="name"
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku" className="text-gray-300">
                  SKU
                </Label>
                <Input
                  id="sku"
                  value={product.sku}
                  onChange={(e) => setProduct({ ...product, sku: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-gray-300">
                  Price ($)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={product.price}
                  onChange={(e) => setProduct({ ...product, price: Number.parseFloat(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inventory" className="text-gray-300">
                  Inventory Quantity
                </Label>
                <Input
                  id="inventory"
                  type="number"
                  value={product.inventory_quantity}
                  onChange={(e) => setProduct({ ...product, inventory_quantity: Number.parseInt(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-300">
                  Category
                </Label>
                <Select value={product.category} onValueChange={(value) => setProduct({ ...product, category: value })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="t-shirts">T-Shirts</SelectItem>
                    <SelectItem value="hoodies">Hoodies</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="skateboards">Skateboards</SelectItem>
                    <SelectItem value="apparel">Apparel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-300">
                  Status
                </Label>
                <Select value={product.status} onValueChange={(value) => setProduct({ ...product, status: value })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Published</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">
                Description
              </Label>
              <Textarea
                id="description"
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url" className="text-gray-300">
                Image URL
              </Label>
              <Input
                id="image_url"
                value={product.image_url}
                onChange={(e) => setProduct({ ...product, image_url: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={product.is_featured}
                onCheckedChange={(checked) => setProduct({ ...product, is_featured: !!checked })}
              />
              <Label htmlFor="featured" className="text-gray-300">
                Featured Product
              </Label>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/admin/products">
                <Button variant="outline" className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={saving} className="bg-[#fdc730] hover:bg-yellow-400 text-black">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
