import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/packages/prime-shared/firebase/client"
import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore"

export async function POST(request: NextRequest) {
  try {
    const { action, walletAddress, tokenId, collection } = await request.json()

    if (!walletAddress || !tokenId || !collection) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    const userRef = doc(db, "users", walletAddress)
    const stakingRef = doc(db, "staking", `${collection}-${tokenId}`)

    if (action === "stake") {
      // Check if NFT is already staked
      const stakingDoc = await getDoc(stakingRef)
      if (stakingDoc.exists()) {
        return NextResponse.json({ error: "NFT already staked" }, { status: 400 })
      }

      // Create staking record
      await setDoc(stakingRef, {
        walletAddress,
        tokenId,
        collection,
        stakedAt: new Date().toISOString(),
        points: 0,
      })

      // Update user's staked count
      const userDoc = await getDoc(userRef)
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          stakedNFTs: increment(1),
        })
      } else {
        await setDoc(userRef, {
          walletAddress,
          stakedNFTs: 1,
          totalPoints: 0,
          createdAt: new Date().toISOString(),
        })
      }

      return NextResponse.json({ success: true, message: "NFT staked successfully" })
    } else if (action === "unstake") {
      // Remove staking record and award points
      const stakingDoc = await getDoc(stakingRef)
      if (!stakingDoc.exists()) {
        return NextResponse.json({ error: "NFT not staked" }, { status: 400 })
      }

      const stakingData = stakingDoc.data()
      const stakedAt = new Date(stakingData.stakedAt)
      const now = new Date()
      const hoursStaked = Math.floor((now.getTime() - stakedAt.getTime()) / (1000 * 60 * 60))
      const pointsEarned = hoursStaked * 10 // 10 points per hour

      // Update user points
      await updateDoc(userRef, {
        totalPoints: increment(pointsEarned),
        stakedNFTs: increment(-1),
      })

      // Delete staking record
      await stakingRef.delete()

      return NextResponse.json({
        success: true,
        message: "NFT unstaked successfully",
        pointsEarned,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Staking error:", error)
    return NextResponse.json({ error: "Staking operation failed" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("wallet")

    if (!walletAddress) {
      return NextResponse.json({ error: "Missing wallet address" }, { status: 400 })
    }

    const userRef = doc(db, "users", walletAddress)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      return NextResponse.json(userDoc.data())
    } else {
      return NextResponse.json({
        walletAddress,
        stakedNFTs: 0,
        totalPoints: 0,
      })
    }
  } catch (error) {
    console.error("Error fetching staking data:", error)
    return NextResponse.json({ error: "Failed to fetch staking data" }, { status: 500 })
  }
}
