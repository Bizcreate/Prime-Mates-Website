"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

export function MerchTestimonials() {
  const testimonials = [
    {
      id: 1,
      name: "SkateKing88",
      avatar: "/placeholder-user.jpg",
      rating: 5,
      review:
        "Absolutely love my Prime Mates Thrasher Tee! The quality is top-notch and the design is sick. Gets compliments every time I wear it to the park.",
    },
    {
      id: 2,
      name: "NFT_Collector_Jane",
      avatar: "/placeholder-user.jpg",
      rating: 5,
      review:
        "The 'Watch Your Step' sweatshirt is incredibly comfortable and stylish. As an NFT holder, the exclusive access to designs is a huge bonus!",
    },
    {
      id: 3,
      name: "BoarderBro",
      avatar: "/placeholder-user.jpg",
      rating: 4,
      review:
        "Got the Shaka Hoodie, and it's my new favorite. Super warm for those late-night sessions. Wish there were more color options, but still great!",
    },
    {
      id: 4,
      name: "CryptoChimp",
      avatar: "/placeholder-user.jpg",
      rating: 5,
      review:
        "The snapback cap is perfect. Fits great and the embroidery is really clean. Definitely repping PMBC everywhere now!",
    },
  ]

  return (
    <section id="merch-testimonials" className="py-20 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-6 text-yellow-400">WHAT OUR COMMUNITY SAYS</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Hear directly from our loyal fans and NFT holders about their Prime Mates merch experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="bg-black border-yellow-400/30 hover:border-yellow-400 transition-all duration-300"
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Avatar className="w-20 h-20 mb-4 border-2 border-yellow-400">
                  <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                  <AvatarFallback>
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-bold text-white mb-2">{testimonial.name}</h3>
                <div className="flex mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-300 italic">"{testimonial.review}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
