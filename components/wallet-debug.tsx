"use client";

import { useActiveAccount, useActiveWallet, useChain } from "thirdweb/react";

export default function WalletDebug() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { chain } = useChain();

  if (process.env.NEXT_PUBLIC_DEBUG_WALLET !== "1") return null;

  return (
    <pre className="text-xs p-3 bg-gray-950 border border-gray-800 rounded-lg overflow-auto">
      {JSON.stringify(
        {
          connected: Boolean(account),
          address: account?.address,
          walletType: wallet?.id,
          chainId: chain?.id,
          chainName: chain?.name,
        },
        null,
        2
      )}
    </pre>
  );
}
