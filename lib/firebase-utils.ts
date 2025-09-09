import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore"
import { db } from "./firebase"

// User management utilities
export const createUser = async (userData: any) => {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export const getUser = async (userId: string) => {
  try {
    const docRef = doc(db, "users", userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting user:", error)
    throw error
  }
}

export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting users:", error)
    throw error
  }
}

export const updateUser = async (userId: string, userData: any) => {
  try {
    const docRef = doc(db, "users", userId)
    await updateDoc(docRef, {
      ...userData,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

export const deleteUser = async (userId: string) => {
  try {
    await deleteDoc(doc(db, "users", userId))
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

// Search users by wallet address
export const getUserByWallet = async (walletAddress: string) => {
  try {
    const q = query(collection(db, "users"), where("walletAddress", "==", walletAddress.toLowerCase()))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() }
    }
    return null
  } catch (error) {
    console.error("Error getting user by wallet:", error)
    throw error
  }
}

// NFT and staking utilities
export const saveStakingData = async (walletAddress: string, stakingData: any) => {
  try {
    const docRef = await addDoc(collection(db, "staking"), {
      walletAddress: walletAddress.toLowerCase(),
      ...stakingData,
      timestamp: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error saving staking data:", error)
    throw error
  }
}

export const getStakingData = async (walletAddress: string) => {
  try {
    const q = query(
      collection(db, "staking"),
      where("walletAddress", "==", walletAddress.toLowerCase()),
      orderBy("timestamp", "desc"),
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting staking data:", error)
    throw error
  }
}

export const toUnifiedProfile = (user: any) => {
  if (!user) return null

  return {
    id: user.id,
    walletAddress: user.walletAddress,
    email: user.email || null,
    username: user.username || null,
    displayName: user.displayName || user.username || "Anonymous",
    avatar: user.avatar || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    // Shipping details
    shippingAddress: user.shippingAddress || null,
    // Prime Arcade stats
    totalPoints: user.totalPoints || 0,
    stakedNFTs: user.stakedNFTs || 0,
    // Profile linking
    linkedWallets: user.linkedWallets || [],
    isPrimary: user.isPrimary || false,
  }
}
