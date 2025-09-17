"use client";

import { PropsWithChildren } from "react";
import { ThirdwebProvider } from "thirdweb/react";

/**
 * Minimal provider – the ConnectButton receives the client directly,
 * so we don't pass chains or clientId here.
 */
export default function Web3Provider({ children }: PropsWithChildren) {
  return <ThirdwebProvider>{children}</ThirdwebProvider>;
}