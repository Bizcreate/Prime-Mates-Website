"use client"
import type { ReactNode } from "react"
import { ThirdwebProvider } from "thirdweb/react"

/**
 * Global provider keeps connection & query state across routes.
 * Why: ensures wallet state persists between pages in App Router.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider>
      {/* ThirdwebProvider sets up react-query; ConnectButton receives `client` */}
      {/* Auto-connect is included in Connect UI; if you build custom UI, mount AutoConnect */}
      {children}
    </ThirdwebProvider>
  )
}
