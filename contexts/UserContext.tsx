"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "../firebase/config"
import { getAuth, signOut, updatePassword } from "firebase/auth"
import { toast } from "react-hot-toast"
import {
  handleReferral,
  getInitialBalance,
  getReferralFromUrl,
  getReferralFromTelegram,
  createBaseUserData,
} from "../utils/referral"

const userLevels = [
  { id: 1, name: "Bronze", icon: "/bronze.webp", tapBalanceRequired: 1000 },
  { id: 2, name: "Silver", icon: "/silver.webp", tapBalanceRequired: 50000 },
  { id: 3, name: "Gold", icon: "/gold.webp", tapBalanceRequired: 500000 },
  {
    id: 4,
    name: "Platinum",
    icon: "/platinum.webp",
    tapBalanceRequired: 1000000,
  },
  {
    id: 5,
    name: "Diamond",
    icon: "/diamond.webp",
    tapBalanceRequired: 2500000,
  },
  { id: 6, name: "Master", icon: "/master.webp", tapBalanceRequired: 5000000 },
]
const UserContext = createContext()

export const useUser = () => useContext(UserContext)

export const UserProvider = ({ children }) => {
  // Essential user states
  const [balance, setBalance] = useState(0)
  const [tapBalance, setTapBalance] = useState(0)
  const [energy, setEnergy] = useState(500)
  const [battery, setBattery] = useState({ level: 1, energy: 500 })
  const [tapValue, setTapValue] = useState({ level: 1, value: 1 })
  const [level, setLevel] = useState({
    id: 1,
    name: "Bronze",
    imgUrl: "/bronze.webp",
  })
  const [characterSelect, setCharacterSelect] = useState(false)
  const [fullNameSelect, setFullNameSelect] = useState(false)
  const [error, setError] = useState("")

  // Authentication and profile states
  const [id, setId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [profileSetup, setProfileSetup] = useState(false)
  const [referrals, setReferrals] = useState([])

  // User profile states
  const [selectedCharacter, setSelectedCharacter] = useState({
    name: "",
    avatar: "",
  })
  const [fullName, setFullName] = useState("")

  // Game mechanics states
  const [tapGuru, setTapGuru] = useState(false)
  const [mainTap, setMainTap] = useState(true)
  const [selectedExchange, setSelectedExchange] = useState({
    id: "selectex",
    icon: "/exchange.svg",
    name: "Select exchange",
  })

  // Add claimedMilestones state
  const [claimedMilestones, setClaimedMilestones] = useState([])

  // Add freeGuru state
  const [freeGuru, setFreeGuru] = useState(3) // Initialize with 3 free uses per day

  const telegramUser = window.Telegram?.WebApp.initDataUnsafe?.user

  // Helper function to get the correct collection and user ID
  const getUserRef = (customId = null) => {
    const userId = customId || id
    if (!userId) return null
    return doc(db, "users", userId.toString())
  }

  // Helper function to update user data
  const updateUserData = async (data) => {
    try {
      const userRef = getUserRef()
      if (!userRef) throw new Error("No user reference found")

      // Update local state immediately for responsive UI
      Object.entries(data).forEach(([key, value]) => {
        switch (key) {
          case "balance":
            setBalance(value)
            break
          case "tapBalance":
            setTapBalance(value)
            break
          case "energy":
            setEnergy(value)
            break
          // Add other cases as needed
        }
      })

      // Then update Firestore
      await updateDoc(userRef, {
        ...data,
        lastUpdated: new Date(),
      })

      return true
    } catch (error) {
      console.error("Error updating user data:", error)
      toast.error("Failed to update user data")
      return false
    }
  }

  // Refactored update profile function
  const updateProfile = async (profileData) => {
    try {
      const userRef = getUserRef()
      if (!userRef) throw new Error("No user reference found")

      const updateData = {
        fullName: profileData.fullName,
        character: profileData.character,
        profileCompleted: true,
      }

      const success = await updateUserData(updateData)
      if (success) {
        setFullName(profileData.fullName)
        setSelectedCharacter(profileData.character)
        setProfileSetup(false)
        return true
      }
      return false
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
      return false
    }
  }

  // Add this function after the userLevels array
  const calculateUserLevel = (tapBalance) => {
    let currentLevel = userLevels[0]
    let nextLevel = userLevels[1]

    for (let i = 0; i < userLevels.length; i++) {
      if (tapBalance >= userLevels[i].tapBalanceRequired) {
        currentLevel = userLevels[i]
        nextLevel = userLevels[i + 1] || null
      } else {
        break
      }
    }

    // Simplified progress calculation
    const progressPercentage = nextLevel ? (tapBalance / nextLevel.tapBalanceRequired) * 100 : 100

    return {
      id: currentLevel.id,
      name: currentLevel.name,
      imgUrl: currentLevel.icon,
      currentBalance: tapBalance,
      currentProgress: Number.parseFloat(progressPercentage.toFixed(2)),
      nextLevel: nextLevel
        ? {
            id: nextLevel.id,
            name: nextLevel.name,
            imgUrl: nextLevel.icon,
            tapBalanceRequired: nextLevel.tapBalanceRequired,
            remainingBalance: nextLevel.tapBalanceRequired - tapBalance,
          }
        : null,
    }
  }

  // Add this to the UserProvider component
  const updateUserLevel = async (newTapBalance) => {
    try {
      const { currentLevel, nextLevel } = calculateUserLevel(newTapBalance)

      // Update local state
      setLevel(currentLevel)

      // Update Firestore
      const userRef = getUserRef()
      if (!userRef) throw new Error("No user reference found")

      await updateDoc(userRef, {
        level: currentLevel,
        nextLevel: nextLevel,
        lastUpdated: new Date(),
      })

      return true
    } catch (error) {
      console.error("Error updating user level:", error)
      toast.error("Failed to update user level")
      return false
    }
  }

  // Modify the fetchData function to include nextLevel
  const fetchData = async (userId) => {
    try {
      setLoading(true)
      const userRef = getUserRef(userId)
      if (!userRef) throw new Error("No user reference found")

      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        const currentTapBalance = userData.tapBalance || 0

        // Calculate level with progress
        const levelData = calculateUserLevel(currentTapBalance)

        // Set all user data
        setBalance(userData.balance || 0)
        setTapBalance(currentTapBalance)
        setEnergy(userData.energy || 500)
        setBattery(userData.battery || { level: 1, energy: 500 })
        setTapValue(userData.tapValue || { level: 1, value: 1 })
        setLevel(levelData) // Now includes progress percentage

        // Update the document with current and next level info
        await updateDoc(userRef, {
          level: levelData,
        })

        setSelectedCharacter(userData.character || { name: "", avatar: "" })
        setFullName(userData.fullName || "")
        setSelectedExchange(
          userData.selectedExchange || {
            id: "selectex",
            icon: "/exchange.svg",
            name: "Select exchange",
          },
        )
        setClaimedMilestones(userData.claimedMilestones || [])

        setId(userId)
        setInitialized(true)
        setReferrals(userData.referrals || [])

        if (!userData.character || !userData.character.name || !userData.fullName) {
          setProfileSetup(true)
        }

        // Add freeGuru state update
        setFreeGuru(userData.freeGuru ?? 3) // Default to 3 if not set

        return true
      }
      return false
    } catch (error) {
      console.error("Error fetching data:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleWebSignup = async (userData) => {
    try {
      const userRef = doc(db, "users", userData.userId)

      // Get referral ID and initial balance
      const referrerId = getReferralFromUrl()
      const initialBalance = getInitialBalance(referrerId)

      // Create user data with authProvider field
      const newUserData = {
        ...createBaseUserData(userData.userId, initialBalance, {
          email: userData.email,
        }),
        authProvider: "web",
        id: userData.userId,
      }

      // Create new user document
      await setDoc(userRef, newUserData)

      // Handle referral if exists
      if (referrerId) {
        await handleReferral(referrerId, userData.userId)
      }

      setId(userData.userId)
      setProfileSetup(true)
      setInitialized(true)

      return { success: true }
    } catch (error) {
      console.error("Error creating web user:", error)
      toast.error("Failed to create account")
      return { success: false, error }
    }
  }

  const handleLogout = async () => {
    try {
      const auth = getAuth()
      await signOut(auth)
      setShowAuthForm(true)
      setIsLogin(true)
      // Reset all user states
      setBalance(0)
      setTapBalance(0)
      setEnergy(500)
      setBattery({ level: 1, energy: 500 })
      setTapValue({ level: 1, value: 1 })
      setLevel({ id: 1, name: "Bronze", imgUrl: "/bronze.webp" })
      setSelectedCharacter({ name: "", avatar: "" })
      setFullName("")
      toast.success("Logged out successfully")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to logout")
    }
  }

  useEffect(() => {
    const auth = getAuth()

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        setInitialized(false)

        // Check for Telegram user first
        if (telegramUser) {
          console.log("Telegram user detected in context:", telegramUser)
          await handleTelegramLogin(telegramUser)
        }
        // Then check for Firebase auth user
        else if (user) {
          console.log("Firebase user detected:", user.uid)
          await fetchData(user.uid)
          setShowAuthForm(false)
        }
        // No authenticated user
        else {
          console.log("No authenticated user found")
          setShowAuthForm(true)
          setIsLogin(true)
          setId(null)
        }
      } catch (error) {
        console.error("Auth state change error:", error)
        toast.error("Authentication error occurred")
      } finally {
        setInitialized(true)
      }
    })

    return () => unsubscribe()
  }, [])

  // Add a dedicated function to handle Telegram login
  const handleTelegramLogin = async (user) => {
    console.log("Handling Telegram login for user:", user)
    const telegramId = user.id.toString()

    try {
      // Check if user exists
      const userDoc = await getDoc(doc(db, "users", telegramId))

      if (userDoc.exists()) {
        console.log("Existing Telegram user found")
        const userData = userDoc.data()

        // Set user data
        await fetchData(telegramId)

        // Check if profile is completed
        if (!userData.profileCompleted || !userData.character || !userData.fullName) {
          console.log("Profile incomplete, showing character select")
          setCharacterSelect(true)
          setProfileSetup(true)
          setShowAuthForm(false)
        }
      } else {
        console.log("Creating new Telegram user")
        // Create new user
        const referrerId = getReferralFromTelegram()
        const initialBalance = getInitialBalance(referrerId)

        const newTelegramUser = {
          ...createBaseUserData(telegramId, initialBalance, {
            username: user.username || "",
            firstName: user.first_name || "",
            lastName: user.last_name || "",
            languageCode: user.language_code || "en",
          }),
          authProvider: "telegram",
          telegramId: telegramId,
          profileCompleted: false,
          createdAt: new Date(),
        }

        // Save to Firestore
        await setDoc(doc(db, "users", telegramId), newTelegramUser)

        // Handle referral if exists
        if (referrerId) {
          await handleReferral(referrerId, telegramId)
        }

        // Set local state
        setId(telegramId)
        setBalance(initialBalance)
        setTapBalance(initialBalance)
        setEnergy(500)
        setBattery({ level: 1, energy: 500 })
        setTapValue({ level: 1, value: 1 })
        setLevel({ id: 1, name: "Bronze", imgUrl: "/bronze.webp" })

        // Show character selection
        console.log("Showing character select for new user")
        setCharacterSelect(true)
        setProfileSetup(true)

        toast.success("Welcome! Please select your character.")
      }

      // Hide auth form
      setShowAuthForm(false)
    } catch (error) {
      console.error("Error in handleTelegramLogin:", error)
      toast.error("Failed to process Telegram login")
    }
  }

  // Add a function to update level when tap balance changes
  const updateTapBalance = async (newTapBalance) => {
    try {
      const userRef = getUserRef()
      if (!userRef) return false

      // Only recalculate level if we've reached or exceeded the next level requirement
      let shouldUpdateLevel = false
      if (level.nextLevel && newTapBalance >= level.nextLevel.tapBalanceRequired) {
        const levelData = calculateUserLevel(newTapBalance)
        setLevel(levelData)
        shouldUpdateLevel = true
      }

      setTapBalance(newTapBalance)

      // Update Firestore with only necessary data
      const updateData = {
        tapBalance: newTapBalance,
      }

      if (shouldUpdateLevel) {
        updateData.level = level
      }

      await updateDoc(userRef, updateData)
      return true
    } catch (error) {
      console.error("Error updating tap balance:", error)
      return false
    }
  }

  // Add freeGuru reset logic (optional - to reset freeGuru count daily)
  useEffect(() => {
    if (!id) return

    const resetFreeGuru = async () => {
      const now = new Date()
      const lastResetDate = localStorage.getItem("lastFreeGuruReset")

      if (!lastResetDate || new Date(lastResetDate).getDate() !== now.getDate()) {
        try {
          const success = await updateUserData({
            freeGuru: 3,
          })

          if (success) {
            setFreeGuru(3)
            localStorage.setItem("lastFreeGuruReset", now.toISOString())
          }
        } catch (error) {
          console.error("Error resetting free guru:", error)
        }
      }
    }

    resetFreeGuru()
  }, [id])

  const changePassword = async (newPassword) => {
    try {
      const auth = getAuth()
      const user = auth.currentUser

      if (!user) {
        throw new Error("No authenticated user found")
      }

      // Update password directly
      await updatePassword(user, newPassword)

      toast.success("Password updated successfully")
      return true
    } catch (error) {
      console.error("Password change error:", error)

      // Provide more specific error messages
      switch (error.code) {
        case "auth/weak-password":
          toast.error("Password is too weak. Please choose a stronger password.")
          break
        case "auth/requires-recent-login":
          // Use handleLogout to manage the logout process
          await handleLogout()
          toast.error("Please log back in to change your password")
          break
        default:
          toast.error("Failed to change password. " + error.message)
      }

      return false
    }
  }

  return (
    <UserContext.Provider
      value={{
        // User data
        id,
        balance,
        tapBalance,
        energy,
        battery,
        tapValue,
        level,

        // Profile data
        fullName,
        selectedCharacter,
        profileSetup,

        // Game state
        tapGuru,
        mainTap,
        selectedExchange,

        // Auth state
        loading,
        initialized,
        isLogin,

        // Setters
        setBalance,
        setTapBalance,
        setEnergy,
        setSelectedCharacter,
        setFullName,
        setIsLogin,
        setBattery,
        setReferrals,

        // Actions
        handleWebSignup,
        updateProfile,

        // Add these to your context value if not already present
        characterSelect,
        setCharacterSelect,
        fullNameSelect,
        setFullNameSelect,
        error,
        setError,
        updateUserData,
        getUserRef,

        showAuthForm,
        setShowAuthForm,
        handleLogout,

        // New claimedMilestones state
        claimedMilestones,
        setClaimedMilestones,

        referrals,

        // New updateUserLevel function
        updateUserLevel,

        // New updateTapBalance function
        updateTapBalance,

        // Add freeGuru and its setter to the context
        freeGuru,
        setFreeGuru,

        changePassword,

        telegramUser,
        handleTelegramLogin,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
