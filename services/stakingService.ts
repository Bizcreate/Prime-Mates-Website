// services/stakingService.ts
"use client";

/**
 * Firestore staking service used by the dashboard NFT cards.
 * - Stores stakes in top-level "stakes" collection
 *   with doc id `${userId}_${nftId}` for easy lookups.
 * - Safe to import from client components.
 */

import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
} from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// ---- Firebase singleton (client only) --------------------------------------

let _app: FirebaseApp | null = null;

function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    // This service is intended for client usage only.
    // Early return to avoid SSR importing the web SDK.
    throw new Error("stakingService must be used on the client");
  }
  if (_app) return _app;
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  };
  _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

function db() {
  return getFirestore(getFirebaseApp());
}

// ---- Types -----------------------------------------------------------------

export type StakeStatus = "active" | "completed" | "cancelled";

export type StakeRecord = {
  id: string;                 // `${userId}_${nftId}`
  userId: string;             // wallet address or uid
  nftId: string;              // token id (string)
  chain?: "ethereum" | "polygon" | string;
  collectionAddress?: string; // optional: contract address
  startDate: string;          // ISO string
  endDate: string;            // ISO string
  stakePeriod: number;        // weeks
  rewardPercentage: number;   // e.g. 5
  status: StakeStatus;        // "active" | "completed" | "cancelled"
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  // Optional snapshot of NFT metadata at stake time (for display)
  nftSnapshot?: any;
};

// ---- Helpers ---------------------------------------------------------------

function stakeDocRef(userId: string, nftId: string) {
  const id = `${userId}_${nftId}`;
  return doc(db(), "stakes", id);
}

// ---- Public API ------------------------------------------------------------

/** Fetch all stakes for a user. */
export async function getStakedNFTs(userId: string): Promise<StakeRecord[]> {
  if (!userId) return [];
  const q = query(collection(db(), "stakes"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Omit<StakeRecord, "id">;
    return { id: d.id, ...data };
  });
}

/** Create/overwrite a stake for (userId, nftId). */
export async function stakeNFT(
  userId: string,
  params: {
    nft: any; // raw NFT object from thirdweb or your source
    nftId: string; // token id as string
    chain?: "ethereum" | "polygon" | string;
    collectionAddress?: string;
    startDate: Date;
    endDate: Date;
    stakePeriod: number;
    rewardPercentage: number;
  }
): Promise<boolean> {
  if (!userId) throw new Error("stakeNFT: missing userId");
  const id = `${userId}_${params.nftId}`;
  const ref = doc(db(), "stakes", id);

  const rec: StakeRecord = {
    id,
    userId,
    nftId: params.nftId,
    chain: params.chain,
    collectionAddress: params.collectionAddress,
    startDate: params.startDate.toISOString(),
    endDate: params.endDate.toISOString(),
    stakePeriod: params.stakePeriod,
    rewardPercentage: params.rewardPercentage,
    status: "active",
    createdAt: serverTimestamp() as unknown as Timestamp,
    updatedAt: serverTimestamp() as unknown as Timestamp,
    nftSnapshot: params.nft ?? null,
  };

  await setDoc(ref, rec, { merge: true });
  return true;
}

/** Remove/complete a stake for (userId, nftId). */
export async function unstakeNFT(userId: string, nftId: string): Promise<boolean> {
  if (!userId || !nftId) return false;
  const ref = stakeDocRef(userId, nftId);
  const existing = await getDoc(ref);
  if (!existing.exists()) return true; // nothing to do

  // You can either delete, or mark completed:
  // Option A) hard delete:
  // await deleteDoc(ref);

  // Option B) soft-complete (keeps history):
  await setDoc(
    ref,
    { status: "completed", updatedAt: serverTimestamp() as unknown as Timestamp },
    { merge: true }
  );

  return true;
}

/** Utility: is stake unlockable (now >= endDate)? */
export function canUnstake(stake: StakeRecord): boolean {
  const now = Date.now();
  const end = new Date(stake.endDate).getTime();
  return now >= end;
}
