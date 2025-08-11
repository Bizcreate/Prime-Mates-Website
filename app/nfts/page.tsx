import { NFTCollections } from "@/components/nft-collections"
import { Footer } from "@/components/footer"

export default function NFTsPage() {
  return (
    <main className="min-h-screen bg-black">
      <NFTCollections />
      <Footer />
    </main>
  )
}
