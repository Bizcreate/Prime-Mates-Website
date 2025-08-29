"use client";

import React, { createContext, useContext, type ReactNode, useMemo } from "react";
import { ThirdwebProvider, ConnectButton, useActiveAccount, useReadContract, darkTheme } from "thirdweb/react";
import { getContract } from "thirdweb";
import { createWallet, walletConnect } from "thirdweb/wallets";
import { balanceOf } from "thirdweb/extensions/erc721";

import { client } from "@/lib/thirdweb-client";
import { COLLECTION_CONTRACTS } from "@/lib/thirdweb-config";

type Ctx = { address: string | undefined; isConnected: boolean };
const ThirdwebWalletContext = createContext<Ctx>({ address: undefined, isConnected: false });

export function ThirdwebWalletProvider({ children }: { children: ReactNode }) {
  // NOTE: give the provider the clientId so hooks & UI share the same client under the hood
  return (
    <ThirdwebProvider clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}>
      <WalletContextProvider>{children}</WalletContextProvider>
    </ThirdwebProvider>
  );
}

function WalletContextProvider({ children }: { children: ReactNode }) {
  const account = useActiveAccount();
  const address = account?.address;
  const isConnected = !!address;

  return (
    <ThirdwebWalletContext.Provider value={{ address, isConnected }}>
      {children}
    </ThirdwebWalletContext.Provider>
  );
}

export const useThirdwebWallet = () => useContext(ThirdwebWalletContext);

// ----- Wallets list (Telegram-aware) -----
function useWalletsForEnv() {
  // SSR-safe check for Telegram mini app
  const inTelegram =
    typeof window !== "undefined" && (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

  return useMemo(() => {
    if (inTelegram) {
      return [
        walletConnect({
          qrcode: false,
          mobile: {
            getUri: (uri) => `https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}`,
          },
        }),
        createWallet("io.metamask"),
      ];
    }
    return [
      createWallet("io.metamask"),
      createWallet("com.coinbase.wallet"),
      createWallet("app.phantom"),
      createWallet("me.rainbow"),
      createWallet("com.trustwallet.app"),
    ];
  }, [inTelegram]);
}

// ----- Hook to fetch user NFTs (kept as-is, just imports `client`) -----
export function useUserNFTs() {
  const { address, isConnected } = useThirdwebWallet();

  const pmbcContract = getContract({
    client,
    chain: COLLECTION_CONTRACTS["prime-mates-board-club"].chain,
    address: COLLECTION_CONTRACTS["prime-mates-board-club"].address,
  });

  const pttbContract = getContract({
    client,
    chain: COLLECTION_CONTRACTS["prime-to-the-bone"].chain,
    address: COLLECTION_CONTRACTS["prime-to-the-bone"].address,
  });

  const halloweenContract = getContract({
    client,
    chain: COLLECTION_CONTRACTS["prime-halloween"].chain,
    address: COLLECTION_CONTRACTS["prime-halloween"].address,
  });

  const christmasContract = getContract({
    client,
    chain: COLLECTION_CONTRACTS["prime-christmas"].chain,
    address: COLLECTION_CONTRACTS["prime-christmas"].address,
  });

  const { data: pmbcBalance } = useReadContract(balanceOf, {
    contract: pmbcContract,
    owner: address || "",
    queryOptions: { enabled: !!address },
  });
  const { data: pttbBalance } = useReadContract(balanceOf, {
    contract: pttbContract,
    owner: address || "",
    queryOptions: { enabled: !!address },
  });
  const { data: halloweenBalance } = useReadContract(balanceOf, {
    contract: halloweenContract,
    owner: address || "",
    queryOptions: { enabled: !!address },
  });
  const { data: christmasBalance } = useReadContract(balanceOf, {
    contract: christmasContract,
    owner: address || "",
    queryOptions: { enabled: !!address },
  });

  const totalNFTs =
    Number(pmbcBalance || 0) +
    Number(pttbBalance || 0) +
    Number(halloweenBalance || 0) +
    Number(christmasBalance || 0);

  return {
    totalNFTs,
    isConnected,
    collections: {
      pmbc: Number(pmbcBalance || 0),
      pttb: Number(pttbBalance || 0),
      halloween: Number(halloweenBalance || 0),
      christmas: Number(christmasBalance || 0),
    },
  };
}

// ----- Universal Connect button (themed + Telegram-aware wallets) -----
export function UniversalConnectWallet({ className }: { className?: string }) {
  const wallets = useWalletsForEnv();

  return (
    <ConnectButton
      client={client}
      wallets={wallets}
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
      connectButton={{
        label: "Connect Wallet",
        style: {
          backgroundColor: "#F59E0B",
          color: "#000",
          border: "none",
          borderRadius: "8px",
          padding: "12px 24px",
          fontWeight: 600,
        },
      }}
      className={className}
    />
  );
}
