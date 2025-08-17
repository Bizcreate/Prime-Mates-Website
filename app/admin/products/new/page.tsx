"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function NewProductPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    sku: "",
    inventory_quantity: "",
    sizes: "",
    status: "active",
    image_url: "",
  })

  useEffect(() => {
    setMounted(true)
    const authCookie = document.cookie.includes("admin-auth=true")
    if (!authCookie) {
      window.location.href = "/admin/login"
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const sizesArray = formData.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: Number.parseFloat(formData.price),
          inventory_quantity: Number.parseInt(formData.inventory_quantity),
          sizes: sizesArray,
          weight: 0, // Default weight
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product created successfully!",
        })
        // Reset form
        setFormData({
          name: "",
          description: "",
          price: "",
          category: "",
          sku: "",
          inventory_quantity: "",
          sizes: "",
          status: "active",
          image_url: "",
        })
      } else {
        throw new Error("Failed to create product")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Add New Product</h2>
          <p className="text-gray-300 mt-1">Create a new product for your store</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-300">
                    Product Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter product name"
                    className="bg-gray-700 border-gray-600 text-white"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Enter product description"
                    rows={4}
                    className="bg-gray-700 border-gray-600 text-white"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className="text-gray-300">
                      Price ($)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      className="bg-gray-700 border-gray-600 text-white"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="image-url" className="text-gray-300">
                      Image URL
                    </Label>
                    <Input
                      id="image-url"
                      placeholder="https://example.com/image.jpg"
                      className="bg-gray-700 border-gray-600 text-white"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category" className="text-gray-300">
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="t-shirts">T-Shirts</SelectItem>
                      <SelectItem value="hoodies">Hoodies</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="skateboards">Skateboards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku" className="text-gray-300">
                      SKU
                    </Label>
                    <Input
                      id="sku"
                      placeholder="Enter SKU"
                      className="bg-gray-700 border-gray-600 text-white"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock" className="text-gray-300">
                      Stock Quantity
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="0"
                      className="bg-gray-700 border-gray-600 text-white"
                      value={formData.inventory_quantity}
                      onChange={(e) => setFormData({ ...formData, inventory_quantity: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="sizes" className="text-gray-300">
                    Available Sizes
                  </Label>
                  <Input
                    id="sizes"
                    placeholder="S, M, L, XL"
                    className="bg-gray-700 border-gray-600 text-white"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Product Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button type="submit" className="w-full bg-[#fdc730] hover:bg-yellow-400 text-black" disabled={loading}>
                {loading ? "Creating..." : "Save Product"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => setFormData({ ...formData, status: "draft" })}
              >
                Save as Draft
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
