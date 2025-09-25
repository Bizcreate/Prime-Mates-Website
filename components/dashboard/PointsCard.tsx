"use client";
import { useEffect, useState } from "react";
import { subscribePoints } from "@/lib/points";

export function PointsCard({ address }: { address: string }) {
  const [points, setPoints] = useState<number | null>(null);
  useEffect(() => {
    if (!address) return;
    const unsub = subscribePoints(address, setPoints);
    return () => unsub();
  }, [address]);
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="text-sm opacity-80">Prime Arcade XP</div>
      <div className="text-3xl font-bold mt-1">{points ?? "—"}</div>
      <div className="text-xs opacity-60 mt-1">Earned across games.</div>
    </div>
  );
}
