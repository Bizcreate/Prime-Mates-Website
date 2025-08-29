"use client";
import React, { useEffect, useState } from "react";
import { createThirdwebClient } from "thirdweb";
import { ThirdwebProvider, ConnectButton, useActiveAccount, useWalletBalance } from "thirdweb/react";
import { darkTheme } from "thirdweb/react";
import { createWallet, walletConnect } from "thirdweb/wallets";
import { ethereum } from "thirdweb/chains";
import { TonConnectButton } from "@tonconnect/ui-react";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

function WalletInner() {
  const [walletsToUse, setWalletsToUse] = useState<any[]>([]);
  const account = useActiveAccount();
  const { data: balance } = useWalletBalance(
    account ? { client, chain: ethereum, address: account.address } : undefined
  );

  useEffect(() => {
    const inTelegram =
      typeof window !== "undefined" && (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
    if (inTelegram) {
      setWalletsToUse([
        walletConnect({
          qrcode: false,
          mobile: { getUri: (uri) => `https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}` },
        }),
        createWallet("io.metamask"),
      ]);
    } else {
      setWalletsToUse([
        createWallet("io.metamask"),
        createWallet("com.coinbase.wallet"),
        createWallet("app.phantom"),
        createWallet("me.rainbow"),
        createWallet("com.trustwallet.app"),
      ]);
    }
  }, []);

  return (
    <div>
      <ConnectButton
        client={client}
        wallets={walletsToUse}
        theme={darkTheme({
          colors: {
            modalBg: "#000000",
            primaryButtonBg: "#FBC535",
            primaryButtonText: "#000000",
            secondaryButtonBg: "#333333",
            secondaryButtonText: "#ffffff",
          },
        })}
        connectModal={{ size: "compact" }}
      />
      <div style={{ marginTop: 20 }}>
        <TonConnectButton />
      </div>
      {/* Optional: show EVM balance */}
      {/* <div>{balance ? `${balance.value} ${balance.symbol}` : ""}</div> */}
    </div>
  );
}

export default function ThirdWebWallet() {
  return (
    <ThirdwebProvider clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}>
      <WalletInner />
    </ThirdwebProvider>
  );
}
