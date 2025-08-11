import { Merch } from "@/components/merch"
import { MerchTestimonials } from "@/components/merch-testimonials"
import { MerchFAQ } from "@/components/merch-faq"
import { Footer } from "@/components/footer"
import { getProducts } from "@/app/admin/products/actions" // Import getProducts
import { ProductCard } from "@/components/product-card" // Import ProductCard

export default async function MerchPage() {
  const products = await getProducts() // Fetch products for the merch page

  return (
    <main className="min-h-screen bg-black">
      <Merch />
      {/* Product Display Section */}
      <section id="merch-store" className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-12 text-yellow-400">Our Exclusive Merch</h2>
          {products.length === 0 ? (
            <div className="text-center text-gray-400 text-lg">
              No products available yet. Please add some from the{" "}
              <a href="/admin/products" className="underline text-yellow-500">
                Admin Dashboard
              </a>
              .
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
      <MerchTestimonials />
      <MerchFAQ />
      <Footer />
    </main>
  )
}
