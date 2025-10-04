// /components/member-dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { WalletBar } from "./dashboard/WalletBar";
import { PointsCard } from "./dashboard/PointsCard";
import { ActivityList } from "./dashboard/ActivityList";
import ChainGuard from "@/components/chain-guard";
import { NFTGrid } from "./dashboard/NFTGrid";


export function MemberDashboard() {
  const account = useActiveAccount();

  // debounce/settle the address so children never see ""
  const [owner, setOwner] = useState<string | null>(null);
  useEffect(() => {
    setOwner(account?.address ?? null);
  }, [account?.address]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <WalletBar />
      <ChainGuard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PointsCard address={owner ?? ""} />
        <ActivityList address={owner ?? ""} />
      </div>

      {owner === null ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 text-center text-sm text-gray-300">
          Checking wallet…
        </div>
      ) : owner ? (
        <NFTGrid owner={owner} />
      ) : (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 text-center text-sm text-gray-300">
          Connect your wallet to view your NFTs.
        </div>
      )}
    </div>
  );
}
