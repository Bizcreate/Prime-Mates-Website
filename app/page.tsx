import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { NFTCollections } from "@/components/nft-collections"
import { Games } from "@/components/games"
import { PrimeArcade } from "@/components/prime-arcade"
import { Merch } from "@/components/merch"
import { Events } from "@/components/events"
import { Community } from "@/components/community"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <About />
      <NFTCollections />
      <Games />
      <PrimeArcade />
      <Merch />
      <Events />
      <Community />
      <Contact />
      <Footer />
    </main>
  )
}
