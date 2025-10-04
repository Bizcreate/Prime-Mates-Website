"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useActiveWalletChain, useSwitchActiveWalletChain } from "thirdweb/react";
import { ethereum, polygon } from "thirdweb/chains";

type Props = {
  /** Allowed chain IDs. Defaults to Ethereum + Polygon. */
  allowedChainIds?: number[];
  /** If true, show guard even when no wallet is connected. */
  requireConnected?: boolean;
  children?: ReactNode;
};

export default function ChainGuard({
  allowedChainIds = [ethereum.id, polygon.id], // 1, 137
  requireConnected = false,
  children,
}: Props) {
  const chain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();

  // No wallet connected
  if (!chain) {
    if (!requireConnected) return <>{children}</>;
    return (
      <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 text-yellow-200">
        Connect your wallet to continue.
      </div>
    );
  }

  const isAllowed = allowedChainIds.includes(chain.id);

  if (!isAllowed) {
    return (
      <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 text-yellow-100">
        <div className="mb-2 font-semibold">Wrong network</div>
        <div className="mb-4 text-sm opacity-90">
          You are on <span className="font-mono">{chain.name ?? chain.id}</span>.  
          Please switch to Ethereum or Polygon.
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => switchChain(ethereum)}
            className="bg-yellow-500 text-black hover:bg-yellow-400"
            size="sm"
          >
            Switch to Ethereum
          </Button>
          <Button
            onClick={() => switchChain(polygon)}
            variant="outline"
            size="sm"
            className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
          >
            Switch to Polygon
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
