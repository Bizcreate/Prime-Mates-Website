"use client"
import type { ReactNode } from "react"
import { Web3Provider } from "@/packages/prime-shared/providers/Web3Provider"

/**
 * Global provider keeps connection & query state across routes.
 * Why: ensures wallet state persists between pages in App Router.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Web3Provider>
      {/* Web3Provider includes ThirdwebProvider + Firebase auth + wallet management */}
      {children}
    </Web3Provider>
  )
}
