"use client";
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";

export function WalletBar() {
  const account = useActiveAccount();
  const chain = useActiveWalletChain();
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 px-4 py-3">
      <div className="text-sm">
        <div className="opacity-70">Wallet</div>
        <div className="font-mono">
          {account?.address ? `${account.address.slice(0,6)}…${account.address.slice(-4)}` : "Not connected"}
        </div>
      </div>
      <div className="text-right text-sm">
        <div className="opacity-70">Network</div>
        <div>{chain?.name ?? "—"}</div>
      </div>
    </div>
  );
}
