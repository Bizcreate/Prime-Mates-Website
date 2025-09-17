import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { Navigation } from "@/components/navigation";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Prime Mates Board Club",
  description: "Official website for Prime Mates Board Club",
  generator: "v0.app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Navigation />
          <div className="pt-20">{children}</div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
