// app/layout.tsx
import "./globals.css";
import Providers from "./providers";
import SiteHeader from "@/components/site-header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
