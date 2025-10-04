"use client";

import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  increment,
  type Unsubscribe,
} from "firebase/firestore";
import { db as sharedDb } from "@/lib/firebase/arcade";

/** users/{address} shape */
export type UserDoc = {
  xp?: number;                 // total XP
  telegramId?: string | null;  // optional mapping for TG
  updatedAt?: any;
};

/** users/{address}/activity/{id} shape */
export type ActivityDoc = {
  type: "points" | "stake" | "unstake" | "game";
  delta?: number;         // for points
  reason?: string | null; // e.g. game name or tournament
  tokenId?: string;
  at: any;                // Firestore Timestamp
};

/** Subscribe to XP */
export function subscribePoints(
  address: string,
  cb: (xp: number) => void
): Unsubscribe {
  if (!sharedDb || !address) {
    return () => {};
  }
  const ref = doc(sharedDb, "users", address.toLowerCase());
  return onSnapshot(ref, (snap) => {
    const data = (snap.data() as UserDoc) || {};
    cb(Number(data.xp ?? 0));
  });
}

/** Subscribe to last N activities (default 10) */
export function subscribeRecentActivity(
  address: string,
  cb: (items: Array<{ id: string } & ActivityDoc>) => void,
  limit = 10
): Unsubscribe {
  if (!sharedDb || !address) return () => {};
  const ref = collection(sharedDb, "users", address.toLowerCase(), "activity");
  const q = query(ref, orderBy("at", "desc"));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.slice(0, limit).map((d) => ({ id: d.id, ...(d.data() as ActivityDoc) }));
    cb(items);
  });
}

/** Server write helper used by webhook route (exported for reuse if needed) */
export async function addPointsServer({
  db = sharedDb!,
  address,
  delta,
  reason,
}: {
  db?: ReturnType<typeof getFirestore>;
  address: string;
  delta: number;
  reason?: string;
}) {
  const addr = address.toLowerCase();
  const userRef = doc(db, "users", addr);
  const activityRef = doc(collection(db, "users", addr, "activity"));

  // Increment XP + append activity
  await setDoc(
    userRef,
    { xp: increment(delta), updatedAt: serverTimestamp() },
    { merge: true }
  );

  await setDoc(activityRef, {
    type: "points",
    delta,
    reason: reason ?? null,
    at: serverTimestamp(),
  } as ActivityDoc);
}
