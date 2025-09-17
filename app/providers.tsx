"use client";

import { PropsWithChildren } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Web3Provider from "@/packages/prime-shared/providers/Web3Provider";
import { CartProvider } from "@/context/cart-context";

export default function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <Web3Provider>
        <CartProvider>{children}</CartProvider>
      </Web3Provider>
    </ThemeProvider>
  );
}
