import { Games } from "@/components/games"
import { PrimeArcade } from "@/components/prime-arcade"
import { Footer } from "@/components/footer"

const PrimeArcadeHero = () => {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl">
            <div className="text-black text-2xl font-bold">🤙</div>
          </div>
          <div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2">
              PRIME ARCADE
            </h1>
            <p className="text-xl text-yellow-400 font-medium">Play to Earn Gaming Platform</p>
          </div>
        </div>

        <p className="text-lg text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
          Prime Arcade is our revolutionary gaming ecosystem where every game you play earns you real rewards. Built on
          blockchain technology with our native Shaka token economy, it's the ultimate destination for play-to-earn
          gaming.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-yellow-500/50 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2.05v2.02c4.39.54 7.5 4.53 6.96 8.92-.39 3.16-2.9 5.68-6.06 6.06-4.39.54-8.38-2.57-8.92-6.96C4.44 8.49 7.55 5.39 11.05 4.95V2.05c-5.05.5-8.81 4.82-8.31 9.87.35 3.68 3.28 6.62 6.96 6.96 5.05.5 9.37-3.26 9.87-8.31.35-3.68-2.58-7.37-6.57-7.52z" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Instant Rewards</h3>
            <p className="text-gray-400">Earn Shaka tokens immediately as you play - no waiting periods</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-yellow-500/50 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Premium Games</h3>
            <p className="text-gray-400">25+ high-quality games across multiple genres and difficulty levels</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-yellow-500/50 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">NFT Holder Perks</h3>
            <p className="text-gray-400">PMBC holders get 2x rewards, exclusive tournaments, and early access</p>
          </div>
        </div>

        <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl">
          🔗 Connect Wallet
        </button>
      </div>
    </section>
  )
}

export default function GamesPage() {
  return (
    <main className="min-h-screen bg-black">
      <PrimeArcadeHero />
      <Games />
      <PrimeArcade />
      <Footer />
    </main>
  )
}
