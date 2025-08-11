import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, ListOrdered, ShoppingBag } from "lucide-react"

export function ProductOrderManagementPlaceholder() {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Product Management</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-gray-700">
            Manage your merchandise catalog, add new products, update existing ones, and organize categories.
          </p>
          <div className="flex gap-2">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Product
            </Button>
            <Button
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              View All Products
            </Button>
          </div>
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
            <h4 className="font-medium mb-1">Announcements:</h4>
            <ul className="list-disc list-inside">
              <li>New "Prime Grunge Tee" added to store!</li>
              <li>Inventory update for "Shaka Hoodie".</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Order Management</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-gray-700">Track and fulfill customer orders, manage shipping, and process returns.</p>
          <div className="flex gap-2">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold">
              <ListOrdered className="mr-2 h-4 w-4" />
              View Pending Orders
            </Button>
            <Button
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent"
            >
              <ListOrdered className="mr-2 h-4 w-4" />
              View All Orders
            </Button>
          </div>
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
            <h4 className="font-medium mb-1">Social Engagement Tasks:</h4>
            <ul className="list-disc list-inside">
              <li>Respond to recent customer reviews.</li>
              <li>Share "Best Seller" product on social media.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
