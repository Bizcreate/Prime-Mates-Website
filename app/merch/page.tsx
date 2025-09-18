"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import * as Lucide from "lucide-react";
import { Download, Layers, Trash2, Upload, Wand2, Loader2, Scissors, Square, Circle as CircleIcon, Copy } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Safe EyeDropper icon (works across lucide versions)                 */
/* ------------------------------------------------------------------ */
const EyeDropperIcon =
  // @ts-ignore
  (Lucide as any).Pipette ??
  // @ts-ignore
  (Lucide as any).EyeDropper ??
  // @ts-ignore
  (Lucide as any).Droplet;

/* ------------------------------ Types/Models ------------------------------ */

type NFTData = {
  tokenId: string;
  name: string;
  image: string;
  tokenAddress?: string;
  chainId?: number;
};

type RemoveBgConfig = {
  enabled: boolean;
  colors?: string[];   // multi-key
  color?: string;      // single key (back-compat)
  tol: number;         // 0..100
  soft: number;        // 0..100
  protectDark: boolean;
};

type Layer = {
  id: string;
  src: string;         // original
  label?: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  removing?: boolean;  // AI remover spinner

  // preview caches
  srcProcessed?: string; // auto soft-keyed
  srcEdited?: string;    // manual brushed
  _procKey?: string;     // cache key
  removeBg?: RemoveBgConfig;
};

type ProductId =
  | "tee-black-front" | "tee-black-back"
  | "tee-white-front" | "tee-white-back"
  | "hoodie-black-front" | "hoodie-black-back"
  | "hoodie-white-front" | "hoodie-white-back"
  | "cap-black-front" | "cap-black-back";

type Product = {
  id: ProductId;
  label: string;
  src: string;               // mockup image in /public/merch
  aspect: number;            // width / height
  // Relative print area (0..1) inside the mockup where artwork is placed
  area: { x: number; y: number; w: number; h: number };
};

/* ------------------------------- Constants -------------------------------- */

const PRODUCTS: Record<ProductId, Product> = {
  "tee-black-front":  { id:"tee-black-front",  label:"T-Shirt Black (Front)", src:"/merch/tshirt_black_front.png",  aspect:1,   area:{ x:0.18, y:0.24, w:0.64, h:0.50 } },
  "tee-black-back":   { id:"tee-black-back",   label:"T-Shirt Black (Back)",  src:"/merch/tshirt_black_back.png",   aspect:1,   area:{ x:0.18, y:0.24, w:0.64, h:0.50 } },
  "tee-white-front":  { id:"tee-white-front",  label:"T-Shirt White (Front)", src:"/merch/tshirt_white_front.png",  aspect:1,   area:{ x:0.18, y:0.24, w:0.64, h:0.50 } },
  "tee-white-back":   { id:"tee-white-back",   label:"T-Shirt White (Back)",  src:"/merch/tshirt_white_back.png",   aspect:1,   area:{ x:0.18, y:0.24, w:0.64, h:0.50 } },
  "hoodie-black-front":{id:"hoodie-black-front",label:"Hoodie Black (Front)",  src:"/merch/hoodie_black_front.png", aspect:0.8, area:{ x:0.22, y:0.28, w:0.56, h:0.48 } },
  "hoodie-black-back": {id:"hoodie-black-back", label:"Hoodie Black (Back)",   src:"/merch/hoodie_black_back.png",  aspect:0.8, area:{ x:0.22, y:0.28, w:0.56, h:0.48 } },
  "hoodie-white-front":{id:"hoodie-white-front",label:"Hoodie White (Front)",  src:"/merch/hoodie_white_front.png", aspect:0.8, area:{ x:0.22, y:0.28, w:0.56, h:0.48 } },
  "hoodie-white-back": {id:"hoodie-white-back", label:"Hoodie White (Back)",   src:"/merch/hoodie_white_back.png",  aspect:0.8, area:{ x:0.22, y:0.28, w:0.56, h:0.48 } },
  "cap-black-front":  { id:"cap-black-front",  label:"Cap Black (Front)",     src:"/merch/cap_black_front.png",    aspect:1,   area:{ x:0.30, y:0.30, w:0.40, h:0.30 } },
  "cap-black-back":   { id:"cap-black-back",   label:"Cap Black (Back)",      src:"/merch/cap_black_back.png",     aspect:1,   area:{ x:0.30, y:0.30, w:0.40, h:0.30 } },
};

const SWATCHES = ["#F6C543", "#33C164", "#7CB3FF", "#F19BD1", "#F14D4D", "#2EB6F0", "#0B1220", "#111827"];

/* --------------------------------- Utils ---------------------------------- */

function uid() {
  return Math.random().toString(36).slice(2);
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = encodeURI(src);
  });
}

function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace("#", "");
  const n = parseInt(v.length === 3 ? v.split("").map((d) => d + d).join("") : v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return [h * 360, s, v];
}
function hueDist(a: number, b: number) {
  const d = Math.abs(a - b);
  return Math.min(d, 360 - d);
}
function hsvDist([h1,s1,v1]:[number,number,number],[h2,s2,v2]:[number,number,number]) {
  const dh = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2)) / 180;
  const ds = Math.abs(s1 - s2);
  const dv = Math.abs(v1 - v2);
  return Math.sqrt((2.1 * dh) ** 2 + (1.0 * ds) ** 2 + (0.35 * dv) ** 2);
}

/** Single-key HSV soft-key with feather and line-art protection. */
async function colorKeySoft(src: string, keyHex: string, tol: number, soft: number, protectDark: boolean): Promise<string> {
  const img = await loadImage(src);
  const c = document.createElement("canvas");
  c.width = img.width; c.height = img.height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const data = ctx.getImageData(0, 0, c.width, c.height);
  const [kr, kg, kb] = hexToRgb(keyHex);
  const [kh, ks, kv] = rgbToHsv(kr, kg, kb);

  const THR = Math.max(0, Math.min(1, tol / 100));
  const FEATHER = Math.max(0, Math.min(1, soft / 100));

  for (let i = 0; i < data.data.length; i += 4) {
    const r = data.data[i], g = data.data[i + 1], b = data.data[i + 2];
    const a = data.data[i + 3];
    if (a === 0) continue;

    const [h, s, v] = rgbToHsv(r, g, b);

    const DARK_V = 0.22, DARK_S = 0.12;
    if (protectDark && v < DARK_V && s > DARK_S) continue;
    const MIN_S = 0.25, MIN_V = 0.35;
    if (s < MIN_S || v < MIN_V) continue;

    const dh = hueDist(h, kh) / 180;
    const ds = Math.abs(s - ks);
    const dv = Math.abs(v - kv);
    const dist = Math.sqrt((2.1 * dh) ** 2 + (1.0 * ds) ** 2 + (0.35 * dv) ** 2);
    const norm = Math.min(1, dist / 1.8);

    if (norm <= THR) {
      data.data[i + 3] = 0;
    } else if (FEATHER > 0 && norm <= THR + FEATHER) {
      const t = (norm - THR) / FEATHER;
      data.data[i + 3] = Math.round(a * t);
    }
  }

  ctx.putImageData(data, 0, 0);
  return c.toDataURL("image/png");
}

/** Multi-key soft-key: removes pixels close to ANY palette color. */
async function colorKeySoftMulti(src: string, keys: string[], tol: number, soft: number, protectDark: boolean): Promise<string> {
  const img = await loadImage(src);
  const c = document.createElement("canvas");
  c.width = img.width; c.height = img.height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const data = ctx.getImageData(0, 0, c.width, c.height);
  const keysHSV = keys.map((hex) => {
    const [r,g,b] = hexToRgb(hex);
    return rgbToHsv(r,g,b);
  });

  const THR = Math.max(0, Math.min(1, tol / 100));
  const FEATHER = Math.max(0, Math.min(1, soft / 100));
  const MIN_S = 0.22, MIN_V = 0.33, DARK_V = 0.22, DARK_S = 0.12;

  for (let i = 0; i < data.data.length; i += 4) {
    const r = data.data[i], g = data.data[i+1], b = data.data[i+2];
    const a = data.data[i+3];
    if (a === 0) continue;

    const hsv = rgbToHsv(r,g,b);
    if (protectDark && hsv[2] < DARK_V && hsv[1] > DARK_S) continue;
    if (hsv[1] < MIN_S || hsv[2] < MIN_V) continue;

    let minD = 1e9;
    for (const k of keysHSV) {
      const d = hsvDist(hsv, k);
      if (d < minD) minD = d;
    }
    const norm = Math.min(1, minD / 1.8);

    if (norm <= THR) {
      data.data[i+3] = 0;
    } else if (FEATHER > 0 && norm <= THR + FEATHER) {
      const t = (norm - THR) / FEATHER;
      data.data[i+3] = Math.round(a * t);
    }
  }

  ctx.putImageData(data, 0, 0);
  return c.toDataURL("image/png");
}

function removeKeySignature(l: Layer) {
  const r = l.removeBg;
  if (!r?.enabled) return "";
  const keys = (r.colors?.length ? r.colors : [r.color || "#87ceeb"]).join(",");
  return [l.src, keys, r.tol, r.soft, r.protectDark ? 1 : 0].join("|");
}
function layerSrc(l: Layer) {
  return l.srcEdited || l.srcProcessed || l.src;
}
function solidColorDataURL(hex: string) {
  const c = document.createElement("canvas");
  c.width = 1; c.height = 1;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = hex; ctx.fillRect(0,0,1,1);
  return c.toDataURL("image/png");
}

/* ---------------------------- Mini Mask Editor ----------------------------- */
function MaskCanvas({
  url, origUrl, size = 512, brush = 24, mode = "erase", onChange,
}: {
  url: string; origUrl: string; size?: number; brush?: number;
  mode?: "erase" | "restore"; onChange: (nextUrl: string) => void;
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
      orig.onload = () => { origRef.current = orig; setReady(true); };
      orig.src = encodeURI(origUrl);
    };
    img.src = encodeURI(url);
  }, [url, origUrl]);

  useEffect(() => {
    if (!ready || !ref.current || !imgRef.current) return;
    const cnv = ref.current, ctx = cnv.getContext("2d")!, img = imgRef.current!;
    cnv.width = size; cnv.height = size;
    ctx.clearRect(0,0,cnv.width,cnv.height);
    const scale = Math.min(cnv.width / img.width, cnv.height / img.height);
    const w = img.width * scale, h = img.height * scale;
    const x = (cnv.width - w) / 2, y = (cnv.height - h) / 2;
    ctx.drawImage(img, x, y, w, h);
  }, [ready, size, url]);

  function drawAt(x: number, y: number) {
    if (!ref.current || !imgRef.current) return;
    const cnv = ref.current, ctx = cnv.getContext("2d")!, img = imgRef.current!, orig = origRef.current!;
    const scale = Math.min(cnv.width / img.width, cnv.height / img.height);
    const w = img.width * scale, h = img.height * scale;
    const x0 = (cnv.width - w) / 2, y0 = (cnv.height - h) / 2;

    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, brush / 2, 0, Math.PI * 2); ctx.closePath();
    if (mode === "erase") {
      ctx.globalCompositeOperation = "destination-out"; ctx.fillStyle = "rgba(0,0,0,1)"; ctx.fill();
    } else {
      ctx.clip(); ctx.globalCompositeOperation = "source-over"; ctx.drawImage(orig, x0, y0, w, h);
    }
    ctx.restore();
    onChange(cnv.toDataURL("image/png"));
  }

  function handlePointer(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    drawAt(e.clientX - rect.left, e.clientY - rect.top);
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

/* -------------------------------- Component -------------------------------- */

export default function MerchPage() {
  const [productId, setProductId] = useState<ProductId>("tee-black-front");
  const product = PRODUCTS[productId];

  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [shape, setShape] = useState<"rect" | "circle">("rect"); // for caps, optional mask

  // manual editor
  const [maskEdit, setMaskEdit] = useState<{ id: string; workingUrl: string; brush: number; mode: "erase" | "restore" } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  // Placeholder: until wallet integration is wired here, keep empty list (users can upload)
  const userNFTs: NFTData[] = [];

  /* ------------------------------ Layer helpers ----------------------------- */

  function addLayerFromSrc(src: string, label?: string) {
    const rect = containerRef.current?.getBoundingClientRect();
    // center inside printable area
    const cx = rect ? rect.width * (product.area.x + product.area.w / 2) : 300;
    const cy = rect ? rect.height * (product.area.y + product.area.h / 2) : 300;
    const id = uid();
    const l: Layer = {
      id, src, label, x: cx, y: cy, scale: 0.6, rotation: 0,
      removeBg: { enabled: false, color: "#87ceeb", tol: 50, soft: 20, protectDark: true },
    };
    setLayers((p) => [...p, l]);
    setSelectedId(id);
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const src = URL.createObjectURL(f);
    addLayerFromSrc(src, f.name);
    e.currentTarget.value = "";
  }

  async function removeBgAI(layerId: string) {
    setLayers((prev) => prev.map((l) => (l.id === layerId ? { ...l, removing: true } : l)));
    try {
      const mod = await import("@imgly/background-removal");
      const removeBackground = (mod as any).removeBackground as (
        src: string | HTMLImageElement,
        opts?: Record<string, unknown>
      ) => Promise<Blob>;

      const layer = layers.find((l) => l.id === layerId);
      if (!layer) return;

      const blob = await removeBackground(layerSrc(layer), {
        publicPath: "https://cdn.jsdelivr.net/npm/@imgly/background-removal@2.3.3/dist/",
      });
      const url = URL.createObjectURL(blob);
      setLayers((prev) => prev.map((l) => (l.id === layerId ? { ...l, srcEdited: url, srcProcessed: undefined } : l)));
    } catch (e) {
      console.error("[merch] removeBg AI error", e);
      alert("Background removal failed. See console for details.");
    } finally {
      setLayers((prev) => prev.map((l) => (l.id === layerId ? { ...l, removing: false } : l)));
    }
  }

  /* ----------------------- Soft-key (preview processing) -------------------- */

  useEffect(() => {
    let cancelled = false;

    async function maybeProcess(l: Layer) {
      // If manual edit exists, prefer it and clear auto cache
      if (l.srcEdited) {
        if (l.srcProcessed || l._procKey) {
          setLayers((p) => p.map(x => x.id === l.id ? { ...x, srcProcessed: undefined, _procKey: undefined } : x));
        }
        return;
      }
      if (!l.removeBg?.enabled) {
        if (l.srcProcessed || l._procKey) {
          setLayers((p) => p.map(x => x.id === l.id ? { ...x, srcProcessed: undefined, _procKey: undefined } : x));
        }
        return;
      }

      const key = removeKeySignature(l);
      if (l._procKey === key && l.srcProcessed) return;

      try {
        const keys = (l.removeBg.colors?.length ? l.removeBg.colors : [l.removeBg.color || "#87ceeb"]);
        const processed = keys.length > 1
          ? await colorKeySoftMulti(l.src, keys, l.removeBg.tol, l.removeBg.soft, !!l.removeBg.protectDark)
          : await colorKeySoft(l.src, keys[0], l.removeBg.tol, l.removeBg.soft, !!l.removeBg.protectDark);
        if (!cancelled) {
          setLayers((p) => p.map(x => x.id === l.id ? { ...x, srcProcessed: processed, _procKey: key } : x));
        }
      } catch {
        // CORS or load errors — ignore (fall back to original)
      }
    }

    const t = setTimeout(() => { layers.forEach(maybeProcess); }, 60);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(layers.map(l => ({
    id: l.id,
    src: l.src,
    edited: !!l.srcEdited,
    r: l.removeBg ? [l.removeBg.enabled, (l.removeBg.colors && l.removeBg.colors.join(",")) || l.removeBg.color, l.removeBg.tol, l.removeBg.soft, l.removeBg.protectDark] : null,
  })))]);

  /* --------------------------------- Export -------------------------------- */

  async function exportPNG() {
    setExporting(true);
    try {
      // High-res render for clean print previews
      const baseH = 1600;
      const baseW = Math.round(baseH * product.aspect);

      const garment = await loadImage(product.src);
      const c = document.createElement("canvas");
      c.width = baseW; c.height = baseH;
      const ctx = c.getContext("2d")!;

      // draw garment first
      ctx.drawImage(garment, 0, 0, baseW, baseH);

      // compute print area in px
      const area = {
        x: product.area.x * baseW,
        y: product.area.y * baseH,
        w: product.area.w * baseW,
        h: product.area.h * baseH,
      };

      // optional circle mask (e.g., for caps)
      if (shape === "circle") {
        ctx.save();
        ctx.beginPath();
        const r = Math.min(area.w, area.h) / 2;
        ctx.arc(area.x + area.w / 2, area.y + area.h / 2, r, 0, Math.PI * 2);
        ctx.clip();
      } else {
        ctx.save();
        ctx.beginPath();
        ctx.rect(area.x, area.y, area.w, area.h);
        ctx.clip();
      }

      // map preview coords -> export coords
      const previewRect = containerRef.current!.getBoundingClientRect();
      const scaleX = baseW / previewRect.width;
      const scaleY = baseH / previewRect.height;

      // draw each layer
      for (const l of layers) {
        let src = layerSrc(l);
        if (!l.srcEdited && l.removeBg?.enabled && !l.srcProcessed) {
          const keys = (l.removeBg.colors?.length ? l.removeBg.colors : [l.removeBg?.color || "#87ceeb"]);
          src = keys.length > 1
            ? await colorKeySoftMulti(l.src, keys, l.removeBg.tol, l.removeBg.soft, !!l.removeBg.protectDark)
            : await colorKeySoft(l.src, keys[0], l.removeBg.tol, l.removeBg.soft, !!l.removeBg.protectDark);
        }
        const img = await loadImage(src);
        const px = l.x * scaleX;
        const py = l.y * scaleY;
        const targetH = area.h * l.scale;
        const targetW = (img.width / img.height) * targetH;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate((l.rotation * Math.PI) / 180);
        ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
        ctx.restore();
      }

      ctx.restore();

      const url = c.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${product.label.replace(/\s+/g, "-").toLowerCase()}.png`;
      a.click();
    } finally {
      setExporting(false);
    }
  }

  /* ------------------------------ Pointer drag ------------------------------ */

  function onPointerDown(e: React.PointerEvent, id: string) {
    const l = layers.find((x) => x.id === id);
    if (!l) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setSelectedId(id);
    dragRef.current = { id, startX: e.clientX, startY: e.clientY, origX: l.x, origY: l.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    setLayers((prev) => prev.map((l) => (l.id === d.id ? { ...l, x: d.origX + dx, y: d.origY + dy } : l)));
  }
  function onPointerUp(e: React.PointerEvent) {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    dragRef.current = null;
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

  const selected = layers.find((l) => l.id === selectedId) || null;

  /* --------------------------------- Render -------------------------------- */

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">
        <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Merch Designer</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
        {/* Left: preview */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="text-sm">Shape mask:</div>
            <Button size="sm" variant={shape === "rect" ? "default" : "outline"} onClick={() => setShape("rect")}>
              <Square className="w-4 h-4 mr-2" /> Rect
            </Button>
            <Button size="sm" variant={shape === "circle" ? "default" : "outline"} onClick={() => setShape("circle")}>
              <CircleIcon className="w-4 h-4 mr-2" /> Circle
            </Button>

            <label className="inline-flex items-center gap-2 ml-auto">
              <Upload className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
              <span className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 cursor-pointer">Upload image</span>
            </label>

            <Button variant="outline" className="border-gray-700" onClick={exportPNG} disabled={exporting}>
              <Download className="w-4 h-4 mr-2" />
              {exporting ? "Exporting..." : "Export PNG"}
            </Button>
          </div>

          <div
            ref={containerRef}
            className="relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden select-none"
            style={{ aspectRatio: product.aspect.toString() }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {/* garment */}
            <img src={product.src} alt={product.label} className="absolute inset-0 w-full h-full object-contain" />

            {/* print area guide */}
            <div
              className="absolute border border-dashed border-white/30 pointer-events-none rounded-md"
              style={{
                left: `${product.area.x * 100}%`,
                top: `${product.area.y * 100}%`,
                width: `${product.area.w * 100}%`,
                height: `${product.area.h * 100}%`,
                borderRadius: shape === "circle" ? "9999px" : "0.5rem",
              }}
            />

            {/* layers (processed/edited when available) */}
            {layers.map((l) => (
              <img
                key={l.id}
                src={layerSrc(l)}
                alt={l.label || "layer"}
                className={`absolute cursor-grab ${selectedId === l.id ? "ring-2 ring-yellow-400" : ""}`}
                style={{
                  left: l.x,
                  top: l.y,
                  transformOrigin: "center",
                  transform: `translate(-50%,-50%) rotate(${l.rotation}deg) scale(${l.scale})`,
                  maxWidth: `${product.area.w * 100}%`,
                  maxHeight: `${product.area.h * 100}%`,
                }}
                onPointerDown={(e) => onPointerDown(e, l.id)}
                draggable={false}
              />
            ))}
          </div>
        </div>

        {/* Right: controls */}
        <div className="space-y-6">
          {/* Product picker */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="font-semibold mb-3">Product</div>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {(Object.values(PRODUCTS) as Product[]).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProductId(p.id)}
                    className={`text-left p-2 rounded-lg border ${
                      productId === p.id ? "border-yellow-500 bg-yellow-500/10" : "border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    <div className="aspect-square rounded-md overflow-hidden bg-gray-800 mb-2">
                      <img src={p.src} alt={p.label} className="w-full h-full object-contain" />
                    </div>
                    <div className="text-xs">{p.label}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Your NFTs (placeholder until wired) */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Your NFTs</div>
                <Badge variant="secondary" className="bg-gray-800">{userNFTs.length}</Badge>
              </div>
              {userNFTs.length === 0 ? (
                <div className="text-sm text-gray-400">Use “Upload image” above or pick from your wallet (coming soon here).</div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                  {userNFTs.map((n) => (
                    <button
                      key={`${n.tokenAddress}-${n.tokenId}`}
                      onClick={() => addLayerFromSrc(n.image, n.name)}
                      className="rounded-md overflow-hidden bg-gray-800 border border-gray-800 hover:border-yellow-500"
                      title={n.name}
                    >
                      <img src={n.image} alt={n.name} className="w-full h-full object-cover aspect-square" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Layers panel */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 font-semibold">
                <Layers className="w-4 h-4" /> Layers
              </div>
              {layers.length === 0 ? (
                <div className="text-sm text-gray-400">Add an NFT or upload an image to begin.</div>
              ) : (
                <div className="space-y-2">
                  {[...layers].reverse().map((l) => (
                    <div
                      key={l.id}
                      className={`flex items-center justify-between p-2 rounded-md border ${
                        selectedId === l.id ? "border-yellow-500 bg-yellow-500/10" : "border-gray-800"
                      }`}
                      onClick={() => setSelectedId(l.id)}
                    >
                      <div className="flex items-center gap-2">
                        <img src={layerSrc(l)} className="w-8 h-8 rounded object-cover" alt="" />
                        <div className="text-xs">{l.label || "Layer"}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            // send to front
                            setLayers((p) => {
                              const idx = p.findIndex((x) => x.id === l.id);
                              if (idx < 0) return p;
                              const copy = [...p];
                              const [it] = copy.splice(idx, 1);
                              copy.push(it);
                              return copy;
                            });
                          }}
                          title="Bring to front"
                        >
                          <Layers className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            const clone: Layer = { ...l, id: uid(), x: l.x + 24, y: l.y + 24 };
                            setLayers((p) => [...p, clone]);
                            setSelectedId(clone.id);
                          }}
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeBgAI(l.id);
                          }}
                          title="AI remove background"
                        >
                          {l.removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLayers((p) => p.filter((x) => x.id !== l.id));
                            if (selectedId === l.id) setSelectedId(null);
                          }}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected layer controls */}
          {selected && (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4 space-y-4">
                <div className="font-semibold mb-1">Layer Controls</div>

                <div>
                  <div className="text-xs mb-1">Scale</div>
                  <input
                    type="range" min={0.2} max={2.5} step={0.02}
                    value={selected.scale}
                    onChange={(e) => setLayers((p) => p.map((l) => (l.id === selected.id ? { ...l, scale: Number(e.target.value) } : l)))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="text-xs mb-1">Rotation</div>
                  <input
                    type="range" min={-180} max={180} step={1}
                    value={selected.rotation}
                    onChange={(e) => setLayers((p) => p.map((l) => (l.id === selected.id ? { ...l, rotation: Number(e.target.value) } : l)))}
                    className="w-full"
                  />
                </div>

                {/* Soft-key color removal */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!selected.removeBg?.enabled}
                      onChange={(e) =>
                        setLayers((p) =>
                          p.map((l) =>
                            l.id === selected.id
                              ? { ...l, removeBg: { ...(l.removeBg || { tol: 50, soft: 20, protectDark: true }), enabled: e.target.checked } }
                              : l,
                          ),
                        )
                      }
                    />
                    Remove background (soft-key)
                  </label>

                  {/* Palette */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs opacity-75">Key colors:</span>
                    {(
                      selected.removeBg?.colors?.length
                        ? selected.removeBg.colors
                        : [selected.removeBg?.color || "#87ceeb"]
                    ).map((hex, idx) => (
                      <button
                        key={hex + idx}
                        className="w-6 h-6 rounded border border-white/30"
                        style={{ background: hex }}
                        title={hex}
                        onClick={() => {
                          if (selected.removeBg?.colors?.length) {
                            setLayers(p => p.map(l => l.id === selected.id
                              ? { ...l, removeBg: { ...l.removeBg!, colors: l.removeBg!.colors!.filter((c, i) => !(c === hex && i === idx)) } }
                              : l));
                          }
                        }}
                      />
                    ))}

                    {/* add via color input */}
                    <label className="text-xs inline-flex items-center gap-1">
                      +
                      <input
                        type="color"
                        onChange={(e) => {
                          const hex = e.target.value;
                          setLayers(p => p.map(l => l.id === selected.id
                            ? {
                                ...l,
                                removeBg: {
                                  ...(l.removeBg || { enabled: true, tol: 50, soft: 20, protectDark: true }),
                                  colors: [...(l.removeBg?.colors || [l.removeBg?.color || "#87ceeb"]), hex],
                                  enabled: true,
                                },
                              }
                            : l));
                          (e.currentTarget as HTMLInputElement).value = "";
                        }}
                      />
                    </label>

                    {/* eyedropper add */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        eyeDropperPick((hex) =>
                          setLayers((p) =>
                            p.map((l) =>
                              l.id === selected.id
                                ? {
                                    ...l,
                                    removeBg: {
                                      ...(l.removeBg || { enabled: true, tol: 50, soft: 20, protectDark: true }),
                                      colors: [...(l.removeBg?.colors || [l.removeBg?.color || "#87ceeb"]), hex],
                                      enabled: true,
                                    },
                                  }
                                : l,
                            ),
                          ),
                        )
                      }
                    >
                      {EyeDropperIcon ? <EyeDropperIcon className="w-4 h-4 mr-2" /> : null} Add color
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="flex items-center gap-2 text-sm">
                      Tol
                      <Input
                        type="number" className="w-20 bg-gray-800 border-gray-700"
                        min={0} max={100}
                        value={selected.removeBg?.tol ?? 50}
                        onChange={(e) =>
                          setLayers((p) =>
                            p.map((l) =>
                              l.id === selected.id
                                ? { ...l, removeBg: { ...(l.removeBg || { enabled: true, soft: 20, protectDark: true }), tol: Number(e.target.value) || 50 } }
                                : l,
                            ),
                          )
                        }
                      />
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      Soft
                      <Input
                        type="number" className="w-20 bg-gray-800 border-gray-700"
                        min={0} max={100}
                        value={selected.removeBg?.soft ?? 20}
                        onChange={(e) =>
                          setLayers((p) =>
                            p.map((l) =>
                              l.id === selected.id
                                ? { ...l, removeBg: { ...(l.removeBg || { enabled: true, tol: 50, protectDark: true }), soft: Number(e.target.value) || 20 } }
                                : l,
                            ),
                          )
                        }
                      />
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!selected.removeBg?.protectDark}
                        onChange={(e) =>
                          setLayers((p) =>
                            p.map((l) =>
                              l.id === selected.id
                                ? { ...l, removeBg: { ...(l.removeBg || { enabled: true, tol: 50, soft: 20 }), protectDark: e.target.checked } }
                                : l,
                            ),
                          )
                        }
                      />
                      Protect dark lines
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      className="gap-2"
                      onClick={() => removeBgAI(selected.id)}
                      disabled={!!layers.find((l) => l.id === selected.id)?.removing}
                    >
                      {layers.find((l) => l.id === selected.id)?.removing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4" />
                      )}
                      AI Background removal
                    </Button>
                  </div>
                </div>

                {/* Manual brush editor */}
                <div className="border border-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-semibold">Manual touch-up</span>
                    <Button size="sm" variant={maskEdit?.mode === "erase" ? "default" : "outline"}
                      onClick={() => setMaskEdit(m => ({ id: selected.id, workingUrl: layerSrc(selected), brush: m?.brush ?? 24, mode: "erase" }))}>Erase</Button>
                    <Button size="sm" variant={maskEdit?.mode === "restore" ? "default" : "outline"}
                      onClick={() => setMaskEdit(m => ({ id: selected.id, workingUrl: m?.workingUrl ?? layerSrc(selected), brush: m?.brush ?? 24, mode: "restore" }))}>Restore</Button>
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-xs">Brush</span>
                      <input
                        type="range" min={4} max={80} step={1}
                        value={maskEdit?.brush ?? 24}
                        onChange={(e) => setMaskEdit(m => m ? { ...m, brush: Number(e.target.value) } : { id: selected.id, workingUrl: layerSrc(selected), brush: Number(e.target.value), mode: "erase" })}
                      />
                    </div>
                  </div>

                  {maskEdit && maskEdit.id === selected.id ? (
                    <>
                      <MaskCanvas
                        url={maskEdit.workingUrl}
                        origUrl={selected.src}
                        mode={maskEdit.mode}
                        size={512}
                        brush={maskEdit.brush}
                        onChange={(nextUrl) => setMaskEdit(m => m && ({ ...m, workingUrl: nextUrl }))}
                      />
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            const finalUrl = maskEdit.workingUrl;
                            setLayers(p => p.map(l => l.id === selected.id ? { ...l, srcEdited: finalUrl } : l));
                            setMaskEdit(null);
                          }}>Apply</Button>
                        <Button size="sm" variant="outline"
                          onClick={() => {
                            setLayers(p => p.map(l => l.id === selected.id ? { ...l, srcEdited: undefined } : l));
                            setMaskEdit(null);
                          }}>Reset manual</Button>
                        <Button size="sm" variant="ghost" onClick={() => setMaskEdit(null)}>Close</Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-400">Click Erase/Restore to open the mini editor.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
