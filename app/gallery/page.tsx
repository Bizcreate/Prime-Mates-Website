"use client";

// File: app/gallery/page.tsx
// Full gallery page with Collections, My Collection, Gesture Studio, and Banners + Wallpapers.
// - Uses assets from /public/banners/* and /public/wallpaper/*
// - Gestures from /public/gestures/{hands,boards,clothes,mask} (case-sensitive)
// - Preview remove-bg processing + export
// - PFP circle clip
// - Decor/Logos pickers from /public/decor and /public/logos
// - Mobile-friendly downloads (Web Share API + fallbacks)

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as Lucide from "lucide-react";
import {
  Search,
  ExternalLink,
  Loader2,
  RefreshCw,
  Download,
  Share,
  Palette,
  Wand2,
  AlertCircle,
  Upload,
  Brush,
  Square,
  Circle as CircleIcon,
  Layers,
  Copy,
  Trash2,
} from "lucide-react";

// Works with any lucide version: use whatever exists
const EyeDropperIcon =
  // newest packages
  // @ts-ignore
  (Lucide as any).Pipette ??
  // some versions
  // @ts-ignore
  (Lucide as any).EyeDropper ??
  // fallback if neither exists
  // @ts-ignore
  (Lucide as any).Droplet;

import { useActiveAccount } from "thirdweb/react";
import { Insight } from "thirdweb";
import { ethereum, polygon } from "thirdweb/chains";
import { thirdwebClient } from "@/packages/prime-shared/thirdweb/client";

// Safe wrapper for ConnectWidget (handles default vs named export)
import * as ConnectWidgetModule from "@/components/ConnectWidget";
const ConnectWidget = () => {
  const Comp = (ConnectWidgetModule as any).ConnectWidget || (ConnectWidgetModule as any).default;
  if (!Comp) return null;
  return <Comp />;
};

/* ------------------------------------------------------------------ */
/* Collections setup                                                   */
/* ------------------------------------------------------------------ */

const collections = [
  { name: "Prime Mates Board Club", address: "0x12662b6a2a424a0090b7d09401fb775a9b968898", totalSupply: 2222, theme: "gold", chainId: 1 },
  { name: "Prime To The Bone",      address: "0x72bcde3c41c4afa153f8e7849a9cf64e2cc84e75", totalSupply: 999,  theme: "red",  chainId: 137 },
  { name: "Prime Halloween",        address: "0x46d5dcd9d8a9ca46e7972f53d584e14845968cf8", totalSupply: 666,  theme: "orange", chainId: 1 },
  { name: "Prime Mates Christmas Club", address: "0xab9f149a82c6ad66c3795fbceb06ec351b13cfcf", totalSupply: 1111, theme: "green", chainId: 137 },
] as const;

interface NFTData {
  tokenId: string;
  name: string;
  image: string;
  description?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
  owner?: string | null;
  collection?: string;
  tokenAddress?: string;
  chainId?: number;
}

const IPFS_GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://nftstorage.link/ipfs/",
];
function ipfsToHttp(url?: string): string | undefined {
  if (!url) return undefined;
  if (!url.startsWith("ipfs://")) return url;
  const rest = url.replace("ipfs://", "");
  return `${IPFS_GATEWAYS[0]}${rest}`;
}
function pickImage(meta: any): string {
  return (
    ipfsToHttp(meta?.image) ||
    ipfsToHttp(meta?.image_url) ||
    ipfsToHttp(meta?.imageURI) ||
    ipfsToHttp(meta?.animation_url) ||
    "/prime-mates-nft.jpg"
  );
}
function chainFromId(id: number) {
  return id === 1 ? ethereum : polygon;
}
function openSeaUrl(chainId: number, contract: string, tokenId: string | number) {
  const base = chainId === 1 ? "ethereum" : "matic";
  return `https://opensea.io/assets/${base}/${contract}/${tokenId}`;
}
function themeGradient(theme: string) {
  switch (theme) {
    case "gold":   return "from-yellow-500 to-yellow-600";
    case "red":    return "from-red-500 to-red-600";
    case "orange": return "from-orange-500 to-orange-600";
    case "green":  return "from-green-500 to-green-600";
    default:       return "from-yellow-500 to-yellow-600";
  }
}

/* ------------------------------------------------------------------ */
/* Banners + Wallpapers helpers                                        */
/* ------------------------------------------------------------------ */

type BannerTemplate = "twitter" | "phone" | "pfp";
const TEMPLATES: Record<BannerTemplate, { w: number; h: number; label: string }> = {
  twitter: { w: 1500, h: 500,  label: "Twitter Banner (1500×500)" },
  phone:   { w: 1080, h: 1920, label: "Phone Background (1080×1920)" },
  pfp:     { w: 1024, h: 1024, label: "PFP (1024×1024)" },
};

// Real banner assets from /public/banners (case-sensitive)
const BANNER_FILES: string[] = [
  "/banners/Amature.png",
  "/banners/Blue+Gold.png",
  "/banners/champion.png",
  "/banners/Gold.png",
  "/banners/Green.png",
  "/banners/Grom.png",
  "/banners/Holder.png",
  "/banners/Pink.png",
  "/banners/pro.png",
  "/banners/Red.png",
  "/banners/Skatepark.png",
];

// Real phone wallpapers from /public/wallpaper (case-sensitive)
const PHONE_FILES: string[] = [
  "/wallpaper/Avocado.jpg",
  "/wallpaper/Banana-Fade.jpg",
  "/wallpaper/Bone.jpg",
  "/wallpaper/Citrus.jpg",
  "/wallpaper/Coral.jpg",
  "/wallpaper/Deep-Ocean.jpg",
  "/wallpaper/Grape-Drank.jpg",
  "/wallpaper/Grass.jpg",
  "/wallpaper/Grimace.jpg",
  "/wallpaper/Hubba-Bubba.jpg",
  "/wallpaper/Latte.jpg",
  "/wallpaper/Mellow-Yellow.jpg",
  "/wallpaper/Miami-Sunset.jpg",
  "/wallpaper/Mint.jpg",
  "/wallpaper/Mist.jpg",
  "/wallpaper/Mocca.jpg",
  "/wallpaper/Ocean-Sunrise.jpg",
  "/wallpaper/Ocean.jpg",
  "/wallpaper/Pink-Panther.jpg",
  "/wallpaper/Popsickle.jpg",
  "/wallpaper/Powder-Blue.jpg",
  "/wallpaper/Royal-Velvet.jpg",
  "/wallpaper/Sky.jpg",
  "/wallpaper/Soft-Pink.jpg",
  "/wallpaper/Stone.jpg",
  "/wallpaper/Summer-Sunset.jpg",
  "/wallpaper/Sunburn.jpg",
  "/wallpaper/Tangerine.jpg",
  "/wallpaper/Tequila-Sunrise.jpg",
  "/wallpaper/Terracotta.jpg",
];

// Decor / Logos (drop files into /public/decor and /public/logos)
const DECOR_FILES: { name: string; src: string }[] = [
  { name: "PM Star", src: "/decor/pm-star.png" },
  { name: "Lightning", src: "/decor/lightning.png" },
  { name: "Sticker A", src: "/decor/sticker-a.png" },
];

const LOGO_FILES: { name: string; src: string }[] = [
  { name: "PM Logo Light", src: "/logos/pm-logo-light.png" },
  { name: "PM Logo Dark",  src: "/logos/pm-logo-dark.png" },
  { name: "Skull Mark",    src: "/logos/skull-mark.png" },
];

// Overlays (Banners + Wallpapers)

type Overlay = {
  id: string;
  src: string;          // original src (unchanged)
  name?: string;
  x: number;
  y: number;
  scale: number;     // fraction of canvas height (0..1)
  rotation: number;  // degrees
  removeBg?: {
    enabled: boolean;
    colors?: string[];  // multi-key palette
    color?: string;     // single key (back-compat)
    tol: number;        // 0-100
    soft: number;       // 0-100
    protectDark: boolean;
  };
  // preview/edited cache
  srcProcessed?: string; // auto processed (single or multi key)
  srcEdited?: string;    // manual brushed result
  _procKey?: string;     // cache key for srcProcessed
};

type GestureOverlay = {
  id: string;
  name: string;
  image: string;
  category: "hands" | "clothes" | "boards" | "mask";
  boardKind?: "skate" | "snow" | "surf" | "any";
};

// ------- Mobile-friendly PNG saving helpers -------
function dataURLToBlob(dataURL: string): Blob {
  const [header, base64] = dataURL.split(",");
  const mime = /data:(.*?);base64/.exec(header)?.[1] || "image/png";
  const bin = atob(base64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

async function blobFromCanvas(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
  });
}

async function tryShareBlobPNG(blob: Blob, filename: string): Promise<boolean> {
  try {
    const file = new File([blob], filename, { type: "image/png" });
    // @ts-ignore
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: filename, text: "" });
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

function tryDownloadBlobPNG(blob: Blob, filename: string): boolean {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    return true;
  } catch {
    return false;
  }
}

function openBlobInNewTab(blob: Blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

async function savePNGFromCanvasMobileFriendly(canvas: HTMLCanvasElement, filename: string) {
  const blob = await blobFromCanvas(canvas);
  if (await tryShareBlobPNG(blob, filename)) return;
  if (tryDownloadBlobPNG(blob, filename)) return;
  openBlobInNewTab(blob);
}

async function savePNGFromDataURLMobileFriendly(dataURL: string, filename: string) {
  const blob = dataURLToBlob(dataURL);
  if (await tryShareBlobPNG(blob, filename)) return;
  if (tryDownloadBlobPNG(blob, filename)) return;
  openBlobInNewTab(blob);
}

/* ------------------------------------------------------------------ */
/* Gesture overlays                                                    */
/* ------------------------------------------------------------------ */

const GESTURE_OVERLAYS: GestureOverlay[] = [
  // ---------------- Hands (exact case) ----------------
  { id: "hand-gm-coffee",       name: "GM Coffee",          image: "/gestures/hands/gm-coffee.png",        category: "hands" },
  { id: "hand-middle-finger",   name: "Middle Finger",      image: "/gestures/hands/MiddleFinger.png",     category: "hands" },
  { id: "hand-phone",           name: "Phone Hand",         image: "/gestures/hands/PhoneHand.png",        category: "hands" },
  { id: "hand-phone-gesture",   name: "Phone Hand Gesture", image: "/gestures/hands/PhoneHandGesture.png", category: "hands" },
  { id: "hand-shaka",           name: "Shaka",              image: "/gestures/hands/ShakaHand.png",        category: "hands" },
  { id: "hand-skatewheel",      name: "Skate Wheel",        image: "/gestures/hands/Skatewheel.png",       category: "hands" },
  { id: "hand-surfwax",         name: "Surfwax",            image: "/gestures/hands/Surfwax.png",          category: "hands" },
  { id: "hand-thumbs-up",       name: "Thumbs Up",          image: "/gestures/hands/ThumbsUp.png",         category: "hands" },
  { id: "hand-waxsurf",         name: "Waxsurf",            image: "/gestures/hands/Waxsurf.png",          category: "hands" },

  // ---------------- Boards ----------------
  { id: "board-0",  name: "Board",    image: "/gestures/boards/Board.png",  category: "boards" },
  { id: "board-1",  name: "Board 1",  image: "/gestures/boards/Board1.png", category: "boards" },
  { id: "board-2",  name: "Board 2",  image: "/gestures/boards/Board2.png", category: "boards" },
  { id: "board-3",  name: "Board 3",  image: "/gestures/boards/Board3.png", category: "boards" },
  { id: "board-4",  name: "Board 4",  image: "/gestures/boards/Board4.png", category: "boards" },
  { id: "board-5",  name: "Board 5",  image: "/gestures/boards/Board5.png", category: "boards" },
  { id: "board-6",  name: "Board 6",  image: "/gestures/boards/Board6.png", category: "boards" },
  { id: "board-7",  name: "Board 7",  image: "/gestures/boards/Board7.png", category: "boards" },
  { id: "board-8",  name: "Board 8",  image: "/gestures/boards/Board8.png", category: "boards" },
  { id: "board-9",  name: "Board 9",  image: "/gestures/boards/Board9.png", category: "boards" },
  { id: "board-10", name: "Board 10", image: "/gestures/boards/Board10.png", category: "boards" },
  { id: "board-11", name: "Board 11", image: "/gestures/boards/Board11.png", category: "boards" },
  { id: "board-12", name: "Board 12", image: "/gestures/boards/Board12.png", category: "boards" },
  { id: "board-13", name: "Board 13", image: "/gestures/boards/Board13.png", category: "boards" },
  { id: "board-14", name: "Board 14", image: "/gestures/boards/Board14.png", category: "boards" },
  { id: "board-15", name: "Board 15", image: "/gestures/boards/Board15.png", category: "boards" },
  { id: "board-16", name: "Board 16", image: "/gestures/boards/Board16.png", category: "boards" },
  { id: "board-17", name: "Board 17", image: "/gestures/boards/Board17.png", category: "boards" },
  { id: "board-18", name: "Board 18", image: "/gestures/boards/Board18.png", category: "boards" },
  { id: "board-19", name: "Board 19", image: "/gestures/boards/Board19.png", category: "boards" },

  // ---------------- Clothes ----------------
  { id: "clo-blacktee2",  name: "Black Tee 2",   image: "/gestures/clothes/blacktee2.png",   category: "clothes" },
  { id: "clo-blacktee3",  name: "Black Tee 3",   image: "/gestures/clothes/blacktee3.png",   category: "clothes" },
  { id: "clo-blacktee4",  name: "Black Tee 4",   image: "/gestures/clothes/blacktee4.png",   category: "clothes" },
  { id: "clo-blacktee5",  name: "Black Tee 5",   image: "/gestures/clothes/blacktee5.png",   category: "clothes" },
  { id: "clo-blacktee6",  name: "Black Tee 6",   image: "/gestures/clothes/blacktee6.png",   category: "clothes" },
  { id: "clo-blacktee7",  name: "Black Tee 7",   image: "/gestures/clothes/blacktee7.png",   category: "clothes" },
  { id: "clo-harlequin",  name: "Harlequin",     image: "/gestures/clothes/harlequin.png",   category: "clothes" },
  { id: "clo-holetee",    name: "Hole Tee",      image: "/gestures/clothes/holetee.png",     category: "clothes" },
  { id: "clo-holetee2",   name: "Hole Tee 2",    image: "/gestures/clothes/holetee2.png",    category: "clothes" },
  { id: "clo-holetee3",   name: "Hole Tee 3",    image: "/gestures/clothes/holetee3.png",    category: "clothes" },
  { id: "clo-orangehood", name: "Orange Hoodie", image: "/gestures/clothes/orangehoodie.png",category: "clothes" },
  { id: "clo-oranget1",   name: "Orange Tee 1",  image: "/gestures/clothes/orangetee1.png",  category: "clothes" },
  { id: "clo-oranget2",   name: "Orange Tee 2",  image: "/gestures/clothes/orangetee2.png",  category: "clothes" },
  { id: "clo-oranget3",   name: "Orange Tee 3",  image: "/gestures/clothes/orangetee3.png",  category: "clothes" },
  { id: "clo-oranget4",   name: "Orange Tee 4",  image: "/gestures/clothes/orangetee4.png",  category: "clothes" },
  { id: "clo-pinktee1",   name: "Pink Tee 1",    image: "/gestures/clothes/pinktee1.png",    category: "clothes" },
  { id: "clo-pinktee2",   name: "Pink Tee 2",    image: "/gestures/clothes/pinktee2.png",    category: "clothes" },
  { id: "clo-xray",       name: "X-Ray",         image: "/gestures/clothes/x-ray.png",       category: "clothes" },

  // ---------------- Masks (no whitelist; paths moved to /gestures/mask) ----------------
  { id: "col-batdad",      name: "Batdad",       image: "/gestures/mask/Batdad.PNG",        category: "mask" },
  { id: "col-clown",       name: "Clown",        image: "/gestures/mask/Clown.PNG",         category: "mask" },
  { id: "col-dracula",     name: "Dracula",      image: "/gestures/mask/Dracula.png",       category: "mask" },
  { id: "col-hannibal",    name: "Hannibal",     image: "/gestures/mask/Hannibal.PNG",      category: "mask" },
  { id: "col-harley",      name: "Harley Quinn", image: "/gestures/mask/Harley_quinn.png",  category: "mask" },
  { id: "col-jason",       name: "Jason",        image: "/gestures/mask/Jason.PNG",         category: "mask" },
  { id: "col-michael",     name: "Michael",      image: "/gestures/mask/Michael.PNG",       category: "mask" },
  { id: "col-pennywise",   name: "Pennywise",    image: "/gestures/mask/Pennywise.png",     category: "mask" },
];

function detectBoardKind(nft?: NFTData): GestureOverlay["boardKind"] | undefined {
  if (!nft?.attributes?.length) return undefined;
  const str = nft.attributes.map(a => `${a.trait_type ?? ""}:${a.value ?? ""}`.toLowerCase()).join(" | ");
  if (/skate/.test(str)) return "skate";
  if (/snow/.test(str))  return "snow";
  if (/surf/.test(str))  return "surf";
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Mini mask editor                                                    */
/* ------------------------------------------------------------------ */

function MaskCanvas({
  url,
  origUrl,
  size = 512,
  brush = 24,
  mode = "erase",
  onChange,
}: {
  url: string;
  origUrl: string;
  size?: number;
  brush?: number;
  mode?: "erase" | "restore";
  onChange: (nextUrl: string) => void;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const origRef = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    setReady(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      const orig = new Image();
      orig.crossOrigin = "anonymous";
      orig.onload = () => {
        origRef.current = orig;
        setReady(true);
      };
      orig.src = encodeURI(origUrl);
    };
    img.src = encodeURI(url);
  }, [url, origUrl]);

  useEffect(() => {
    if (!ready || !ref.current || !imgRef.current) return;
    const cnv = ref.current;
    const ctx = cnv.getContext("2d")!;
    const img = imgRef.current!;
    cnv.width = size; cnv.height = size;
    ctx.clearRect(0,0,cnv.width,cnv.height);
    const scale = Math.min(cnv.width / img.width, cnv.height / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (cnv.width - w) / 2;
    const y = (cnv.height - h) / 2;
    ctx.drawImage(img, x, y, w, h);
  }, [ready, size, url]);

  function drawAt(x: number, y: number) {
    if (!ref.current || !imgRef.current) return;
    const cnv = ref.current;
    const ctx = cnv.getContext("2d")!;
    const img = imgRef.current!;
    const orig = origRef.current!;

    const scale = Math.min(cnv.width / img.width, cnv.height / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x0 = (cnv.width - w) / 2;
    const y0 = (cnv.height - h) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, brush / 2, 0, Math.PI * 2);
    ctx.closePath();

    if (mode === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();
    } else {
      ctx.clip();
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(orig, x0, y0, w, h);
    }
    ctx.restore();

    onChange(cnv.toDataURL("image/png"));
  }

  function handlePointer(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    drawAt(x, y);
  }

  return (
    <div className="relative">
      <canvas
        ref={ref}
        className="w-full max-w-[512px] border border-gray-800 rounded-md touch-none"
        onPointerDown={(e) => { setDrag(true); handlePointer(e); }}
        onPointerMove={(e) => { if (drag) handlePointer(e); }}
        onPointerUp={() => setDrag(false)}
        onPointerLeave={() => setDrag(false)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function GalleryPage() {
  const account = useActiveAccount();
  const walletAddress = account?.address;
  const isConnected = !!account;

  const [activeTab, setActiveTab] = useState("collections");

  // Collections tab state
  const [selectedCollection, setSelectedCollection] = useState<(typeof collections)[number]>(collections[0]);
  const [searchTokenId, setSearchTokenId] = useState("");
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [searchedNFT, setSearchedNFT] = useState<NFTData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 12;

  // My collection
  const [userNFTs, setUserNFTs] = useState<NFTData[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);

  // Gesture Studio
  const [selectedNFT, setSelectedNFT] = useState<NFTData | null>(null);
  const [gestureTab, setGestureTab] = useState<"hands" | "clothes" | "boards" | "mask">("hands");

  // independent selections with rule: hands XOR boards; clothes/mask optional
  const [selHand, setSelHand] = useState<string>("");
  const [selBoard, setSelBoard] = useState<string>("");
  const [selClothes, setSelClothes] = useState<string>("");
  const [selCollab, setSelCollab] = useState<string>("");

  const [compositeImage, setCompositeImage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const collectionByAddr = useMemo(
    () => Object.fromEntries(collections.map((c) => [c.address.toLowerCase(), { name: c.name, chainId: c.chainId }])),
    [],
  );

  /* ------------------------------- data ------------------------------- */

  async function loadUserNFTs() {
    if (!isConnected || !walletAddress) {
      setUserNFTs([]);
      return;
    }
    setWalletLoading(true);
    try {
      const addrs = collections.map((c) => c.address);
      const owned = await Insight.getOwnedNFTs({
        client: thirdwebClient,
        chains: [ethereum, polygon],
        ownerAddress: walletAddress,
        contractAddresses: addrs,
        includeMetadata: true,
        queryOptions: { resolve_metadata_links: "true", limit: 500 },
      });

      const mapped: NFTData[] = owned.map((n) => {
        const meta = n.metadata || {};
        const info = collectionByAddr[n.tokenAddress.toLowerCase()];
        return {
          tokenId: n.id.toString(),
          name: meta.name || `${info?.name ?? "Token"} #${n.id.toString()}`,
          image: pickImage(meta),
          description: meta.description,
          attributes: Array.isArray(meta.attributes) ? meta.attributes : [],
          owner: n.owner,
          collection: info?.name,
          tokenAddress: n.tokenAddress,
          chainId: n.chainId,
        };
      });

      setUserNFTs(mapped);
    } catch (err) {
      console.error("[gallery] loadUserNFTs error", err);
      setUserNFTs([]);
    } finally {
      setWalletLoading(false);
    }
  }

  async function loadCollectionNFTs(reset = false) {
    setLoading(true);
    setError("");
    try {
      const usePage = reset ? 1 : page;
      const chain = chainFromId(selectedCollection.chainId);

      const list = await Insight.getContractNFTs({
        client: thirdwebClient,
        chains: [chain],
        contractAddress: selectedCollection.address,
        includeMetadata: true,
        includeOwners: true,
        queryOptions: { resolve_metadata_links: "true", limit: perPage, page: usePage },
      });

      const mapped: NFTData[] = list.map((n) => ({
        tokenId: n.id.toString(),
        name: n.metadata?.name || `${selectedCollection.name} #${n.id.toString()}`,
        image: pickImage(n.metadata),
        description: n.metadata?.description,
        attributes: Array.isArray(n.metadata?.attributes) ? n.metadata?.attributes : [],
        owner: n.owner,
        collection: selectedCollection.name,
        tokenAddress: n.tokenAddress,
        chainId: n.chainId,
      }));

      setNfts((prev) => (reset ? mapped : [...prev, ...mapped]));
      setHasMore(mapped.length === perPage);
      if (reset) setPage(1);
    } catch (err: any) {
      console.error("[gallery] loadCollectionNFTs error", err);
      if (err?.message?.includes("Unauthorized domain")) {
        setError("Preview domain not authorized. Collections will be available after deployment.");
        if (reset) {
          const placeholderNFTs: NFTData[] = Array.from({ length: 12 }, (_, i) => ({
            tokenId: (i + 1).toString(),
            name: `${selectedCollection.name} #${i + 1}`,
            image: "/prime-mates-nft.jpg",
            description: `Preview of ${selectedCollection.name} collection`,
            attributes: [],
            owner: "",
            collection: selectedCollection.name,
            tokenAddress: selectedCollection.address,
            chainId: selectedCollection.chainId,
          }));
          setNfts(placeholderNFTs);
        }
      } else {
        setError("Failed to load NFTs. Please try again.");
        if (reset) setNfts([]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function searchNFT() {
    if (!searchTokenId || isNaN(Number(searchTokenId))) return;
    setLoading(true);
    try {
      const tokenId = BigInt(searchTokenId);
      const nft = await Insight.getNFT({
        client: thirdwebClient,
        chain: chainFromId(selectedCollection.chainId),
        contractAddress: selectedCollection.address,
        tokenId,
        includeOwners: true,
        queryOptions: { resolve_metadata_links: "true" },
      });

      if (nft) {
        const meta = nft.metadata || {};
        setSearchedNFT({
          tokenId: nft.id.toString(),
          name: meta.name || `${selectedCollection.name} #${nft.id.toString()}`,
          image: pickImage(meta),
          description: meta.description,
          attributes: Array.isArray(meta.attributes) ? meta.attributes : [],
          owner: nft.owner,
          collection: selectedCollection.name,
          tokenAddress: nft.tokenAddress,
          chainId: nft.chainId,
        });
      } else {
        setSearchedNFT({
          tokenId: tokenId.toString(),
          name: `${selectedCollection.name} #${tokenId.toString()}`,
          image: "/abstract-nft-concept.png",
          description: `${selectedCollection.name} NFT #${tokenId.toString()} - This token may not be minted yet.`,
          attributes: [{ trait_type: "Status", value: "Not Minted" }],
        });
      }
    } catch (err) {
      console.error("[gallery] searchNFT error", err);
    } finally {
      setLoading(false);
    }
  }

  // Gesture composite (clothes + (hand xor board) + mask)
  async function generateComposite() {
    if (!selectedNFT) return;
    setIsGenerating(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 512; canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      const base = await loadImage(selectedNFT.image || "/prime-mates-nft.jpg");
      ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

      const ids: string[] = [];
      if (selClothes) ids.push(selClothes);
      if (selHand) ids.push(selHand);
      else if (selBoard) ids.push(selBoard);
      if (selCollab) ids.push(selCollab);

      for (const id of ids) {
        const g = GESTURE_OVERLAYS.find(x => x.id === id);
        if (!g?.image) continue;
        const overlay = await loadImage(g.image);
        ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
      }

      setCompositeImage(canvas.toDataURL("image/png"));
    } catch (e) {
      console.error("[gesture] generateComposite failed", e);
      setCompositeImage("");
    } finally {
      setIsGenerating(false);
    }
  }

  useEffect(() => {
    if (activeTab === "gesture" && selectedNFT) {
      generateComposite();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedNFT, selHand, selBoard, selClothes, selCollab]);

  useEffect(() => {
    if (activeTab === "collections") {
      setSearchedNFT(null);
      setNfts([]);
      setPage(1);
      setError("");
      setHasMore(true);
      loadCollectionNFTs(true);
    }
  }, [selectedCollection, activeTab]); // eslint-disable-line

  useEffect(() => {
    loadUserNFTs();
  }, [isConnected, walletAddress]); // eslint-disable-line

  /* ------------------------------------------------------------------ */
  /* BANNERS + WALLPAPERS: overlays, preview remove-bg, PFP shape, export */
  /* ------------------------------------------------------------------ */

  const [template, setTemplate] = useState<BannerTemplate>("twitter");
  const tmpl = TEMPLATES[template];

  const [backgrounds, setBackgrounds] = useState<{ id: string; src: string }[]>([]);
  const [bgIndex, setBgIndex] = useState(0);
  const [transparentBG, setTransparentBG] = useState(false);

  const SWATCHES = ["#F6C543", "#33C164", "#7CB3FF", "#F19BD1", "#F14D4D", "#2EB6F0", "#0B1220", "#111827"];

  useEffect(() => {
    const files = template === "phone" ? PHONE_FILES : BANNER_FILES;
    Promise.all(
      files.map(
        (src) =>
          new Promise<{ ok: boolean; src: string }>((res) => {
            const img = new Image();
            img.onload = () => res({ ok: true, src: encodeURI(src) });
            img.onerror = () => res({ ok: false, src });
            img.src = encodeURI(src);
          }),
      ),
    ).then((results) => {
      const ok = results.filter((r) => r.ok).map((r, i) => ({ id: `bg-${i}`, src: r.src }));
      setBackgrounds(ok);
      setBgIndex(0);
    });
  }, [template]);

  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const [shape, setShape] = useState<"rect" | "circle">("rect");

  const previewRef = useRef<HTMLDivElement>(null);

  function uid() {
    return Math.random().toString(36).slice(2);
  }
  async function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (ev) => reject(ev);
      img.src = encodeURI(src);
    });
  }

  function addOverlayFromSrc(name: string, src: string) {
    const rect = previewRef.current?.getBoundingClientRect();
    const cx = rect ? rect.width * 0.5 : 600;
    const cy = rect ? rect.height * 0.6 : 200;
    const id = uid();
    const o: Overlay = {
      id,
      src,
      name,
      x: cx,
      y: cy,
      scale: 0.45, // 45% of canvas height
      rotation: 0,
      removeBg: { enabled: false, color: "#87ceeb", tol: 50, soft: 20, protectDark: true },
    };
    setOverlays((p) => [...p, o]);
    setSelectedOverlayId(id);
  }

  function addOverlayFromNFT(nft: NFTData) {
    addOverlayFromSrc(nft.name, nft.image);
  }
  function addOverlayFromUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const src = URL.createObjectURL(f);
    addOverlayFromSrc(f.name, src);
    e.currentTarget.value = "";
  }
  function clearOverlays() {
    setOverlays([]);
    setSelectedOverlayId(null);
  }
  const selectedOverlay = overlays.find((o) => o.id === selectedOverlayId) || null;

  function onOverlayPointerDown(e: React.PointerEvent, id: string) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setSelectedOverlayId(id);
    setDrag({ id, x: e.clientX, y: e.clientY });
  }
  function onOverlayPointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    setOverlays((prev) => prev.map((o) => (o.id === drag.id ? { ...o, x: o.x + dx, y: o.y + dy } : o)));
    setDrag({ id: drag.id, x: e.clientX, y: e.clientY });
  }
  function onOverlayPointerUp(e: React.PointerEvent) {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setDrag(null);
  }

  function onUploadBackground(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const src = URL.createObjectURL(f);
    setBackgrounds((p) => [{ id: uid(), src }, ...p]);
    setBgIndex(0);
    e.currentTarget.value = "";
  }

  // Manual brush editor state
  const [maskEdit, setMaskEdit] = useState<{
    id: string;
    workingUrl: string;
    brush: number;
    mode: "erase" | "restore";
  } | null>(null);

  async function openMaskEditor(o: Overlay) {
    const base = o.srcEdited || o.srcProcessed || o.src;
    setMaskEdit({ id: o.id, workingUrl: base, brush: 24, mode: "erase" });
  }
  function closeMaskEditor() { setMaskEdit(null); }

  // PREVIEW processing for remove-bg (cached)
  useEffect(() => {
    let cancelled = false;

    async function maybeProcess(o: Overlay) {
      if (o.srcEdited) {
        if (o.srcProcessed || o._procKey) {
          setOverlays((p) => p.map(x => x.id === o.id ? { ...x, srcProcessed: undefined, _procKey: undefined } : x));
        }
        return;
      }

      if (!o.removeBg?.enabled) {
        if (o.srcProcessed || o._procKey) {
          setOverlays((p) => p.map(x => x.id === o.id ? { ...x, srcProcessed: undefined, _procKey: undefined } : x));
        }
        return;
      }
      const keys = (o.removeBg.colors?.length ? o.removeBg.colors : [o.removeBg.color || "#87ceeb"]);
      const key = [o.src, keys.join(","), o.removeBg.tol, o.removeBg.soft, o.removeBg.protectDark ? 1 : 0].join("|");
      if (o._procKey === key && o.srcProcessed) return;

      try {
        const processed = keys.length > 1
          ? await colorKeySoftMulti(o.src, keys, o.removeBg.tol, o.removeBg.soft, !!o.removeBg.protectDark)
          : await colorKeySoft(o.src, keys[0], o.removeBg.tol, o.removeBg.soft, !!o.removeBg.protectDark);
        if (!cancelled) {
          setOverlays((p) => p.map(x => x.id === o.id ? { ...x, srcProcessed: processed, _procKey: key } : x));
        }
      } catch {
        // CORS issues: ignore
      }
    }

    const t = setTimeout(() => {
      overlays.forEach(maybeProcess);
    }, 60);

    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(overlays.map(o => ({
    id: o.id,
    src: o.src,
    edited: !!o.srcEdited,
    r: o.removeBg ? [o.removeBg.enabled, (o.removeBg.colors && o.removeBg.colors.join(",")) || o.removeBg.color, o.removeBg.tol, o.removeBg.soft, o.removeBg.protectDark] : null,
  })))]);

  async function exportBanner() {
    const canvas = document.createElement("canvas");
    canvas.width = tmpl.w;
    canvas.height = tmpl.h;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    // @ts-ignore
    ctx.imageSmoothingQuality = "high";

    // Clip for circular PFP
    if (template === "pfp" && shape === "circle") {
      ctx.beginPath();
      ctx.arc(tmpl.w / 2, tmpl.h / 2, Math.min(tmpl.w, tmpl.h) / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    // background
    if (!transparentBG) {
      const bg = backgrounds[bgIndex];
      if (bg) {
        const bgImg = await loadImage(bg.src);
        const scale = Math.max(tmpl.w / bgImg.width, tmpl.h / bgImg.height);
        const bw = bgImg.width * scale;
        const bh = bgImg.height * scale;
        const bx = (tmpl.w - bw) / 2;
        const by = (tmpl.h - bh) / 2;
        ctx.drawImage(bgImg, bx, by, bw, bh);
      } else {
        ctx.fillStyle = "#0b1220";
        ctx.fillRect(0, 0, tmpl.w, tmpl.h);
      }
    }

    // mapping from preview coords to export canvas
    const rect = previewRef.current?.getBoundingClientRect();
    const sx = rect ? tmpl.w / rect.width : 1;
    const sy = rect ? tmpl.h / rect.height : 1;

    // overlays
    for (const o of overlays) {
      let src = o.srcEdited || o.srcProcessed || o.src;
      if (!o.srcEdited && o.removeBg?.enabled && !o.srcProcessed) {
        const keys = (o.removeBg.colors?.length ? o.removeBg.colors : [o.removeBg.color || "#87ceeb"]);
        src = keys.length > 1
          ? await colorKeySoftMulti(o.src, keys, o.removeBg.tol, o.removeBg.soft, !!o.removeBg.protectDark)
          : await colorKeySoft(o.src, keys[0], o.removeBg.tol, o.removeBg.soft, !!o.removeBg.protectDark);
      }
      const img = await loadImage(src);

      // Export rule: height = tmpl.h * scale, width keeps aspect
      const targetH = tmpl.h * o.scale;
      const targetW = (img.width / img.height) * targetH;

      const px = o.x * sx;
      const py = o.y * sy;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate((o.rotation * Math.PI) / 180);
      ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
      ctx.restore();
    }

    const baseName = TEMPLATES[template].label.split(" ")[0].toLowerCase() + ".png";
    await savePNGFromCanvasMobileFriendly(canvas, baseName);
  }

  async function eyeDropperPick(setHex: (hex: string) => void) {
    try {
      // @ts-ignore
      if (window.EyeDropper) {
        // @ts-ignore
        const ed = new window.EyeDropper();
        const res = await ed.open();
        setHex(res.sRGBHex);
      } else {
        alert("Eyedropper not supported in this browser.");
      }
    } catch {
      // cancelled
    }
  }

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-gray-900 to-black py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">
              <span className="text-yellow-400">NFT Collection Gallery</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Explore the complete Prime Mates NFT ecosystem. Browse collections, search specific tokens, create banners, wallpapers and PFPs.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900 border border-gray-800 mb-8">
            <TabsTrigger value="collections" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">Collections</TabsTrigger>
            <TabsTrigger value="my-collection" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">My Collection</TabsTrigger>
            <TabsTrigger value="gesture" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
              <Wand2 className="w-4 h-4 mr-2" /> Gesture Studio
            </TabsTrigger>
            <TabsTrigger value="banners-wallpapers" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
              <Palette className="w-4 h-4 mr-2" /> Banners + Wallpapers
            </TabsTrigger>
          </TabsList>

          {/* -------------------- Collections -------------------- */}
          <TabsContent value="collections">
            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-6 mb-12">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Collection</label>
                <Select
                  value={selectedCollection.address}
                  onValueChange={(value) => {
                    const c = collections.find((x) => x.address === value);
                    if (c) setSelectedCollection(c);
                  }}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {collections.map((c) => (
                      <SelectItem key={c.address} value={c.address} className="text-white hover:bg-gray-700">
                        {c.name} ({c.totalSupply} NFTs)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">Search Token ID</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={`1 - ${selectedCollection.totalSupply}`}
                    value={searchTokenId}
                    onChange={(e) => setSearchTokenId(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    min={1}
                    max={selectedCollection.totalSupply}
                  />
                  <Button
                    onClick={searchNFT}
                    disabled={loading || !searchTokenId}
                    className={`bg-gradient-to-r ${themeGradient(selectedCollection.theme)} hover:opacity-90 text-black font-semibold`}
                    aria-label="Search NFT by token id"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={() => loadCollectionNFTs(true)}
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                    aria-label="Refresh collection"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Collection Info */}
            <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedCollection.name}</h2>
                  <p className="text-gray-400">Contract: {selectedCollection.address}</p>
                  <p className="text-gray-500 text-sm">Network: {selectedCollection.chainId === 1 ? "Ethereum" : "Polygon"}</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold bg-gradient-to-r ${themeGradient(selectedCollection.theme)} bg-clip-text text-transparent`}>
                      {selectedCollection.totalSupply}
                    </div>
                    <div className="text-sm text-gray-400">Total Supply</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Result */}
            {searchedNFT && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold mb-6 text-center">
                  <span className={`bg-gradient-to-r ${themeGradient(selectedCollection.theme)} bg-clip-text text-transparent`}>Search Result</span>
                </h3>
                <div className="max-w-md mx-auto">
                  <Card className="bg-gray-900 border-gray-800 hover:border-yellow-500 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-800">
                        <img
                          src={searchedNFT.image || "/placeholder.svg"}
                          alt={searchedNFT.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => ((e.target as HTMLImageElement).src = "/prime-mates-nft.jpg")}
                        />
                      </div>
                      <h4 className="font-bold text-lg mb-2">{searchedNFT.name}</h4>
                      <p className="text-gray-400 text-sm mb-3">{searchedNFT.description}</p>
                      {searchedNFT.attributes?.length ? (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {searchedNFT.attributes.map((attr, i) => (
                            <Badge key={i} variant="secondary" className="bg-gray-800 text-gray-300">
                              {attr.trait_type}: {attr.value}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                      {searchedNFT.tokenAddress && searchedNFT.chainId && (
                        <a href={openSeaUrl(searchedNFT.chainId, searchedNFT.tokenAddress, searchedNFT.tokenId)} target="_blank" rel="noreferrer" className="block">
                          <Button variant="outline" size="sm" className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black bg-transparent">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View on OpenSea
                          </Button>
                        </a>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Collection Grid */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-center">
                <span className={`bg-gradient-to-r ${themeGradient(selectedCollection.theme)} bg-clip-text text-transparent`}>Collection Preview</span>
              </h3>

              {error && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Notice</span>
                  </div>
                  <p className="text-gray-300 mt-1">{error}</p>
                </div>
              )}

              {loading && nfts.length === 0 ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                  <span className="ml-2 text-gray-400">Loading NFTs...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {nfts.map((nft) => (
                      <Card key={`${nft.tokenAddress}-${nft.tokenId}`} className="bg-gray-900 border-gray-800 hover:border-yellow-500 transition-all duration-300 group">
                        <CardContent className="p-4">
                          <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-800">
                            <img
                              src={nft.image || "/placeholder.svg"}
                              alt={nft.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => ((e.target as HTMLImageElement).src = "/prime-mates-nft.jpg")}
                            />
                          </div>
                          <h4 className="font-bold text-lg mb-2">{nft.name}</h4>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{nft.description}</p>
                          {nft.attributes?.length ? (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {nft.attributes.slice(0, 2).map((attr, i) => (
                                <Badge key={i} variant="secondary" className="bg-gray-800 text-gray-300 text-xs">
                                  {attr.value}
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                          <div className="flex gap-2">
                            {nft.tokenAddress && nft.chainId && (
                              <a href={openSeaUrl(nft.chainId, nft.tokenAddress, nft.tokenId)} target="_blank" rel="noreferrer" className="w-full">
                                <Button variant="outline" size="sm" className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black bg-transparent">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View on OpenSea
                                </Button>
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {hasMore && !error && (
                    <div className="flex justify-center mt-8">
                      <Button
                        onClick={() => {
                          setPage((p) => p + 1);
                          loadCollectionNFTs();
                        }}
                        disabled={loading}
                        variant="outline"
                        className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load More"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* --------------------- My Collection --------------------- */}
          <TabsContent value="my-collection">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">My NFT Collection</span>
              </h2>
              <p className="text-gray-400 mb-6">Connect your wallet to view your Prime Mates NFTs across all collections</p>

              {!isConnected ? (
                <ConnectWidget />
              ) : (
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                  <p className="text-sm text-gray-400 mb-2">Connected Wallet</p>
                  <p className="font-mono text-yellow-500">{walletAddress}</p>
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <p className="text-sm text-gray-400">Found {userNFTs.length} NFTs</p>
                    <Button onClick={loadUserNFTs} variant="ghost" className="text-gray-400 hover:text-white" aria-label="Refresh my collection">
                      <RefreshCw className={`w-4 h-4 ${walletLoading ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {walletLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                <span className="ml-2 text-gray-400">Loading your NFTs...</span>
              </div>
            ) : userNFTs.length > 0 ? (
              <div>
                {collections.map((collection) => {
                  const group = userNFTs.filter((n) => n.collection === collection.name);
                  if (group.length === 0) return null;
                  return (
                    <div key={collection.address} className="mb-12">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <span className={`bg-gradient-to-r ${themeGradient(collection.theme)} bg-clip-text text-transparent`}>{collection.name}</span>
                        <Badge variant="secondary" className="bg-gray-800">{group.length} NFTs</Badge>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {group.map((nft) => (
                          <Card key={`${nft.tokenAddress}-${nft.tokenId}`} className="bg-gray-900 border-gray-800 hover:border-yellow-500 transition-all duration-300 group">
                            <CardContent className="p-4">
                              <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-800">
                                <img
                                  src={nft.image || "/placeholder.svg"}
                                  alt={nft.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => ((e.target as HTMLImageElement).src = "/prime-mates-nft.jpg")}
                                />
                              </div>
                              <h4 className="font-bold text-lg mb-2">{nft.name}</h4>
                              <div className="flex items-center justify-between mb-3">
                                <Badge variant="secondary" className="bg-gray-800 text-gray-300">#{nft.tokenId}</Badge>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="w-full bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                                  onClick={() => { setActiveTab("banners-wallpapers"); addOverlayFromNFT(nft); }}
                                >
                                  Use in Banners + Wallpapers
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : isConnected ? (
              <div className="text-center py-20">
                <div className="text-gray-400 mb-4">No Prime Mates NFTs found in your wallet</div>
                <p className="text-sm text-gray-500">Make sure you're connected to the correct wallet and have NFTs from our collections</p>
              </div>
            ) : null}
          </TabsContent>

          {/* --------------------- Gesture Studio --------------------- */}
          <TabsContent value="gesture">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Gesture Studio</span>
              </h2>
              <p className="text-gray-400 mb-6">Select your NFT and add overlays. Clothing & mask can be combined with either a hand or a board (but not both).</p>
              {!isConnected && <ConnectWidget />}
            </div>

            {isConnected && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* NFT Selection */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-yellow-400">1. Select Your NFT</h3>
                    {userNFTs.length === 0 ? (
                      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                        <p className="text-gray-400">No NFTs found in your wallet</p>
                        <Button onClick={loadUserNFTs} className="mt-4 bg-transparent" variant="outline">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                        {userNFTs.map((nft) => (
                          <Card
                            key={`${nft.tokenAddress}-${nft.tokenId}`}
                            className={`cursor-pointer transition-all duration-300 ${
                              selectedNFT?.tokenId === nft.tokenId ? "border-yellow-500 bg-yellow-500/10" : "bg-gray-900 border-gray-800 hover:border-yellow-500"
                            }`}
                            onClick={() => setSelectedNFT(nft)}
                          >
                            <CardContent className="p-3">
                              <div className="aspect-square mb-2 rounded-lg overflow-hidden bg-gray-800">
                                <img
                                  src={nft.image || "/placeholder.svg"}
                                  alt={nft.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => ((e.target as HTMLImageElement).src = "/prime-mates-nft.jpg")}
                                />
                              </div>
                              <h4 className="font-bold text-sm truncate">{nft.name}</h4>
                              <p className="text-xs text-gray-400">#{nft.tokenId}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Gesture categories */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-purple-400">2. Choose Overlays</h3>
                    <div className="flex gap-2 mb-4">
                      {(["Hands", "Clothes", "Boards", "Mask"] as const).map((label) => {
                        const key = label.toLowerCase() as "hands" | "clothes" | "boards" | "mask";
                        return (
                          <Button
                            key={label}
                            variant={gestureTab === key ? "default" : "outline"}
                            className={gestureTab === key ? "bg-purple-500 text-black" : "border-purple-400/40 text-purple-300"}
                            onClick={() => setGestureTab(key)}
                          >
                            {label}
                          </Button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {(() => {
                        const kind = detectBoardKind(selectedNFT);
                        return GESTURE_OVERLAYS
                          .filter((g) => {
                            if (g.category !== gestureTab) return false;
                            if (g.category === "boards" && kind && g.boardKind && g.boardKind !== kind) return false;
                            return true;
                          })
                          .map((gesture) => {
                            const isSelected =
                              (gesture.category === "hands"   && selHand    === gesture.id) ||
                              (gesture.category === "boards"  && selBoard   === gesture.id) ||
                              (gesture.category === "clothes" && selClothes === gesture.id) ||
                              (gesture.category === "mask"    && selCollab  === gesture.id);

                            return (
                              <Card
                                key={gesture.id}
                                className={`cursor-pointer transition-all duration-300 ${
                                  isSelected ? "border-purple-500 bg-purple-500/10" : "bg-gray-900 border-gray-800 hover:border-purple-500"
                                }`}
                                onClick={() => {
                                  if (gesture.category === "hands") {
                                    setSelHand(gesture.id);
                                    setSelBoard(""); // mutual exclusion
                                  } else if (gesture.category === "boards") {
                                    setSelBoard(gesture.id);
                                    setSelHand(""); // mutual exclusion
                                  } else if (gesture.category === "clothes") {
                                    setSelClothes((prev) => (prev === gesture.id ? "" : gesture.id));
                                  } else if (gesture.category === "mask") {
                                    setSelCollab((prev) => (prev === gesture.id ? "" : gesture.id));
                                  }
                                }}
                              >
                                <CardContent className="p-3">
                                  <div className="aspect-square mb-2 rounded-lg overflow-hidden bg-gray-800">
                                    <img src={gesture.image || "/placeholder.svg"} alt={gesture.name} className="w-full h-full object-cover" />
                                  </div>
                                  <h4 className="font-bold text-sm text-center">{gesture.name}</h4>
                                </CardContent>
                              </Card>
                            );
                          });
                      })()}
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-pink-400">3. Preview & Download</h3>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                      {compositeImage ? (
                        <div className="space-y-4">
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-800 mx-auto max-w-sm">
                            <img src={compositeImage || "/placeholder.svg"} alt="Composite NFT with gesture" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={() =>
                                savePNGFromDataURLMobileFriendly(
                                  compositeImage,
                                  `${selectedNFT?.name || "nft"}-gesture.png`
                                )
                              }
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                            <Button
                              onClick={async () => {
                                // Optional: attempt share first; fallback to opening in a new tab
                                const blob = dataURLToBlob(compositeImage);
                                if (!(await tryShareBlobPNG(blob, `${selectedNFT?.name || "nft"}-gesture.png`))) {
                                  openBlobInNewTab(blob);
                                }
                              }}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Share className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-square rounded-lg bg-gray-800 flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            {isGenerating ? (
                              <>
                                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-400" />
                                <p>Generating preview...</p>
                              </>
                            ) : (
                              <>
                                <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Select your NFT and any overlays</p>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ------------------------- BANNERS + WALLPAPERS ------------------------- */}
          <TabsContent value="banners-wallpapers">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent">Banners + Wallpapers Studio</span>
              </h2>
              <p className="text-gray-400 mb-6">
                Create custom phone backgrounds, banners, and <strong>PFPs</strong> with your NFTs. Toggle “Remove background” in the Overlay Controls to soft-key a color.
              </p>
              {!isConnected && <ConnectWidget />}
            </div>

            {isConnected && (
              <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8">
                {/* LEFT: live preview + export */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Select value={template} onValueChange={(v) => setTemplate(v as BannerTemplate)}>
                      <SelectTrigger className="w-64 bg-gray-900 border-gray-800">
                        <SelectValue placeholder="Choose template" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-800">
                        <SelectItem value="twitter">Twitter Banner (1500×500)</SelectItem>
                        <SelectItem value="phone">Phone Background (1080×1920)</SelectItem>
                        <SelectItem value="pfp">PFP (1024×1024)</SelectItem>
                      </SelectContent>
                    </Select>

                    {template === "pfp" && (
                      <div className="ml-2 flex items-center gap-2">
                        <Button size="sm" variant={shape === "rect" ? "default" : "outline"} onClick={() => setShape("rect")}>
                          <Square className="w-4 h-4 mr-2" /> Square
                        </Button>
                        <Button size="sm" variant={shape === "circle" ? "default" : "outline"} onClick={() => setShape("circle")}>
                          <CircleIcon className="w-4 h-4 mr-2" /> Circle
                        </Button>
                      </div>
                    )}

                    <label className="inline-flex items-center gap-2 ml-2 text-sm cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Upload overlay
                      <input type="file" accept="image/*" className="hidden" onChange={addOverlayFromUpload} />
                    </label>

                    <label className="inline-flex items-center gap-2 ml-auto text-sm">
                      <input type="checkbox" checked={transparentBG} onChange={(e) => setTransparentBG(e.target.checked)} /> Transparent BG
                    </label>

                    <Button onClick={exportBanner} className="bg-yellow-500 text-black hover:bg-yellow-400">
                      <Download className="w-4 h-4 mr-2" />
                      Download PNG
                    </Button>
                  </div>

                  <div
                    ref={previewRef}
                    className={`relative overflow-hidden border border-gray-800 bg-gray-900 ${
                      template === "pfp" && shape === "circle" ? "rounded-full" : "rounded-xl"
                    }`}
                    style={{ aspectRatio: `${tmpl.w}/${tmpl.h}` }}
                    onPointerMove={onOverlayPointerMove}
                    onPointerUp={onOverlayPointerUp}
                  >
                    {/* background */}
                    {!transparentBG && (
                      <img
                        src={backgrounds[bgIndex]?.src}
                        alt="Background"
                        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                      />
                    )}

                    {/* overlays (match export sizing: height = o.scale * container height) */}
                    {overlays.map((o) => (
                      <img
                        key={o.id}
                        src={o.srcEdited || o.srcProcessed || o.src}
                        alt={o.name || "overlay"}
                        className={`absolute cursor-grab ${selectedOverlayId === o.id ? "ring-2 ring-blue-400" : ""}`}
                        style={{
                          left: o.x,
                          top: o.y,
                          height: `${o.scale * 100}%`,
                          width: "auto",
                          transform: `translate(-50%,-50%) rotate(${o.rotation}deg)`,
                          transformOrigin: "center",
                          maxHeight: "none",
                          maxWidth: "none",
                          pointerEvents: "auto",
                        }}
                        draggable={false}
                        onPointerDown={(e) => onOverlayPointerDown(e, o.id)}
                      />
                    ))}
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button onClick={exportBanner} className="flex-1 bg-green-600 hover:bg-green-700">
                      <Download className="w-4 h-4 mr-2" />
                      Download PNG
                    </Button>
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={async () => {
                        // Attempt to render and share directly
                        const canvas = document.createElement("canvas");
                        canvas.width = tmpl.w;
                        canvas.height = tmpl.h;
                        const ctx = canvas.getContext("2d")!;
                        ctx.imageSmoothingEnabled = true;
                        // @ts-ignore
                        ctx.imageSmoothingQuality = "high";
                        if (template === "pfp" && shape === "circle") {
                          ctx.beginPath();
                          ctx.arc(tmpl.w / 2, tmpl.h / 2, Math.min(tmpl.w, tmpl.h) / 2, 0, Math.PI * 2);
                          ctx.clip();
                        }
                        if (!transparentBG) {
                          const bg = backgrounds[bgIndex];
                          if (bg) {
                            const bgImg = await loadImage(bg.src);
                            const scale = Math.max(tmpl.w / bgImg.width, tmpl.h / bgImg.height);
                            const bw = bgImg.width * scale, bh = bgImg.height * scale;
                            const bx = (tmpl.w - bw) / 2, by = (tmpl.h - bh) / 2;
                            ctx.drawImage(bgImg, bx, by, bw, bh);
                          } else {
                            ctx.fillStyle = "#0b1220"; ctx.fillRect(0, 0, tmpl.w, tmpl.h);
                          }
                        }
                        const rect = previewRef.current?.getBoundingClientRect();
                        const sx = rect ? tmpl.w / rect.width : 1;
                        const sy = rect ? tmpl.h / rect.height : 1;
                        for (const o of overlays) {
                          let src = o.srcEdited || o.srcProcessed || o.src;
                          if (!o.srcEdited && o.removeBg?.enabled && !o.srcProcessed) {
                            const keys = (o.removeBg.colors?.length ? o.removeBg.colors : [o.removeBg.color || "#87ceeb"]);
                            src = keys.length > 1
                              ? await colorKeySoftMulti(o.src, keys, o.removeBg.tol, o.removeBg.soft, !!o.removeBg.protectDark)
                              : await colorKeySoft(o.src, keys[0], o.removeBg.tol, o.removeBg.soft, !!o.removeBg.protectDark);
                          }
                          const img = await loadImage(src);
                          const targetH = tmpl.h * o.scale;
                          const targetW = (img.width / img.height) * targetH;
                          const px = o.x * sx, py = o.y * sy;
                          ctx.save();
                          ctx.translate(px, py);
                          ctx.rotate((o.rotation * Math.PI) / 180);
                          ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
                          ctx.restore();
                        }
                        const blob = await blobFromCanvas(canvas);
                        if (!(await tryShareBlobPNG(blob, TEMPLATES[template].label.split(" ")[0].toLowerCase() + ".png"))) {
                          openBlobInNewTab(blob);
                        }
                      }}
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* RIGHT: background, NFTs, decor/logos, controls */}
                <div className="space-y-6">
                  {/* Backgrounds */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold flex items-center gap-2"><Brush className="w-4 h-4" /> Background</div>
                        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                          <Upload className="w-4 h-4" />
                          Upload background
                          <input type="file" accept="image/*" className="hidden" onChange={onUploadBackground} />
                        </label>
                      </div>

                      {/* Solid color swatches */}
                      <div className="flex gap-2 mb-3">
                        {SWATCHES.map((hex) => (
                          <button
                            key={hex}
                            onClick={() => {
                              const c = document.createElement("canvas");
                              c.width = 1; c.height = 1;
                              const ctx = c.getContext("2d")!;
                              ctx.fillStyle = hex; ctx.fillRect(0,0,1,1);
                              const src = c.toDataURL("image/png");
                              setBackgrounds((p) => [{ id: `solid-${hex}`, src }, ...p]);
                              setBgIndex(0);
                              setTransparentBG(false);
                            }}
                            className="w-8 h-8 rounded-md border border-white/20"
                            style={{ background: hex }}
                            title={hex}
                          />
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                        {backgrounds.map((b, i) => (
                          <button
                            key={b.id}
                            onClick={() => setBgIndex(i)}
                            className={`rounded-md overflow-hidden border ${i === bgIndex ? "border-blue-500" : "border-gray-800 hover:border-gray-700"}`}
                          >
                            <div className="aspect-video bg-gray-800">
                              <img src={b.src} alt="bg" className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Your NFTs */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold">Your NFTs (add as overlays)</div>
                        <button className="text-sm text-gray-400 hover:text-white" onClick={clearOverlays}>Clear</button>
                      </div>
                      {userNFTs.length === 0 ? (
                        <div className="text-sm text-gray-400">No NFTs found in your wallet.</div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                          {userNFTs.map((n) => (
                            <button
                              key={`${n.tokenAddress}-${n.tokenId}`}
                              onClick={() => addOverlayFromNFT(n)}
                              className="rounded-md overflow-hidden bg-gray-800 border border-gray-800 hover:border-blue-500"
                              title="Add to canvas"
                            >
                              <img src={n.image} alt={n.name} className="w-full h-full object-cover aspect-square" />
                            </button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Decor */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold">Decor</div>
                        <div className="text-xs text-gray-400">/public/decor/*</div>
                      </div>
                      {DECOR_FILES.length === 0 ? (
                        <div className="text-sm text-gray-400">Add PNGs to /public/decor to see them here.</div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                          {DECOR_FILES.map((d) => (
                            <button
                              key={d.src}
                              onClick={() => addOverlayFromSrc(d.name, d.src)}
                              className="rounded-md overflow-hidden bg-gray-800 border border-gray-800 hover:border-blue-500"
                              title="Add to canvas"
                            >
                              <img src={d.src} alt={d.name} className="w-full h-full object-cover aspect-square" />
                            </button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Logos */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold">Logos</div>
                        <div className="text-xs text-gray-400">/public/logos/*</div>
                      </div>
                      {LOGO_FILES.length === 0 ? (
                        <div className="text-sm text-gray-400">Add PNGs to /public/logos to see them here.</div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                          {LOGO_FILES.map((d) => (
                            <button
                              key={d.src}
                              onClick={() => addOverlayFromSrc(d.name, d.src)}
                              className="rounded-md overflow-hidden bg-gray-800 border border-gray-800 hover:border-blue-500"
                              title="Add to canvas"
                            >
                              <img src={d.src} alt={d.name} className="w-full h-full object-cover aspect-square" />
                            </button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Controls for selected overlay */}
                  {selectedOverlay && (
                    <Card className="bg-gray-900 border-gray-800">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">Overlay Controls</div>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOverlays((p) => {
                                  const idx = p.findIndex((o) => o.id === selectedOverlay.id);
                                  if (idx < 0) return p;
                                  const copy = [...p];
                                  const [it] = copy.splice(idx, 1);
                                  copy.push(it);
                                  return copy;
                                });
                              }}
                            >
                              <Layers className="w-4 h-4 mr-2" />Front
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOverlays((p) => {
                                  const idx = p.findIndex((o) => o.id === selectedOverlay.id);
                                  if (idx < 0) return p;
                                  const copy = [...p];
                                  const [it] = copy.splice(idx, 1);
                                  copy.unshift(it);
                                  return copy;
                                });
                              }}
                            >
                              <Layers className="w-4 h-4 mr-2 rotate-180" />Back
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const clone = { ...selectedOverlay, id: uid(), x: selectedOverlay.x + 24, y: selectedOverlay.y + 24 };
                                setOverlays((p) => [...p, clone]);
                                setSelectedOverlayId(clone.id);
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />Duplicate
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-500 text-red-400 hover:bg-red-500/10"
                              onClick={() => {
                                setOverlays((p) => p.filter((o) => o.id !== selectedOverlay.id));
                                setSelectedOverlayId(null);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />Delete
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => openMaskEditor(selectedOverlay)}>Manual erase/restore</Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs">Scale (height %)</div>
                          <input
                            type="range"
                            min={0.2}
                            max={2.5}
                            step={0.02}
                            value={selectedOverlay.scale}
                            onChange={(e) =>
                              setOverlays((p) => p.map((o) => (o.id === selectedOverlay.id ? { ...o, scale: Number(e.target.value) } : o)))
                            }
                            className="w-64"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs">Rotation</div>
                          <input
                            type="range"
                            min={-180}
                            max={180}
                            step={1}
                            value={selectedOverlay.rotation}
                            onChange={(e) =>
                              setOverlays((p) => p.map((o) => (o.id === selectedOverlay.id ? { ...o, rotation: Number(e.target.value) } : o)))
                            }
                            className="w-64"
                          />
                        </div>

                        {/* Removal toggles */}
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={!!selectedOverlay.removeBg?.enabled}
                              onChange={(e) =>
                                setOverlays((p) =>
                                  p.map((o) =>
                                    o.id === selectedOverlay.id
                                      ? {
                                          ...o,
                                          removeBg: {
                                            ...(o.removeBg || { tol: 50, soft: 20, protectDark: true }),
                                            enabled: e.target.checked,
                                          },
                                        }
                                      : o,
                                  ),
                                )
                              }
                            />
                            Remove background
                          </label>

                          {/* Multi-key palette UI */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs opacity-75">Key colors:</span>
                            {(
                              selectedOverlay.removeBg?.colors && selectedOverlay.removeBg.colors.length
                                ? selectedOverlay.removeBg.colors
                                : [selectedOverlay.removeBg?.color || "#87ceeb"]
                            ).map((hex, idx) => (
                              <button
                                key={hex + idx}
                                className="w-6 h-6 rounded border border-white/30"
                                title={hex}
                                style={{ background: hex }}
                                onClick={() => {
                                  if (selectedOverlay.removeBg?.colors?.length) {
                                    setOverlays(p => p.map(o => o.id === selectedOverlay.id
                                      ? { ...o, removeBg: { ...o.removeBg!, colors: o.removeBg!.colors!.filter((c, i) => !(c === hex && i === idx)) } }
                                      : o));
                                  }
                                }}
                              />
                            ))}

                            {/* add via <input type="color"> */}
                            <label className="text-xs inline-flex items-center gap-1">
                              +
                              <input
                                type="color"
                                onChange={(e) => {
                                  const hex = e.target.value;
                                  setOverlays(p => p.map(o => o.id === selectedOverlay.id
                                    ? {
                                        ...o,
                                        removeBg: {
                                          ...(o.removeBg || { enabled: true, tol: 50, soft: 20, protectDark: true }),
                                          colors: [...(o.removeBg?.colors || [o.removeBg?.color || "#87ceeb"]) , hex],
                                          enabled: true,
                                        },
                                      }
                                    : o));
                                  (e.currentTarget as HTMLInputElement).value = "";
                                }}
                              />
                            </label>

                            {/* add via EyeDropper */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                eyeDropperPick((hex) =>
                                  setOverlays((p) =>
                                    p.map((o) =>
                                      o.id === selectedOverlay.id
                                        ? {
                                            ...o,
                                            removeBg: {
                                              ...(o.removeBg || { enabled: true, tol: 50, soft: 20, protectDark: true }),
                                              colors: [...(o.removeBg?.colors || [o.removeBg?.color || "#87ceeb"]), hex],
                                              enabled: true,
                                            },
                                          }
                                        : o,
                                    ),
                                  ),
                                )
                              }
                            >
                              {EyeDropperIcon ? <EyeDropperIcon className="w-4 h-4 mr-2" /> : null} Add color
                            </Button>
                          </div>

                          <label className="flex items-center gap-2 text-sm">
                            Tol
                            <Input
                              type="number"
                              className="w-20 bg-gray-800 border-gray-700"
                              min={0}
                              max={100}
                              value={selectedOverlay.removeBg?.tol ?? 50}
                              onChange={(e) =>
                                setOverlays((p) =>
                                  p.map((o) =>
                                    o.id === selectedOverlay.id
                                      ? {
                                          ...o,
                                          removeBg: {
                                            ...(o.removeBg || { enabled: true, soft: 20, protectDark: true }),
                                            tol: Number(e.target.value) || 50,
                                          },
                                        }
                                      : o,
                                  ),
                                )
                              }
                            />
                          </label>

                          <label className="flex items-center gap-2 text-sm">
                            Soft
                            <Input
                              type="number"
                              className="w-20 bg-gray-800 border-gray-700"
                              min={0}
                              max={100}
                              value={selectedOverlay.removeBg?.soft ?? 20}
                              onChange={(e) =>
                                setOverlays((p) =>
                                  p.map((o) =>
                                    o.id === selectedOverlay.id
                                      ? {
                                          ...o,
                                          removeBg: {
                                            ...(o.removeBg || { enabled: true, tol: 50, protectDark: true }),
                                            soft: Number(e.target.value) || 20,
                                          },
                                        }
                                      : o,
                                  ),
                                )
                              }
                            />
                          </label>

                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={!!selectedOverlay.removeBg?.protectDark}
                              onChange={(e) =>
                                setOverlays((p) =>
                                  p.map((o) =>
                                    o.id === selectedOverlay.id
                                      ? {
                                          ...o,
                                          removeBg: {
                                            ...(o.removeBg || { enabled: true, color: "#87ceeb", tol: 50, soft: 20 }),
                                            protectDark: e.target.checked,
                                          },
                                        }
                                      : o,
                                  ),
                                )
                              }
                            />
                            Protect dark lines
                          </label>
                        </div>

                        {/* Manual editor */}
                        {maskEdit && maskEdit.id === selectedOverlay.id && (
                          <div className="mt-3 border border-gray-800 rounded-lg p-3">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-semibold">Manual touch-up</span>
                              <Button size="sm" variant={maskEdit.mode === "erase" ? "default" : "outline"}
                                onClick={() => setMaskEdit(m => m && ({ ...m, mode: "erase" }))}>Erase</Button>
                              <Button size="sm" variant={maskEdit.mode === "restore" ? "default" : "outline"}
                                onClick={() => setMaskEdit(m => m && ({ ...m, mode: "restore" }))}>Restore</Button>
                              <div className="flex items-center gap-2 ml-auto">
                                <span className="text-xs">Brush</span>
                                <input type="range" min={4} max={80} step={1} value={maskEdit.brush}
                                  onChange={(e) => setMaskEdit(m => m && ({ ...m, brush: Number(e.target.value) }))} />
                              </div>
                            </div>

                            <MaskCanvas
                              url={maskEdit.workingUrl}
                              origUrl={selectedOverlay.src}
                              mode={maskEdit.mode}
                              size={512}
                              brush={maskEdit.brush}
                              onChange={(nextUrl) => setMaskEdit(m => m && ({ ...m, workingUrl: nextUrl }))}
                            />

                            <div className="flex gap-2 mt-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  const finalUrl = maskEdit.workingUrl;
                                  setOverlays(p => p.map(o => o.id === selectedOverlay.id ? { ...o, srcEdited: finalUrl } : o));
                                  closeMaskEditor();
                                }}>Apply</Button>
                              <Button size="sm" variant="outline"
                                onClick={() => {
                                  setOverlays(p => p.map(o => o.id === selectedOverlay.id ? { ...o, srcEdited: undefined } : o));
                                  closeMaskEditor();
                                }}>Reset manual</Button>
                              <Button size="sm" variant="ghost" onClick={closeMaskEditor}>Close</Button>
                            </div>
                          </div>
                        )}

                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
