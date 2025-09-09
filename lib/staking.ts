import { doc, setDoc, getDoc } from "firebase/firestore"
import { toast } from "react-hot-toast"
import { db } from "./firebase"

export const calculateStakingPoints = (stakeData: any) => {
  const now = new Date()
  const startDate = new Date(stakeData.startDate)
  const hoursStaked = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60))

  // Base points: 1 point per hour
  const basePoints = hoursStaked

  // Collection multipliers
  const collectionMultipliers: { [key: string]: number } = {
    "0x123...": 1.5, // PMBC contract - replace with actual address
    "0x456...": 1.2, // PTTB contract - replace with actual address
  }

  const multiplier = collectionMultipliers[stakeData.nftContract] || 1.0
  return Math.floor(basePoints * multiplier)
}

export const updateUserPoints = async (userId: string, pointsToAdd: number) => {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    const currentPoints = userDoc.exists() ? userDoc.data().totalPoints || 0 : 0
    const newTotal = currentPoints + pointsToAdd

    await setDoc(
      userRef,
      {
        totalPoints: newTotal,
        lastPointsUpdate: new Date(),
        pointsHistory: userDoc.exists()
          ? [...(userDoc.data().pointsHistory || []), { points: pointsToAdd, timestamp: new Date() }]
          : [{ points: pointsToAdd, timestamp: new Date() }],
      },
      { merge: true },
    )

    return newTotal
  } catch (error) {
    console.error("Error updating user points:", error)
    return null
  }
}

export const stakeNFT = async (userId: string, stakeData: any) => {
  try {
    console.log("[v0] Staking NFT:", stakeData.nft.token_id)
    const stakingRef = doc(db, "staking", userId)
    const stakingDoc = await getDoc(stakingRef)

    const currentStakes = stakingDoc.exists() ? stakingDoc.data().stakes : []

    // Add new stake to the array
    const newStake = {
      nftId: stakeData.nft.token_id,
      nftContract: stakeData.nft.token_address,
      startDate: new Date(),
      stakePeriod: stakeData.stakePeriod || "flexible",
      rewardPercentage: stakeData.rewardPercentage || 0,
      status: "active",
      createdAt: new Date(),
      pointsEarned: 0,
    }

    currentStakes.push(newStake)

    await setDoc(stakingRef, { stakes: currentStakes }, { merge: true })
    console.log("[v0] NFT staked successfully in Firebase")
    toast.success("NFT staked successfully!")
    return true
  } catch (error) {
    console.error("Error staking NFT:", error)
    toast.error("Failed to stake NFT. Please try again.")
    return false
  }
}

export const unstakeNFT = async (userId: string, nftId: string) => {
  try {
    console.log("[v0] Unstaking NFT:", nftId)
    const stakingRef = doc(db, "staking", userId)
    const stakingDoc = await getDoc(stakingRef)

    if (!stakingDoc.exists()) {
      toast.error("No staking record found")
      return false
    }

    const currentStakes = stakingDoc.data().stakes
    const stakeToRemove = currentStakes.find((stake: any) => stake.nftId === nftId)

    if (!stakeToRemove) {
      toast.error("NFT not found in staking")
      return false
    }

    // Calculate final points for this stake
    const finalPoints = calculateStakingPoints(stakeToRemove)
    await updateUserPoints(userId, finalPoints)

    const updatedStakes = currentStakes.filter((stake: any) => stake.nftId !== nftId)

    await setDoc(stakingRef, { stakes: updatedStakes }, { merge: true })
    console.log("[v0] NFT unstaked successfully, points awarded:", finalPoints)
    toast.success(`NFT unstaked successfully! Earned ${finalPoints} points!`)
    return true
  } catch (error) {
    console.error("Error unstaking NFT:", error)
    toast.error("Failed to unstake NFT. Please try again.")
    return false
  }
}

export const getUserPoints = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return 0
    }

    return userDoc.data().totalPoints || 0
  } catch (error) {
    console.error("Error fetching user points:", error)
    return 0
  }
}

export const getStakedNFTs = async (userId: string) => {
  try {
    const stakingRef = doc(db, "staking", userId)
    const stakingDoc = await getDoc(stakingRef)

    if (!stakingDoc.exists()) {
      return []
    }

    return stakingDoc.data().stakes || []
  } catch (error) {
    console.error("Error fetching staked NFTs:", error)
    toast.error("Failed to fetch staked NFTs")
    return []
  }
}
