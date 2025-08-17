"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit, Trash2 } from "lucide-react"

export default function CategoriesPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const authCookie = document.cookie.includes("admin-auth=true")
    if (!authCookie) {
      window.location.href = "/admin/login"
    }
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  const categories = [
    { id: 1, name: "T-Shirts", products: 15, description: "Casual and graphic tees" },
    { id: 2, name: "Hoodies", products: 8, description: "Comfortable hooded sweatshirts" },
    { id: 3, name: "Accessories", products: 12, description: "Caps, bags, and more" },
    { id: 4, name: "Skateboards", products: 6, description: "Complete boards and decks" },
  ]

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Categories</h2>
          <p className="text-gray-300 mt-1">Organize your products</p>
        </div>
        <Button className="bg-[#fdc730] hover:bg-yellow-400 text-black">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Search categories..." className="pl-10 bg-gray-800 border-gray-700 text-white" />
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Products</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-4 px-4 font-medium text-white">{category.name}</td>
                    <td className="py-4 px-4 text-gray-300">{category.description}</td>
                    <td className="py-4 px-4 text-gray-300">{category.products} products</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-600">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-gray-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
