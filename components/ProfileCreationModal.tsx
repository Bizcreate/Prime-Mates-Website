"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Lock, MapPin, Wallet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth"
import { doc, setDoc, getFirestore } from "firebase/firestore"
import firebase_app from "../firebase/config"

const auth = getAuth(firebase_app)
const db = getFirestore(firebase_app)

interface ProfileData {
  name: string
  email: string
  password: string
  confirmPassword: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

interface ProfileCreationModalProps {
  walletAddress: string
  onProfileCreated: (profile: any) => void
  onClose: () => void
}

export function ProfileCreationModal({ walletAddress, onProfileCreated, onClose }: ProfileCreationModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
    },
  })

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("shippingAddress.")) {
      const addressField = field.split(".")[1]
      setProfileData((prev) => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [addressField]: value,
        },
      }))
    } else {
      setProfileData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const validateStep1 = () => {
    if (!profileData.name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" })
      return false
    }
    if (!profileData.email.trim() || !profileData.email.includes("@")) {
      toast({ title: "Error", description: "Valid email is required", variant: "destructive" })
      return false
    }
    if (profileData.password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" })
      return false
    }
    if (profileData.password !== profileData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" })
      return false
    }
    return true
  }

  const validateStep2 = () => {
    const { street, city, state, zipCode } = profileData.shippingAddress
    if (!street.trim() || !city.trim() || !state.trim() || !zipCode.trim()) {
      toast({ title: "Error", description: "All shipping address fields are required", variant: "destructive" })
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const handleCreateProfile = async () => {
    if (!validateStep2()) return

    setLoading(true)
    try {
      console.log("[v0] Creating Firebase user account...")

      // Create Firebase user account
      const userCredential = await createUserWithEmailAndPassword(auth, profileData.email, profileData.password)
      const firebaseUser = userCredential.user

      console.log("[v0] Firebase user created:", firebaseUser.uid)

      // Create comprehensive user profile
      const userProfile = {
        uid: firebaseUser.uid,
        name: profileData.name,
        email: profileData.email,
        connectedWallets: [walletAddress],
        primaryWallet: walletAddress,
        shippingAddress: profileData.shippingAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        memberTier: "Bronze",
        totalNFTs: 0,
        stakingPoints: 0,
        achievements: [],
        preferences: {
          emailNotifications: true,
          marketingEmails: false,
        },
      }

      // Save to Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), userProfile)

      // Also create wallet-to-user mapping
      await setDoc(doc(db, "walletLinks", walletAddress), {
        userId: firebaseUser.uid,
        linkedAt: new Date().toISOString(),
      })

      console.log("[v0] User profile created successfully")

      toast({
        title: "Profile Created!",
        description: "Welcome to Prime Mates! Your profile has been created successfully.",
      })

      onProfileCreated(userProfile)
    } catch (error: any) {
      console.error("[v0] Profile creation error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
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
            <Wallet className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Create Your Profile</h2>
            <p className="text-gray-400">
              {step === 1 ? "Set up your account details" : "Add your shipping information"}
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="bg-black border-gray-700 text-white"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-white flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
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
                  value={profileData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="bg-black border-gray-700 text-white"
                  placeholder="Create a password (min 6 characters)"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={profileData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="bg-black border-gray-700 text-white"
                  placeholder="Confirm your password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button onClick={handleNext} className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500">
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <MapPin className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-white">Shipping Address</h3>
                <p className="text-sm text-gray-400">For NFT merchandise and physical rewards</p>
              </div>

              <div>
                <Label htmlFor="street" className="text-white">
                  Street Address
                </Label>
                <Input
                  id="street"
                  value={profileData.shippingAddress.street}
                  onChange={(e) => handleInputChange("shippingAddress.street", e.target.value)}
                  className="bg-black border-gray-700 text-white"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="city" className="text-white">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={profileData.shippingAddress.city}
                    onChange={(e) => handleInputChange("shippingAddress.city", e.target.value)}
                    className="bg-black border-gray-700 text-white"
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-white">
                    State
                  </Label>
                  <Input
                    id="state"
                    value={profileData.shippingAddress.state}
                    onChange={(e) => handleInputChange("shippingAddress.state", e.target.value)}
                    className="bg-black border-gray-700 text-white"
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="zipCode" className="text-white">
                    ZIP Code
                  </Label>
                  <Input
                    id="zipCode"
                    value={profileData.shippingAddress.zipCode}
                    onChange={(e) => handleInputChange("shippingAddress.zipCode", e.target.value)}
                    className="bg-black border-gray-700 text-white"
                    placeholder="12345"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="text-white">
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={profileData.shippingAddress.country}
                    onChange={(e) => handleInputChange("shippingAddress.country", e.target.value)}
                    className="bg-black border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleCreateProfile}
                  disabled={loading}
                  className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500"
                >
                  {loading ? "Creating..." : "Create Profile"}
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Connected Wallet: {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
