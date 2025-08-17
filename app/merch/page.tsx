import { Merch } from "@/components/merch"
import { MerchTestimonials } from "@/components/merch-testimonials"
import { MerchFAQ } from "@/components/merch-faq"
import { Footer } from "@/components/footer"

export default function MerchPage() {
  const merchItems = [
    {
      id: 1,
      name: "Prime Mates Thrasher Tee",
      price: 29.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "T-Shirts",
      inStock: true,
    },
    {
      id: 2,
      name: "Prime Mates Shaka Hoodie",
      price: 59.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Hoodies",
      inStock: true,
    },
    {
      id: 3,
      name: "PMBC Snapback Cap",
      price: 24.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Accessories",
      inStock: true,
    },
    {
      id: 4,
      name: "Prime Grunge Tee",
      price: 32.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "T-Shirts",
      inStock: false,
    },
    {
      id: 5,
      name: "Don't Fade Tee",
      price: 27.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "T-Shirts",
      inStock: true,
    },
    {
      id: 6,
      name: "Prime Mates Skateboard Deck",
      price: 89.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Skate",
      inStock: true,
    },
  ]

  return (
    <main className="min-h-screen bg-black">
      <Merch />
      <section id="merch-store" className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-12 text-yellow-400">Our Exclusive Merch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {merchItems.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="aspect-square relative">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-red-400 font-bold text-lg">Out of Stock</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">{item.name}</h3>
                    <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">{item.category}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-yellow-400">${item.price}</span>
                    <button
                      className={`px-4 py-2 rounded font-medium transition-colors ${
                        item.inStock
                          ? "bg-yellow-400 text-black hover:bg-yellow-300"
                          : "bg-gray-600 text-gray-400 cursor-not-allowed"
                      }`}
                      disabled={!item.inStock}
                    >
                      {item.inStock ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <MerchTestimonials />
      <MerchFAQ />
      <Footer />
    </main>
  )
}
