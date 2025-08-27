"use client"
import { useEffect, useState } from "react"
import type React from "react"

import { isLoggedIn } from "@/actions/login"

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null)

  useEffect(() => {
    isLoggedIn()
      .then(setOk)
      .catch(() => setOk(false))
  }, [])

  if (ok === null) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking wallet connection...</p>
        </div>
      </div>
    )
  }

  if (!ok) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔒</div>
          <h3 className="text-xl font-semibold">Wallet Connection Required</h3>
          <p className="text-muted-foreground">Please connect and sign in with your wallet to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
