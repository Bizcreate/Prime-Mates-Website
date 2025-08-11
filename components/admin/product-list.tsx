"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, Edit } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { deleteProduct, type Product } from "@/app/admin/products/actions"
import { EditProductDialog } from "./edit-product-dialog"

interface ProductListProps {
  products: Product[]
}

export function ProductList({ products }: ProductListProps) {
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (productToDelete) {
      const result = await deleteProduct(productToDelete)
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        })
      } else {
        toast({
          title: "Error!",
          description: result.message,
          variant: "destructive",
        })
      }
      setIsDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const handleEditClick = (product: Product) => {
    setProductToEdit(product)
    setIsEditDialogOpen(true)
  }

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">Existing Products</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-gray-600">No products found. Add some using the form above!</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Image
                        src={product.image_url || "/placeholder.svg?height=60&width=60&query=product"}
                        alt={product.name}
                        width={60}
                        height={60}
                        className="rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category || "N/A"}</TableCell>
                    <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(product)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(product.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <EditProductDialog product={productToEdit} isOpen={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} />
    </Card>
  )
}
