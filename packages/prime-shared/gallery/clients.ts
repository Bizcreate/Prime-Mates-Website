"use client";

import { db, auth } from "@/packages/prime-shared/firebase/client";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import type { GalleryItem } from "./types";

/** Read latest gallery items (public) */
export async function listGalleryItems(max = 100): Promise<GalleryItem[]> {
  try {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"), limit(max));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  } catch (e) {
    console.error("[gallery] listGalleryItems error", e);
    return [];
  }
}

/** Upload an image + create a gallery doc (requires Firebase auth – anon is fine if your rules allow) */
export async function uploadGalleryImage(file: File, title: string, tags: string[] = []): Promise<GalleryItem> {
  const user = auth.currentUser || undefined;

  const storage = getStorage();
  const ts = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]+/g, "-");
  const path = `gallery/${user?.uid || "anon"}/${ts}-${safeName}`;
  const storageRef = ref(storage, path);

  // upload
  await uploadBytesResumable(storageRef, file, { contentType: file.type });
  const url = await getDownloadURL(storageRef);

  // firestore doc
  const payload = {
    title: title || safeName,
    url,
    path,
    authorUid: user?.uid,
    tags,
    createdAt: ts,
    createdAtServer: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "gallery"), payload);
  return { id: docRef.id, ...(payload as any) };
}
