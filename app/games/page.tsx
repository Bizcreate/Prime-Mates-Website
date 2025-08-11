import { Games } from "@/components/games"
import { PrimeArcade } from "@/components/prime-arcade"
import { Footer } from "@/components/footer"

export default function GamesPage() {
  return (
    <main className="min-h-screen bg-black">
      <Games />
      <PrimeArcade />
      <Footer />
    </main>
  )
}
