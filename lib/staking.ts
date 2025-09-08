import { doc, setDoc, getDoc } from "firebase/firestore"
import { toast } from "react-hot-toast"
import { db } from "./firebase"

export const stakeNFT = async (userId: string, stakeData: any) => {
  try {
    const stakingRef = doc(db, "staking", userId)
    const stakingDoc = await getDoc(stakingRef)

    const currentStakes = stakingDoc.exists() ? stakingDoc.data().stakes : []

    // Add new stake to the array
    currentStakes.push({
      nftId: stakeData.nft.token_id,
      nftContract: stakeData.nft.token_address,
      startDate: stakeData.startDate,
      endDate: stakeData.endDate,
      stakePeriod: stakeData.stakePeriod,
      rewardPercentage: stakeData.rewardPercentage,
      status: "active",
      createdAt: new Date(),
    })

    await setDoc(stakingRef, { stakes: currentStakes }, { merge: true })
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
    const stakingRef = doc(db, "staking", userId)
    const stakingDoc = await getDoc(stakingRef)

    if (!stakingDoc.exists()) {
      toast.error("No staking record found")
      return false
    }

    const currentStakes = stakingDoc.data().stakes
    const updatedStakes = currentStakes.filter((stake: any) => stake.nftId !== nftId)

    if (currentStakes.length === updatedStakes.length) {
      toast.error("NFT not found in staking")
      return false
    }

    await setDoc(stakingRef, { stakes: updatedStakes }, { merge: true })
    toast.success("NFT unstaked successfully!")
    return true
  } catch (error) {
    console.error("Error unstaking NFT:", error)
    toast.error("Failed to unstake NFT. Please try again.")
    return false
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
