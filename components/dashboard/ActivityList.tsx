"use client";
import { useEffect, useState } from "react";
import { subscribeRecentActivity } from "@/lib/points";

export function ActivityList({ address }: { address: string }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    if (!address) return;
    const unsub = subscribeRecentActivity(address, setItems);
    return () => unsub();
  }, [address]);

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="font-semibold mb-3">Recent Activity</div>
      {items.length === 0 ? (
        <div className="text-sm opacity-60">No activity yet.</div>
      ) : (
        <div className="space-y-2 text-sm">
          {items.map((it) => (
            <div key={it.id} className="flex justify-between">
              <span>
                {it.type === "points" && <>+{it.delta} pts {it.reason && `(${it.reason})`}</>}
                {it.type === "stake" && <>Staked token #{it.tokenId}</>}
                {it.type === "unstake" && <>Unstaked token #{it.tokenId}</>}
              </span>
              <span className="opacity-60">
                {it.at?.toDate?.().toLocaleString?.() ?? ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
