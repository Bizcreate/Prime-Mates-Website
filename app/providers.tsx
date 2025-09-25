"use client";

import { ReactNode } from "react";
import { ThirdwebProvider } from "thirdweb/react";
import { client, supportedChains, wallets } from "@/lib/thirdweb";
import { CartProvider } from "@/context/cart-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider client={client} supportedChains={supportedChains} wallets={wallets}>
      <QueryClientProvider client={queryClient}>
        <CartProvider>{children}</CartProvider>
      </QueryClientProvider>
    </ThirdwebProvider>
  );
}
