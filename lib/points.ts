"use client";

import { db } from "./firebase";
import {
  doc, setDoc, updateDoc, increment, serverTimestamp, onSnapshot,
  collection, addDoc, getDoc, query, orderBy, limit
} from "firebase/firestore";

export function userDoc(address: string) {
  return doc(db, "users", address.toLowerCase());
}
export function pointsDoc(address: string) {
  return doc(db, "users", address.toLowerCase(), "stats", "points");
}
export function activityCol(address: string) {
  return collection(db, "users", address.toLowerCase(), "activity");
}

export async function ensureUser(address: string) {
  const u = userDoc(address);
  const snap = await getDoc(u);
  if (!snap.exists()) {
    await setDoc(u, { address: address.toLowerCase(), createdAt: serverTimestamp() });
    await setDoc(pointsDoc(address), { value: 0, updatedAt: serverTimestamp() });
  }
}

export function subscribePoints(address: string, cb: (value: number) => void) {
  return onSnapshot(pointsDoc(address), (snap) => {
    const val = (snap.exists() ? (snap.data().value as number) : 0) || 0;
    cb(val);
  });
}

export function subscribeRecentActivity(address: string, cb: (rows: any[]) => void) {
  const q = query(activityCol(address), orderBy("at", "desc"), limit(10));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function logActivity(address: string, row: Record<string, any>) {
  await addDoc(activityCol(address), { ...row, at: serverTimestamp() });
}

export async function addPoints(address: string, delta: number, reason = "game") {
  await ensureUser(address);
  await updateDoc(pointsDoc(address), { value: increment(delta), updatedAt: serverTimestamp() });
  await logActivity(address, { type: "points", delta, reason });
}
