"use client"

import { useActionState } from "react"
import { addProduct } from "@/app/admin/products/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export function ProductForm() {
  const [state, formAction, isPending] = useActionState(addProduct, null)
  const { toast } = useToast()

  // Show toast message when state changes
  if (state?.message) {
    toast({
      title: state.success ? "Success" : "Error",
      description: state.message,
      variant: state.success ? "default" : "destructive",
    })
    // Clear the message after showing to prevent re-showing on re-renders
    state.message = undefined
  }

  return (
    <form action={formAction} className="space-y-4 p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" name="name" required placeholder="e.g., Prime Mates T-Shirt" />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" placeholder="A comfortable and stylish tee." />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input id="price" name="price" type="number" step="0.01" required placeholder="e.g., 29.99" />
      </div>
      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input id="imageUrl" name="imageUrl" type="url" placeholder="e.g., https://example.com/tee.png" />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding Product..." : "Add Product"}
      </Button>
    </form>
  )
}
