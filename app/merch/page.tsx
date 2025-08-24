import { Merch } from "@/components/merch"
import { MerchTestimonials } from "@/components/merch-testimonials"
import { MerchFAQ } from "@/components/merch-faq"
import { Footer } from "@/components/footer"

export default function MerchPage() {
  return (
    <main className="min-h-screen bg-black">
      <Merch />
      <MerchTestimonials />
      <MerchFAQ />
      <Footer />
    </main>
  )
}
