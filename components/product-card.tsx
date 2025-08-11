"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useCart } from "@/context/cart-context"
import type { Product } from "@/app/admin/products/actions" // Import Product type

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-0">
        {product.image_url ? (
          <Image
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-lg text-gray-500">
            No Image
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
          {product.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>}
        </div>
        <p className="text-xl font-bold mt-2">${product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => addToCart(product)}
          className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold"
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
