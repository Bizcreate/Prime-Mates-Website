"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Package, DollarSign, Eye, Edit } from "lucide-react"
import { toast } from "sonner"

interface WooCommerceProduct {
  id: number
  name: string
  price: string
  stock_status: string
  stock_quantity: number | null
  images: Array<{ src: string; alt: string }>
  categories: Array<{ name: string }>
  status: string
}

export default function WooCommerceManagement() {
  const [products, setProducts] = useState<WooCommerceProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const syncProducts = async () => {
    setSyncing(true)
    try {
      const response = await fetch("/api/woocommerce/sync")
      const data = await response.json()

      if (data.success) {
        setProducts(data.products)
        toast.success(`Synced ${data.products.length} products from WooCommerce`)
      } else {
        toast.error("Failed to sync products")
      }
    } catch (error) {
      console.error("Sync error:", error)
      toast.error("Error syncing with WooCommerce")
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    syncProducts()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-500">WooCommerce Management</h1>
            <p className="text-gray-400 mt-2">Manage your WooCommerce products and sync data</p>
          </div>
          <Button onClick={syncProducts} disabled={syncing} className="bg-yellow-500 hover:bg-yellow-600 text-black">
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Products"}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gray-900/50 border-gray-800">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Package className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{products.length}</p>
                <p className="text-sm text-gray-400">Total Products</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gray-900/50 border-gray-800">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {products.filter((p) => p.stock_status === "instock").length}
                </p>
                <p className="text-sm text-gray-400">In Stock</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gray-900/50 border-gray-800">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <Package className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {products.filter((p) => p.stock_status === "outofstock").length}
                </p>
                <p className="text-sm text-gray-400">Out of Stock</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Products Grid */}
        <Card className="p-6 bg-gray-900/50 border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="p-4 bg-gray-800/50 border-gray-700">
                {product.images[0] && (
                  <img
                    src={product.images[0].src || "/placeholder.svg"}
                    alt={product.images[0].alt}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="font-semibold text-white mb-2">{product.name}</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-500 font-bold">${product.price}</span>
                  <Badge
                    variant={product.stock_status === "instock" ? "default" : "destructive"}
                    className={product.stock_status === "instock" ? "bg-green-500" : "bg-red-500"}
                  >
                    {product.stock_status}
                  </Badge>
                </div>
                {product.categories.length > 0 && (
                  <p className="text-sm text-gray-400 mb-4">{product.categories.map((cat) => cat.name).join(", ")}</p>
                )}
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
