"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, LogIn, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebaseClient"

interface AuthModalProps {
  walletAddress: string
  onAuthSuccess: (profile: any) => void
  onClose: () => void
  onCreateNew: () => void
}

export function AuthModal({ walletAddress, onAuthSuccess, onClose, onCreateNew }: AuthModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      toast({ title: "Error", description: "Please enter both email and password", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      console.log("[v0] Signing in existing user...")

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      console.log("[v0] User signed in:", firebaseUser.uid)

      // Get existing user profile
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

      if (userDoc.exists()) {
        const userProfile = userDoc.data()

        // Check if wallet is already connected
        const connectedWallets = userProfile.connectedWallets || []

        if (!connectedWallets.includes(walletAddress)) {
          // Add wallet to existing profile
          const updatedWallets = [...connectedWallets, walletAddress]

          await updateDoc(doc(db, "users", firebaseUser.uid), {
            connectedWallets: updatedWallets,
            updatedAt: new Date().toISOString(),
          })

          // Create wallet-to-user mapping
          await setDoc(doc(db, "walletLinks", walletAddress), {
            userId: firebaseUser.uid,
            linkedAt: new Date().toISOString(),
          })

          console.log("[v0] Wallet linked to existing account")

          toast({
            title: "Wallet Linked!",
            description: "Your wallet has been successfully linked to your existing account.",
          })

          onAuthSuccess({
            ...userProfile,
            connectedWallets: updatedWallets,
          })
        } else {
          console.log("[v0] Wallet already linked to this account")
          onAuthSuccess(userProfile)
        }
      } else {
        toast({
          title: "Error",
          description: "User profile not found. Please create a new account.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("[v0] Sign in error:", error)
      toast({
        title: "Sign In Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <Card className="bg-gray-900 border-yellow-400/30 max-w-md w-full">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <LogIn className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
            <p className="text-gray-400">Sign in to link your wallet to your existing account</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black border-gray-700 text-white"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black border-gray-700 text-white"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
              >
                {loading ? "Signing In..." : "Sign In & Link Wallet"}
              </Button>

              <div className="text-center text-gray-400">or</div>

              <Button
                onClick={onCreateNew}
                variant="outline"
                className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create New Account
              </Button>

              <Button onClick={onClose} variant="ghost" className="w-full text-gray-400">
                Cancel
              </Button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Connecting Wallet: {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
