"use client"

import { useActiveAccount } from "thirdweb/react"
import { UserProfile } from "@/components/UserProfile"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProfilePage() {
  const account = useActiveAccount()
  const router = useRouter()

  useEffect(() => {
    if (!account) {
      router.push("/dashboard")
    }
  }, [account, router])

  if (!account) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-400 mb-4">Connect Wallet Required</h1>
          <p className="text-gray-400">Please connect your wallet to access your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <UserProfile />
      </div>
    </div>
  )
}
