"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart, Star, Shirt, Palette, Crown } from "lucide-react"
import { useState } from "react"

export function Merch() {
  const [favorites, setFavorites] = useState<number[]>([])

  const products = [
    {
      id: 1,
      name: "Prime Mates Classic Thrasher Tee",
      price: "$35",
      originalPrice: null,
      image: "/images/prime-mates-thrasher-tee.png",
      rating: 4.8,
      reviews: 124,
      badge: "Best Seller",
      sizes: ["S", "M", "L", "XL", "XXL"],
      description: "Clean and minimal Prime Mates tee with classic white logo on premium black cotton.",
      category: "T-Shirts",
    },
    {
      id: 2,
      name: "Watch Your Step Sweatshirt",
      price: "$65",
      originalPrice: "$80",
      image: "/images/watch-your-step-sweatshirt.png",
      rating: 4.9,
      reviews: 89,
      badge: "Limited",
      sizes: ["S", "M", "L", "XL", "XXL"],
      description:
        "Skateboard safety meets style with this unique 'Caution Watch Your Step' design featuring our signature banana and shaka.",
      category: "Sweatshirts",
    },
    {
      id: 3,
      name: "Prime Mates Shaka Hoodie",
      price: "$75",
      originalPrice: null,
      image: "/images/prime-mates-shaka-hoodie.avif",
      rating: 4.7,
      reviews: 156,
      badge: "New",
      sizes: ["S", "M", "L", "XL", "XXL"],
      description:
        "Premium black hoodie featuring the iconic Prime Mates shaka design. Perfect for those chilly skate sessions.",
      category: "Hoodies",
    },
    {
      id: 4,
      name: "Prime Mates Crew Neck",
      price: "$55",
      originalPrice: null,
      image: "/images/prime-mates-crew-neck.avif",
      rating: 4.6,
      reviews: 67,
      badge: "Popular",
      sizes: ["S", "M", "L", "XL", "XXL"],
      description: "Classic crew neck sweatshirt with subtle Prime Mates branding. Comfort meets street style.",
      category: "Sweatshirts",
    },
    {
      id: 5,
      name: "Prime Mates Snapback Cap",
      price: "$45",
      originalPrice: null,
      image: "/images/prime-mates-snapback-cap.avif",
      rating: 4.8,
      reviews: 203,
      badge: "Best Seller",
      sizes: ["One Size"],
      description:
        "Classic black snapback with embroidered Prime Mates logo. Essential headwear for any board enthusiast.",
      category: "Headwear",
    },
    {
      id: 6,
      name: "PMBC Forest Snapback",
      price: "$45",
      originalPrice: null,
      image: "/images/pmbc-snapback-green.png",
      rating: 4.5,
      reviews: 78,
      badge: "Exclusive",
      sizes: ["One Size"],
      description:
        "Forest green snapback with bold white PMBC lettering. Stand out from the crowd with this unique colorway.",
      category: "Headwear",
    },
    {
      id: 7,
      name: "Don't Fade PMBC Tee",
      price: "$35",
      originalPrice: null,
      image: "/images/dont-fade-tee.png",
      rating: 4.9,
      reviews: 145,
      badge: "Fan Favorite",
      sizes: ["S", "M", "L", "XL", "XXL"],
      description:
        "Vibrant green tee featuring our skateboarding ape mascot with the motivational 'Don't Fade!' message.",
      category: "T-Shirts",
    },
    {
      id: 8,
      name: "Prime Grunge Tee",
      price: "$40",
      originalPrice: null,
      image: "/images/prime-grunge-tee.png",
      rating: 4.7,
      reviews: 92,
      badge: "Artistic",
      sizes: ["S", "M", "L", "XL", "XXL"],
      description:
        "Distressed grunge-style design on premium heather gray. Features our signature ape with dripping logo effect.",
      category: "T-Shirts",
    },
  ]

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
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

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {products.map((product) => (
            <Card
              key={product.id}
              className="bg-black border-yellow-400/30 hover:border-yellow-400 transition-all duration-300 overflow-hidden group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <Badge
                    variant="secondary"
                    className={`text-xs font-bold ${
                      product.badge === "Best Seller"
                        ? "bg-yellow-600"
                        : product.badge === "New"
                          ? "bg-green-600"
                          : product.badge === "Limited"
                            ? "bg-red-600"
                            : product.badge === "Popular"
                              ? "bg-blue-600"
                              : product.badge === "Exclusive"
                                ? "bg-purple-600"
                                : product.badge === "Fan Favorite"
                                  ? "bg-pink-600"
                                  : "bg-orange-600"
                    } text-white`}
                  >
                    {product.badge}
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
                    <span className="text-xs text-gray-300 ml-1">{product.rating}</span>
                    <span className="text-xs text-gray-400 ml-1">({product.reviews})</span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1">Available Sizes:</p>
                  <div className="flex flex-wrap gap-1">
                    {product.sizes.map((size) => (
                      <Badge key={size} variant="outline" className="border-gray-600 text-gray-400 text-xs px-1 py-0">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-yellow-400">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">{product.originalPrice}</span>
                    )}
                  </div>
                </div>

                <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold text-sm rounded-lg">
                  <ShoppingCart className="mr-2 h-3 w-3" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

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

        {/* Categories */}
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-8 text-yellow-400">Shop by Category</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {["T-Shirts", "Hoodies", "Sweatshirts", "Headwear"].map((category) => (
              <Button
                key={category}
                variant="outline"
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
