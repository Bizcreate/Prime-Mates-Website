"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { Menu, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "thirdweb/react";
import { client, chains } from "@/lib/thirdweb";
import { useCart } from "@/context/cart-context";

type NavItem = { href: string; label: string; exact?: boolean; twoLine?: boolean };

const NAV: NavItem[] = [
  { href: "/", label: "PMBC", exact: true },
  { href: "/nfts", label: "NFTS" },
  { href: "/gallery", label: "GALLERY" },
  { href: "/mint/pmbc", label: "MINT\nPMBC", twoLine: true },
  { href: "/mint/pttb", label: "MINT\nPTTB", twoLine: true },
  { href: "/dashboard", label: "DASHBOARD" },
  { href: "/community", label: "COMMUNITY" },
  { href: "/arcade", label: "GAMES\n&\nPRIME\nARCADE", twoLine: true },
  { href: "/merch", label: "MERCH" },
  { href: "/about", label: "ABOUT" },
  { href: "/contact", label: "CONTACT" },
];

function NavLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick?: () => void }) {
  // For desktop we show nice glow for active; for twoLine items we stack on lg.
  const labelDesktop = item.twoLine ? (
    <span className="hidden lg:block whitespace-pre leading-4 text-center">
      {item.label}
    </span>
  ) : (
    <span className="hidden lg:inline">{item.label.replace(/\n/g, " ")}</span>
  );

  const labelMobile = (
    <span className="lg:hidden">{item.label.replace(/\n/g, " ")}</span>
  );

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={[
        "rounded-md px-3 py-2 text-sm font-semibold tracking-wide transition",
        active
          ? "text-black bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.35)]"
          : "text-[#FFEAA0] hover:text-yellow-400 hover:bg-yellow-500/10",
      ].join(" ")}
    >
      {labelDesktop}
      {labelMobile}
    </Link>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { getTotalItems } = useCart();

  const cartCount = getTotalItems();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href) && href !== "/"
      ? true
      : pathname === href;

  const desktopNav = useMemo(
    () =>
      NAV.map((n) => (
        <NavLink key={n.href} item={n} active={isActive(n.href, n.exact)} />
      )),
    [pathname]
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-yellow-600/25 bg-[radial-gradient(ellipse_at_top,_rgba(0,0,0,0.9),_rgba(0,0,0,0.85))] backdrop-blur">
      {/* subtle gold underline glow */}
      <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-yellow-700/40 to-transparent" />

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* If you have a logo image, keep it here; otherwise this falls back to text */}
          <div className="relative h-8 w-8">
            <Image
              src="/logo.png"
              alt="PMBC"
              fill
              className="object-contain"
              onError={(e) => {
                (e.currentTarget as any).style.display = "none";
              }}
            />
          </div>
          <span className="sr-only">Prime Mates Board Club</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">{desktopNav}</nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Cart */}
          <Link
            href="/cart"
            className="relative rounded-md border border-yellow-600/30 px-3 py-2 text-sm text-[#FFEAA0] hover:bg-yellow-500/10"
            aria-label="Cart"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">Cart</span>
            </div>
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex min-w-[22px] items-center justify-center rounded-full bg-yellow-400 px-1.5 text-xs font-bold text-black shadow">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Connect Wallet */}
          <div className="hidden sm:block">
            <ConnectButton
              client={client}
              chains={chains}
              theme="dark"
              connectButton={{
                label: "Connect Wallet",
                className:
                  "rounded-lg bg-white text-black font-semibold px-4 py-2 hover:opacity-90",
              }}
            />
          </div>

          {/* Mobile toggles */}
          <Button
            variant="outline"
            className="border-yellow-600/40 text-[#FFEAA0] hover:bg-yellow-500/10 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-yellow-600/20 bg-black/95 lg:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-3">
            <div className="grid grid-cols-2 gap-2">
              {NAV.map((n) => (
                <NavLink
                  key={n.href}
                  item={n}
                  active={isActive(n.href, n.exact)}
                  onClick={() => setOpen(false)}
                />
              ))}
              {/* Connect in drawer */}
              <div className="col-span-2">
                <ConnectButton
                  client={client}
                  chains={chains}
                  theme="dark"
                  connectButton={{
                    label: "Connect Wallet",
                    className:
                      "w-full rounded-lg bg-white text-black font-semibold px-4 py-2 hover:opacity-90",
                  }}
                />
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* soft shadow under header like your screenshot */}
      <div className="h-[10px] w-full bg-[radial-gradient(ellipse_at_top,_rgba(234,179,8,0.25),_transparent_70%)]" />
    </header>
  );
}
