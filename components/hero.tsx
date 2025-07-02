"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = [
    {
      title: "PRIME MATES BOARD CLUB",
      subtitle: "Where Board Culture Meets Digital Innovation",
      cta: "Explore Collection",
      action: "#nfts",
    },
    {
      title: "NFT COLLECTIONS",
      subtitle: "Own Your Digital Board Identity",
      cta: "View on OpenSea",
      action: "https://opensea.io/collection/pmbc",
    },
    {
      title: "METAVERSE GAMING",
      subtitle: "GTA x Tony Hawk Style Experience",
      cta: "Play Games",
      action: "#games",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Floating Shaka Coins */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/images/shaka-coin.png"
          alt="Shaka Coin"
          className="absolute top-20 left-10 w-20 h-20 animate-bounce delay-100 opacity-80"
        />
        <img
          src="/images/shaka-coin.png"
          alt="Shaka Coin"
          className="absolute top-40 right-20 w-16 h-16 animate-bounce delay-300 opacity-60"
        />
        <img
          src="/images/shaka-coin.png"
          alt="Shaka Coin"
          className="absolute bottom-40 left-20 w-24 h-24 animate-bounce delay-500 opacity-70"
        />
        <img
          src="/images/shaka-coin.png"
          alt="Shaka Coin"
          className="absolute top-60 left-1/2 w-12 h-12 animate-bounce delay-700 opacity-50"
        />
        <img
          src="/images/shaka-coin.png"
          alt="Shaka Coin"
          className="absolute bottom-60 right-1/3 w-14 h-14 animate-bounce delay-900 opacity-40"
        />
      </div>

      <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/images/logo.png"
            alt="Prime Mates Board Club"
            width={500}
            height={350}
            className="mx-auto mb-6"
            priority
          />
        </div>

        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-yellow-400">
            {slides[currentSlide].title}
          </h1>
          <p className="text-xl md:text-2xl font-light mb-8 text-gray-300">{slides[currentSlide].subtitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold px-8 py-4 text-lg rounded-lg"
            onClick={() => {
              if (slides[currentSlide].action.startsWith("http")) {
                window.open(slides[currentSlide].action, "_blank")
              } else {
                document.querySelector(slides[currentSlide].action)?.scrollIntoView({ behavior: "smooth" })
              }
            }}
          >
            {slides[currentSlide].cta}
            {slides[currentSlide].action.startsWith("http") ? (
              <ExternalLink className="ml-2 h-5 w-5" />
            ) : (
              <ArrowRight className="ml-2 h-5 w-5" />
            )}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-bold px-8 py-4 text-lg bg-transparent rounded-lg"
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Trailer
          </Button>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center mt-12 space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? "bg-yellow-400" : "bg-yellow-400/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-yellow-400 animate-bounce">
        <div className="w-6 h-10 border-2 border-yellow-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-yellow-400 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  )
}
