"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation" // Fixed Next.js router import for app router
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast" // Using existing toast hook instead of react-hot-toast
import { FaEye, FaEyeSlash, FaTwitter } from "react-icons/fa"
import { useActiveAccount } from "thirdweb/react"

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
  if (num >= 1000) return (num / 1000).toFixed(1) + "K"
  return num.toString()
}

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
  </div>
)

const UserProfile = () => {
  const router = useRouter()
  const { toast } = useToast()
  const account = useActiveAccount()

  const mockUserData = {
    balance: 83612,
    energy: 444,
    tapBalance: 3175,
    level: {
      name: "Bronze",
      currentProgress: 6,
      imgUrl: "/placeholder.svg",
      nextLevel: {
        name: "Silver",
        remainingBalance: 46825,
        imgUrl: "/placeholder.svg",
      },
    },
    fullName: "Prime Mates Member",
    selectedCharacter: {
      avatar: "/placeholder.svg",
      twitter: "",
    },
    selectedExchange: {
      id: "selectex",
      name: "No Exchange",
      icon: "/placeholder.svg",
    },
    claimedMilestones: ["Bronze"],
  }

  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(mockUserData.fullName)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [passwordSection, setPasswordSection] = useState({
    isEditing: false,
    newPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [twitterSection, setTwitterSection] = useState({
    isEditing: false,
    username: "",
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (mockUserData.selectedCharacter?.twitter) {
      const twitterUrl = mockUserData.selectedCharacter.twitter
      const username = twitterUrl.replace("https://twitter.com/", "")
      setTwitterSection((prev) => ({
        ...prev,
        username: username,
      }))
    }
  }, [])

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setIsUploading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      })
    } catch (error) {
      setImagePreview(null)
      toast({
        title: "Error",
        description: "Failed to update profile picture",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleTwitterSubmit = async () => {
    const username = twitterSection.username.startsWith("@")
      ? twitterSection.username.substring(1)
      : twitterSection.username

    if (username.trim() === "") {
      toast({
        title: "Error",
        description: "Twitter username cannot be empty",
        variant: "destructive",
      })
      return
    }

    if (!/^[A-Za-z0-9_]{1,15}$/.test(username)) {
      toast({
        title: "Error",
        description: "Invalid Twitter username format",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setTwitterSection({
        ...twitterSection,
        isEditing: false,
      })
      toast({
        title: "Success",
        description: "Twitter profile linked successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update Twitter profile",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleNameSubmit = async () => {
    if (newName.trim() === "") {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Name updated successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update name",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordSection.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    setPasswordSection({
      isEditing: false,
      newPassword: "",
    })
    setShowPassword(false)
    router.push("/")
    toast({
      title: "Success",
      description: "Password changed. Please log back in.",
    })
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  }

  if (isLoading) {
    return <Spinner />
  }

  if (!account) {
    router.push("/dashboard")
    return <Spinner />
  }

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24 font-sans">
      {/* Header Section with Avatar and Basic Info */}
      <motion.div
        className="flex items-center mb-8 p-6 rounded-2xl bg-slate-800 border border-slate-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <motion.div className="relative" whileHover={{ scale: 1.05 }}>
            <img
              src={imagePreview || mockUserData.selectedCharacter?.avatar || "/placeholder.svg"}
              alt="Profile Avatar"
              className={`w-24 h-24 rounded-full mr-6 border-2 border-yellow-400 cursor-pointer ${
                isUploading ? "opacity-50" : ""
              }`}
              onClick={handleImageClick}
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </motion.div>
          <div className="absolute bottom-0 right-6 bg-yellow-400 rounded-full p-1 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-black"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
        <div>
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-xl bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
                placeholder="Enter your name"
                disabled={isUploading}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleNameSubmit}
                  disabled={isUploading}
                  className={`text-sm px-3 py-1 bg-yellow-400 text-black rounded hover:bg-opacity-80 transition-colors ${
                    isUploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isUploading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setNewName(mockUserData.fullName)
                  }}
                  disabled={isUploading}
                  className="text-sm px-3 py-1 bg-slate-600 text-gray-300 rounded hover:bg-opacity-80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white mb-1">{newName}</h1>
              <button
                onClick={() => setIsEditing(true)}
                disabled={isUploading}
                className="text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          )}
          <div className="flex items-center">
            <img src={mockUserData.level?.imgUrl || "/placeholder.svg"} alt="Level" className="w-5 h-5 mr-2" />
            <span className="text-yellow-400">{mockUserData.level?.name} Level</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { title: "Balance", value: formatNumber(mockUserData.balance), icon: "💰" },
          { title: "Energy", value: mockUserData.energy, icon: "⚡" },
          {
            title: "SHAKA Balance",
            value: formatNumber(mockUserData.tapBalance),
            icon: "💲",
          },
          {
            title: "Level Progress",
            value: `${Math.round(mockUserData.level?.currentProgress || 0)}%`,
            icon: "📈",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            className="p-5 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center mb-2">
              <span className="mr-2 text-xl">{stat.icon}</span>
              <h2 className="font-semibold text-gray-300">{stat.title}</h2>
            </div>
            <p className="text-xl text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Connected Wallet */}
      <motion.div className="mb-8 p-6 bg-slate-800 rounded-xl border border-slate-700" {...fadeInUp}>
        <h2 className="font-semibold text-gray-300 mb-4">Connected Wallet</h2>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-yellow-400 rounded-full mr-3 flex items-center justify-center">
            <span className="text-black font-bold text-sm">W</span>
          </div>
          <p className="text-white font-mono">{account?.address}</p>
        </div>
      </motion.div>

      {/* Twitter Profile Section */}
      <motion.div className="mb-8 p-6 bg-slate-800 rounded-xl border border-slate-700" {...fadeInUp}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-300">Twitter Profile</h2>
          {!twitterSection.isEditing && (
            <button
              onClick={() => setTwitterSection((prev) => ({ ...prev, isEditing: true }))}
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {twitterSection.isEditing ? (
          <div className="space-y-4">
            <div className="relative">
              <div className="flex items-center">
                <span className="absolute left-3 text-[#1DA1F2]">
                  <FaTwitter />
                </span>
                <input
                  type="text"
                  placeholder="username (without @)"
                  value={twitterSection.username}
                  onChange={(e) =>
                    setTwitterSection((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  disabled={isUploading}
                  className="w-full px-3 py-2 pl-10 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleTwitterSubmit}
                disabled={isUploading}
                className={`px-4 py-2 bg-[#1DA1F2] text-white rounded hover:bg-opacity-80 ${
                  isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isUploading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() =>
                  setTwitterSection((prev) => ({
                    ...prev,
                    isEditing: false,
                  }))
                }
                disabled={isUploading}
                className="px-4 py-2 bg-slate-600 text-gray-300 rounded hover:bg-opacity-80"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            {twitterSection.username ? (
              <div className="flex items-center">
                <motion.span className="text-[#1DA1F2] mr-2" whileHover={{ scale: 1.1 }}>
                  <FaTwitter />
                </motion.span>
                <motion.span
                  className="text-white hover:text-[#1DA1F2] transition-colors font-medium"
                  whileHover={{ scale: 1.03 }}
                >
                  @{twitterSection.username}
                </motion.span>
              </div>
            ) : (
              <span className="text-gray-400 italic">No Twitter profile linked</span>
            )}
          </div>
        )}
      </motion.div>

      {/* Password Change */}
      <motion.div className="mb-8 p-6 bg-slate-800 rounded-xl border border-slate-700" {...fadeInUp}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-300">Change Password</h2>
          {!passwordSection.isEditing && (
            <button
              onClick={() => setPasswordSection((prev) => ({ ...prev, isEditing: true }))}
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {passwordSection.isEditing && (
          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={passwordSection.newPassword}
                onChange={(e) =>
                  setPasswordSection((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 pr-10 bg-slate-700 border border-slate-600 rounded text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-opacity-80"
              >
                Save Password
              </button>
              <button
                onClick={() =>
                  setPasswordSection((prev) => ({
                    ...prev,
                    isEditing: false,
                    newPassword: "",
                  }))
                }
                className="px-4 py-2 bg-slate-600 text-gray-300 rounded hover:bg-opacity-80"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default UserProfile
export { UserProfile }
