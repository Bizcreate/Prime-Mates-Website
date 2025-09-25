"use client";

import { db } from "@/lib/firebase";
import {
  collection, doc, setDoc, getDocs, query, where, updateDoc, serverTimestamp, deleteDoc
} from "firebase/firestore";

type StakeData = {
  nft: any;                  // raw NFT object/metadata you store
  startDate: Date | string;
  endDate: Date | string;
  stakePeriod: number;       // weeks
  rewardPercentage: number;
};

export async function getStakedNFTs(userId: string) {
  const col = collection(db, "users", userId.toLowerCase(), "stakes");
  const qs = query(col, where("status", "in", ["active", "locked"]));
  const snap = await getDocs(qs);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
}

export async function stakeNFT(userId: string, data: StakeData) {
  try {
    const id = `${data.nft?.token_id || data.nft?.id || crypto.randomUUID()}`;
    const stakeDoc = doc(db, "users", userId.toLowerCase(), "stakes", id);
    await setDoc(stakeDoc, {
      nftId: id,
      ...data,
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (e) {
    console.error("stakeNFT error", e);
    return false;
  }
}

export async function unstakeNFT(userId: string, nftId: string) {
  try {
    const stakeDoc = doc(db, "users", userId.toLowerCase(), "stakes", nftId);
    // Either mark completed...
    await updateDoc(stakeDoc, { status: "completed", updatedAt: serverTimestamp() });
    // ...or actually delete:
    // await deleteDoc(stakeDoc);
    return true;
  } catch (e) {
    console.error("unstakeNFT error", e);
    return false;
  }
}
