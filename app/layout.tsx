import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/context/cart-context"
import { ThirdwebProvider } from "thirdweb/react"
import { client } from "@/lib/client"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Prime Mates Board Club",
  description: "Official website for Prime Mates Board Club",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ThirdwebProvider activeChain="ethereum" client={client}>
            <CartProvider>
              <Navigation />
              <div className="pt-20">{children}</div>
              <Toaster />
            </CartProvider>
          </ThirdwebProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
