"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { CartDisplay } from "@/components/cart-display"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { name: "Home", href: "/" },
    { name: "NFTs", href: "/nfts" },
    { name: "Gallery", href: "/gallery" },
    { name: "Mint", href: "/mint" },
    { name: "Mint PTTB", href: "/mint-pttb" },
    { name: "Stake", href: "/stake" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Community", href: "/community" },
    { name: "Games & Prime Arcade", href: "/games" },
    { name: "Merch", href: "/merch" },
    { name: "Events", href: "/events" },
    { name: "About", href: "/#about" },
    { name: "Contact", href: "/#contact" },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-primary/20 glow-yellow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Image src="/images/banana-logo.png" alt="Prime Mates Board Club" width={50} height={50} className="mr-3" />
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-primary glow-yellow-soft">PMBC</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium text-sm uppercase tracking-wide hover:glow-yellow-soft"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <CartDisplay />
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground hover:text-primary hover:bg-primary/10 border-glow-yellow"
            >
              <User className="h-5 w-5" />
            </Button>
            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background border-primary/20 panel-glow">
                <div className="flex flex-col space-y-6 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-foreground hover:text-primary transition-colors font-medium text-lg uppercase tracking-wide hover:glow-yellow-soft"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
