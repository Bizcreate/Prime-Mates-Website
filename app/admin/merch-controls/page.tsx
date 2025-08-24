"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  visible: boolean
  featured: boolean
  inventory: number
}

export default function MerchControlsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateProductVisibility = async (productId: string, visible: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible }),
      })

      if (response.ok) {
        setProducts(products.map((p) => (p.id === productId ? { ...p, visible } : p)))
        toast({
          title: "Success",
          description: `Product ${visible ? "shown" : "hidden"} successfully`,
        })
      }
    } catch (error) {
      console.error("Error updating visibility:", error)
      toast({
        title: "Error",
        description: "Failed to update product visibility",
        variant: "destructive",
      })
    }
  }

  const updateProductFeatured = async (productId: string, featured: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured }),
      })

      if (response.ok) {
        setProducts(products.map((p) => (p.id === productId ? { ...p, featured } : p)))
        toast({
          title: "Success",
          description: `Product ${featured ? "featured" : "unfeatured"} successfully`,
        })
      }
    } catch (error) {
      console.error("Error updating featured status:", error)
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive",
      })
    }
  }

  const updateProductDescription = async (productId: string, description: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      })

      if (response.ok) {
        setProducts(products.map((p) => (p.id === productId ? { ...p, description } : p)))
        setEditingProduct(null)
        toast({
          title: "Success",
          description: "Product description updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating description:", error)
      toast({
        title: "Error",
        description: "Failed to update product description",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading products...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-yellow-500 mb-2">Merch Store Controls</h1>
        <p className="text-gray-400">Manage product visibility, featured status, and descriptions</p>
      </div>

      <Tabs defaultValue="visibility" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="visibility">Visibility Controls</TabsTrigger>
          <TabsTrigger value="featured">Featured Products</TabsTrigger>
          <TabsTrigger value="descriptions">Edit Descriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="visibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Visibility</CardTitle>
              <CardDescription>Control which products are shown on the merch store</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-gray-400">${product.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`visible-${product.id}`}>Visible</Label>
                      <Switch
                        id={`visible-${product.id}`}
                        checked={product.visible}
                        onCheckedChange={(checked) => updateProductVisibility(product.id, checked)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="featured" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Featured Products</CardTitle>
              <CardDescription>Mark products as featured to highlight them in the store</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-400">${product.price}</p>
                          {product.featured && <Badge variant="secondary">Featured</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`featured-${product.id}`}>Featured</Label>
                      <Switch
                        id={`featured-${product.id}`}
                        checked={product.featured}
                        onCheckedChange={(checked) => updateProductFeatured(product.id, checked)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="descriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Descriptions</CardTitle>
              <CardDescription>Edit product descriptions shown on the merch store</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-gray-400">${product.price}</p>
                      </div>
                    </div>

                    {editingProduct?.id === product.id ? (
                      <div className="space-y-4">
                        <Textarea
                          value={editingProduct.description}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                          placeholder="Enter product description..."
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => updateProductDescription(product.id, editingProduct.description)}
                            size="sm"
                          >
                            Save
                          </Button>
                          <Button variant="outline" onClick={() => setEditingProduct(null)} size="sm">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-300 mb-2">{product.description || "No description set"}</p>
                        <Button variant="outline" size="sm" onClick={() => setEditingProduct(product)}>
                          Edit Description
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
