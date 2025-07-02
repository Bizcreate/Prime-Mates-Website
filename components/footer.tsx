import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ExternalLink } from "lucide-react"
import Image from "next/image"

export function Footer() {
  const footerLinks = {
    NFTs: [
      { name: "PMBC Collection", url: "https://opensea.io/collection/pmbc" },
      { name: "Prime To The Bone", url: "https://opensea.io/collection/prime-to-the-bone" },
      { name: "Halloween Collection", url: "https://opensea.io/collection/prime-halloween-board-club" },
      { name: "Christmas Collection", url: "https://opensea.io/collection/prime-mates-christmas-club" },
    ],
    Games: ["Metaverse", "Skate Rush", "Surf Legends", "Snow Shredders"],
    Community: ["Discord", "Events", "Sponsorships", "Athletes"],
    Company: ["About", "Careers", "Press", "Contact"],
  }

  return (
    <footer className="bg-gray-900 text-white border-t border-yellow-400/20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <Image
                src="/images/banana-logo.png"
                alt="Prime Mates Board Club"
                width={60}
                height={60}
                className="mr-3"
              />
              <div>
                <h3 className="text-2xl font-black text-yellow-400">PMBC</h3>
                <p className="text-sm text-gray-400">BOARD CLUB</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              The ultimate destination for board culture enthusiasts. From NFTs to games, merch to events - we're
              building the future of board sports with the shaka spirit.
            </p>
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold">Join the Club</Button>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-bold mb-4 text-yellow-400">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={typeof link === "string" ? link : link.name}>
                    {typeof link === "string" ? (
                      <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                        {link}
                      </a>
                    ) : (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors text-sm flex items-center"
                      >
                        {link.name}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-yellow-400/20" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2024 Prime Mates Board Club. All rights reserved. Shaka forever! 🤙</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
