"use client"

import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Trash2, ShoppingCart } from "lucide-react"
import Image from "next/image"

export function CartDisplay() {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotalItems, getTotalPrice } = useCart()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative text-white hover:text-yellow-400 hover:bg-yellow-400/10">
          <ShoppingCart className="h-5 w-5" />
          {getTotalItems() > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black rounded-full h-4 w-4 flex items-center justify-center text-xs font-bold">
              {getTotalItems()}
            </span>
          )}
          <span className="sr-only">View cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col bg-black text-white border-yellow-400/20">
        <SheetHeader>
          <SheetTitle className="text-yellow-400">Your Cart ({getTotalItems()})</SheetTitle>
        </SheetHeader>
        <Separator className="bg-yellow-400/20" />
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-grow text-gray-500">
            <ShoppingCart className="h-16 w-16 mb-4 text-gray-600" />
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-grow pr-4">
              <div className="space-y-4 py-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl || "/placeholder.svg?height=64&width=64&query=product"}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                      />
                    )}
                    <div className="flex-grow">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-400">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                        >
                          -
                        </Button>
                        <span className="text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                        >
                          +
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto text-red-500 hover:text-red-600"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove item</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator className="my-4 bg-yellow-400/20" />
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total:</span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </div>
            <Button className="w-full mt-4 bg-yellow-400 text-black hover:bg-yellow-300 font-bold">
              Proceed to Checkout
            </Button>
            <Button
              variant="outline"
              className="w-full mt-2 bg-transparent text-white border-yellow-400 hover:bg-yellow-400/10"
              onClick={clearCart}
            >
              Clear Cart
            </Button>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
