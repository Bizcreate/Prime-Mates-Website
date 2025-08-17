"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart, Star, Shirt, Palette, Crown } from "lucide-react"
import { useState, useEffect } from "react"
import { useCart } from "@/context/cart-context"
import type { Product } from "@/lib/db"

export function Merch() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const { addToCart } = useCart()

  useEffect(() => {
    fetchProducts()
    // Load favorites from localStorage
    const storedFavorites = localStorage.getItem("prime-mates-favorites")
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites))
    }
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(data.filter((product: Product) => product.status === "active"))
    } catch (error) {
      setProducts([]) // Fallback to empty array
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id) ? favorites.filter((fav) => fav !== id) : [...favorites, id]
    setFavorites(newFavorites)
    localStorage.setItem("prime-mates-favorites", JSON.stringify(newFavorites))
  }

  const handleAddToCart = (product: Product) => {
    addToCart(product)
  }

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category.toLowerCase() === selectedCategory.toLowerCase())

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]

  const getBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "bestseller":
      case "best seller":
        return "bg-yellow-600"
      case "new":
        return "bg-green-600"
      case "limited":
        return "bg-red-600"
      case "popular":
        return "bg-blue-600"
      case "exclusive":
        return "bg-purple-600"
      case "fan favorite":
        return "bg-pink-600"
      default:
        return "bg-orange-600"
    }
  }

  if (loading) {
    return (
      <section id="merch" className="py-20 bg-black">
        <div className="container mx-auto px-4 text-center">
          <div className="text-yellow-400 text-xl">Loading products...</div>
        </div>
      </section>
    )
  }

  return (
    <section id="merch" className="py-20 bg-black relative">
      {/* Floating Shaka Coins */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <img
          src="/images/shaka-coin.png"
          alt="Shaka Coin"
          className="absolute top-20 right-16 w-16 h-16 animate-pulse"
        />
        <img
          src="/images/shaka-coin.png"
          alt="Shaka Coin"
          className="absolute bottom-32 left-20 w-12 h-12 animate-pulse delay-700"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-6 text-yellow-400">MERCH STORE</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Rep the culture with our premium collection of apparel and gear. From classic tees to custom designs -
            express your Prime Mates identity in style. NFT holders get exclusive access to premium designs!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold rounded-lg">
              <Shirt className="mr-2 h-5 w-5" />
              Shop All Products
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent font-bold rounded-lg"
            >
              <Palette className="mr-2 h-5 w-5" />
              Custom Designer
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-yellow-400 text-black hover:bg-yellow-300"
                    : "border-yellow-400/50 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent"
                }
              >
                {category === "all" ? "All Products" : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="bg-black border-yellow-400/30 hover:border-yellow-400 transition-all duration-300 overflow-hidden group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.image_url || "/placeholder.svg?height=256&width=256&query=product"}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <Badge
                    variant="secondary"
                    className={`text-xs font-bold ${getBadgeColor(product.status)} text-white`}
                  >
                    {product.status || "New"}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className="border-yellow-400 text-yellow-400 bg-black/50 text-xs">
                    {product.category}
                  </Badge>
                </div>
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute bottom-3 right-3 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <Heart
                    className={`h-4 w-4 ${favorites.includes(product.id) ? "fill-red-500 text-red-500" : "text-white"}`}
                  />
                </button>
              </div>
              <CardContent className="p-4">
                <h3 className="text-sm font-bold mb-1 text-white line-clamp-2">{product.name}</h3>
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-300 ml-1">4.8</span>
                    <span className="text-xs text-gray-400 ml-1">(New)</span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1">
                    Stock: {product.inventory_quantity > 0 ? `${product.inventory_quantity} available` : "Out of stock"}
                  </p>
                  {product.sku && <p className="text-xs text-gray-500">SKU: {product.sku}</p>}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-yellow-400">${Number(product.price || 0).toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold text-sm rounded-lg"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.inventory_quantity <= 0}
                >
                  <ShoppingCart className="mr-2 h-3 w-3" />
                  {product.inventory_quantity > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No products found in this category.</p>
          </div>
        )}

        {/* Custom Design Platform */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-yellow-400 to-yellow-600 border-0">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <Palette className="h-16 w-16 text-black" />
              </div>
              <h3 className="text-3xl font-bold text-black mb-4">CUSTOM MERCH DESIGNER</h3>
              <p className="text-black/80 mb-6 max-w-2xl mx-auto">
                Create your own unique Prime Mates merch! Upload your designs or use our exclusive NFT holder artwork
                library. Print-on-demand with premium quality materials.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-black text-yellow-400 hover:bg-gray-900 font-bold rounded-lg">
                  <Palette className="mr-2 h-5 w-5" />
                  Start Designing
                </Button>
                <Button
                  variant="outline"
                  className="border-black text-black hover:bg-black hover:text-yellow-400 bg-transparent font-bold rounded-lg"
                >
                  <Crown className="mr-2 h-5 w-5" />
                  NFT Holder Access
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h3 className="text-3xl font-bold mb-8 text-yellow-400">Shop by Category</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {categories
              .filter((cat) => cat !== "all")
              .map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  onClick={() => setSelectedCategory(category)}
                  className="h-16 border-yellow-400/50 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent text-lg font-bold rounded-lg"
                >
                  {category}
                </Button>
              ))}
          </div>
        </div>
      </div>
    </section>
  )
}
