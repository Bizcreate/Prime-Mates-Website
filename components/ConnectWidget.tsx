// components/ConnectWidget.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  ConnectButton,
  useActiveAccount,
  useDisconnect,
} from "thirdweb/react";
import { createWallet, walletConnect } from "thirdweb/wallets";
import { ethereum, polygon } from "thirdweb/chains";
import { thirdwebClient } from "@/packages/prime-shared/thirdweb/client";

function isMobileLike() {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return /android|iphone|ipad|ipod|mobile/i.test(ua);
}

export default function ConnectWidget() {
  const account = useActiveAccount();
  const { disconnect } = useDisconnect();
  const [err, setErr] = useState<string | null>(null);

  const wallets = useMemo(() => {
    // Always offer WalletConnect
    const wc = walletConnect();

    // Prefer a specific injected wallet if present (MetaMask / Coinbase)
    const mm = createWallet("io.metamask");
    const cb = createWallet("com.coinbase.wallet");
    const injectedGeneric = createWallet("injected");

    // On mobile: primary = WalletConnect (most reliable)
    if (isMobileLike()) {
      return [wc, mm, cb, injectedGeneric];
    }
    // On desktop: try injected first, then WC
    return [mm, cb, injectedGeneric, wc];
  }, []);

  const chains = [ethereum, polygon];

  return (
    <div className="inline-flex items-center gap-3">
      <ConnectButton
        client={thirdwebClient}
        wallets={wallets}
        chains={chains}
        theme={"dark"}
        // Called whenever a connection error occurs; turn cryptic {} into readable text
        onError={(e) => {
          // e may be {} or a string or an Error, normalize:
          let msg = "Failed to connect wallet.";
          if (typeof e === "string") msg = e;
          else if (e && typeof (e as any).message === "string") msg = (e as any).message;
          setErr(msg);
          // Also log the raw thing for debugging:
          // eslint-disable-next-line no-console
          console.error("[wallet connect error]", e);
        }}
        connectButton={{
          label: "Connect Wallet",
        }}
        autoConnect={false}
        // Small UI tweaks (optional)
        showAllWallets={true}
      />

      {account ? (
        <Button
          size="sm"
          variant="outline"
          className="border-gray-700 text-gray-300"
          onClick={() => {
            setErr(null);
            disconnect();
          }}
        >
          Disconnect
        </Button>
      ) : null}

      {err ? (
        <span className="text-xs text-red-400">{err}</span>
      ) : null}
    </div>
  );
}
