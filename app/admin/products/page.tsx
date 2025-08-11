import { ProductForm } from "@/components/admin/product-form"
import { ProductList } from "@/components/admin/product-list"
import { getProducts } from "./actions" // Import getProducts

export default async function AdminProductsPage() {
  const products = await getProducts() // Fetch products on the server

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-black text-yellow-400 py-4 px-6 shadow-md">
        <h1 className="text-2xl font-bold">Product Management Dashboard</h1>
      </header>
      <main className="container mx-auto px-4 py-8 grid gap-8 md:grid-cols-2">
        <ProductForm />
        <ProductList products={products} /> {/* Pass fetched products to ProductList */}
      </main>
      {/* Assuming you want the footer on admin pages too */}
      {/* <Footer /> */}
    </div>
  )
}
