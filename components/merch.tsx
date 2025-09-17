"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Heart, Star, Shirt, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as RadixSelect from "@radix-ui/react-select";
const Select = RadixSelect.Root;
const SelectTrigger = RadixSelect.Trigger;
const SelectContent = RadixSelect.Content;
const SelectItem = RadixSelect.Item;
const SelectValue = RadixSelect.Value;
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MerchDesigner from "@/components/merch-designer";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/lib/db";

interface ExtendedProduct extends Product {
  sizes?: string[];
  colors?: string[];
  type?: string;
  variations?: number[];
}

export function Merch() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});
  const [selectedColors, setSelectedColors] = useState<{ [key: string]: string }>({});
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
    const storedFavorites = localStorage.getItem("prime-mates-favorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(
        data.filter((product: ExtendedProduct) => product.status === "active" || product.status === "featured"),
      );
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id) ? favorites.filter((fav) => fav !== id) : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem("prime-mates-favorites", JSON.stringify(newFavorites));
  };

  const handleAddToCart = (product: ExtendedProduct) => {
    const selectedSize = selectedSizes[product.id];
    const selectedColor = selectedColors[product.id];
    if (product.type === "variable" && product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert("Please select a size before adding to cart");
      return;
    }
    const productWithVariations = {
      ...product,
      selectedSize,
      selectedColor,
      name: `${product.name}${selectedSize ? ` - ${selectedSize}` : ""}${selectedColor ? ` - ${selectedColor}` : ""}`,
    };
    addToCart(productWithVariations);
  };

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category.toLowerCase() === selectedCategory.toLowerCase());

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))];

  const getBadgeColor = (badge: string) => {
    switch (badge?.toLowerCase()) {
      case "bestseller":
      case "best seller":
        return "bg-yellow-600";
      case "new":
        return "bg-green-600";
      case "limited":
      case "limited edition":
        return "bg-red-600";
      case "popular":
        return "bg-blue-600";
      case "exclusive":
        return "bg-purple-600";
      case "fan favorite":
        return "bg-pink-600";
      default:
        return "bg-orange-600";
    }
  };

  if (loading) {
    return (
      <section id="merch" className="py-20 bg-black">
        <div className="container mx-auto px-4 text-center">
          <div className="text-yellow-400 text-xl">Loading products...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="merch" className="py-20 bg-black relative">
      {/* Floating Shaka Coins */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <img src="/images/shaka-coin.png" alt="Shaka Coin" className="absolute top-20 right-16 w-16 h-16 animate-pulse" />
        <img
          src="/images/shaka-coin.png"
          alt="Shaka Coin"
          className="absolute bottom-32 left-20 w-12 h-12 animate-pulse delay-700"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-5xl font-black mb-3 text-yellow-400">MERCH</h2>
          <p className="text-gray-300">Shop the store or design your own uploads for future drops.</p>
        </div>

        <Tabs defaultValue="store" className="w-full">
          <TabsList className="grid grid-cols-2 bg-gray-900 border border-gray-800 mb-10">
            <TabsTrigger value="store">
              <Shirt className="mr-2 h-4 w-4" />
              Store
            </TabsTrigger>
            <TabsTrigger value="designer">
              <Palette className="mr-2 h-4 w-4" />
              Designer
            </TabsTrigger>
          </TabsList>

          {/* STORE */}
          <TabsContent value="store" className="space-y-12">
            <div className="text-center mb-8">
              <div className="flex justify-center">
                <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold rounded-lg">
                  <Shirt className="mr-2 h-5 w-5" />
                  Shop All Products
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
                      {product.badge && (
                        <Badge
                          variant="secondary"
                          className={`text-xs font-bold ${getBadgeColor(product.badge)} text-white`}
                        >
                          {product.badge}
                        </Badge>
                      )}
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
                        Stock:{" "}
                        {product.inventory_quantity > 0 ? `${product.inventory_quantity} available` : "Out of stock"}
                      </p>
                      {product.sku && <p className="text-xs text-gray-500">SKU: {product.sku}</p>}
                    </div>

                    {product.type === "variable" && (
                      <div className="mb-3 space-y-2">
                        {product.sizes && product.sizes.length > 0 && (
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Size:</label>
                            <Select
                              value={selectedSizes[product.id] || ""}
                              onValueChange={(value) =>
                                setSelectedSizes((prev) => ({ ...prev, [product.id]: value }))
                              }
                            >
                              <SelectTrigger className="h-8 text-xs bg-black border-yellow-400/30 text-white">
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent className="bg-black border-yellow-400/30">
                                {product.sizes.map((size) => (
                                  <SelectItem key={size} value={size} className="text-white hover:bg-yellow-400/20">
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {product.colors && product.colors.length > 0 && (
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Color:</label>
                            <Select
                              value={selectedColors[product.id] || ""}
                              onValueChange={(value) =>
                                setSelectedColors((prev) => ({ ...prev, [product.id]: value }))
                              }
                            >
                              <SelectTrigger className="h-8 text-xs bg-black border-yellow-400/30 text-white">
                                <SelectValue placeholder="Select color" />
                              </SelectTrigger>
                              <SelectContent className="bg-black border-yellow-400/30">
                                {product.colors.map((color) => (
                                  <SelectItem key={color} value={color} className="text-white hover:bg-yellow-400/20">
                                    {color}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-yellow-400">
                          ${Number(product.price || 0).toFixed(2)}
                        </span>
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
          </TabsContent>

          {/* DESIGNER */}
          <TabsContent value="designer" className="space-y-8">
            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-3xl font-bold mb-3 text-yellow-400">Merch Designer Studio</h3>
              <p className="text-gray-300">
                Upload your artwork for cases, boards, banners and more. We&apos;ll feature community picks in future
                drops.
              </p>
            </div>
            <MerchDesigner />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
