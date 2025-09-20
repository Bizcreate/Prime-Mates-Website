"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Download, Layers, Trash2, Upload, Wand2, Loader2, Scissors,
  Square, Circle as CircleIcon, Copy, Search, Shirt, ShoppingBag,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* PAGE WRAPPER: Tabs                                                         */
/* -------------------------------------------------------------------------- */
export default function MerchPage() {
  const [tab, setTab] = useState<"shop" | "designer">("shop");
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-extrabold mb-2 text-center tracking-tight">
        <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
          MERCH
        </span>
      </h1>
      <p className="text-center text-gray-300 max-w-3xl mx-auto mb-8">
        Buy preset WooCommerce products or design your own. (NFT mint option can be added with thirdweb.)
      </p>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
        <TabsList className="mb-6 flex justify-center gap-2">
          <TabsTrigger value="shop" className="gap-2"><ShoppingBag className="h-4 w-4" /> Shop</TabsTrigger>
          <TabsTrigger value="designer" className="gap-2"><Shirt className="h-4 w-4" /> Design your own</TabsTrigger>
        </TabsList>

        <TabsContent value="shop">
          <PresetMerchShop onCustomize={() => setTab("designer")} />
        </TabsContent>

        <TabsContent value="designer">
          <MerchDesigner />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SHOP TAB: Woo products via /api/woo/products                               */
/* -------------------------------------------------------------------------- */

type WooImage = { id: number; src: string; alt?: string };
type WooCategory = { id: number; name: string; slug: string };
type WooProduct = {
  id: number;
  name: string;
  permalink: string;
  price_html?: string;
  images?: WooImage[];
  categories?: WooCategory[];
};

function PresetMerchShop({ onCustomize }: { onCustomize: () => void }) {
  const [products, setProducts] = useState<WooProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string>("All Products");
  const perPage = 24;

  useEffect(() => {
    let abort = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams({ page: String(page), per_page: String(perPage) });
        if (search.trim()) qs.set("search", search.trim());
        const res = await fetch(`/api/woo/products?${qs.toString()}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Woo fetch failed");
        if (!abort) setProducts(Array.isArray(json.products) ? json.products : []);
      } catch (e: any) {
        if (!abort) setError(e?.message ?? "Unknown error");
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, [page, perPage, search]);

  // Build category list from loaded page (quick + client-side)
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) for (const c of p.categories || []) set.add(c.name);
    return ["All Products", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const filtered = useMemo(() => {
    if (activeCat === "All Products") return products;
    return products.filter(p => p.categories?.some(c => c.name === activeCat));
  }, [products, activeCat]);

  const showPrimer = !loading && !error && filtered.length === 0;

  return (
    <div>
      {error && (
        <div className="max-w-3xl mx-auto mb-6 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm">
          WooCommerce error: {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-3 py-1 rounded-full border ${
              activeCat === cat
                ? "bg-yellow-500 text-black border-yellow-500"
                : "border-yellow-600/40 text-yellow-300 hover:bg-yellow-500/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-6 flex">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
          <Input
            className="pl-9 bg-gray-900 border-gray-800"
            placeholder="Search products…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(loading ? Array.from({ length: 6 }) : filtered).map((p: any, idx: number) => (
          <Card key={loading ? idx : p.id} className="bg-gray-900 border-gray-800 hover:border-yellow-600/40 transition">
            <CardContent className="p-4">
              <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center mb-3">
                {loading ? (
                  <div className="w-16 h-16 rounded-full border-2 border-gray-700 border-t-transparent animate-spin" />
                ) : p.images?.[0]?.src ? (
                  <img src={p.images[0].src} alt={p.images[0].alt || p.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="text-xs opacity-60">No image</div>
                )}
              </div>

              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="font-semibold line-clamp-2">{loading ? "Loading…" : p.name}</div>
                {!loading && p.categories?.[0]?.name && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-600/40">
                    {p.categories[0].name}
                  </span>
                )}
              </div>

              {!loading && (
                <div className="text-sm text-yellow-300 mb-3" dangerouslySetInnerHTML={{ __html: p.price_html || "" }} />
              )}

              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <a href={loading ? "#" : p.permalink} target="_blank" rel="noreferrer">Buy</a>
                </Button>
                <Button variant="outline" className="whitespace-nowrap" onClick={() => {
                  onCustomize();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}>
                  Customize
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showPrimer && (
        <div className="mt-6 rounded-md border border-yellow-700/30 bg-yellow-500/5 p-3 text-sm text-yellow-200">
          No WooCommerce products returned. Open <code>/api/woo/products</code> in your browser to see the raw JSON/error.
        </div>
      )}

      {/* Pager */}
      <div className="flex justify-center gap-2 mt-8">
        <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
        <span className="px-3 py-2 text-sm opacity-70">Page {page}</span>
        <Button variant="outline" onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DESIGNER TAB (front/back in one product, overlays, AI remove bg)           */
/* -------------------------------------------------------------------------- */

type Layer = {
  id: string; src: string; label?: string; x: number; y: number; scale: number; rotation: number;
  removing?: boolean; srcProcessed?: string; srcEdited?: string;
};

type Side = "front" | "back";
type ProductBaseId = "tee-black" | "tee-white" | "hoodie-black" | "hoodie-white" | "cap-black";
type ProductBase = {
  id: ProductBaseId; label: string; aspect: number;
  area: { x: number; y: number; w: number; h: number };
  sides: { front: string; back: string };
};

const PRODUCTS: Record<ProductBaseId, ProductBase> = {
  "tee-black":   { id:"tee-black",   label:"T-Shirt Black",  aspect:1,   area:{ x:0.18, y:0.24, w:0.64, h:0.50 }, sides:{ front:"/merch/tshirt_black_front.png",  back:"/merch/tshirt_black_back.png" } },
  "tee-white":   { id:"tee-white",   label:"T-Shirt White",  aspect:1,   area:{ x:0.18, y:0.24, w:0.64, h:0.50 }, sides:{ front:"/merch/tshirt_white_front.png",  back:"/merch/tshirt_white_back.png" } },
  "hoodie-black":{ id:"hoodie-black",label:"Hoodie Black",   aspect:0.8, area:{ x:0.22, y:0.28, w:0.56, h:0.48 }, sides:{ front:"/merch/hoodie_black_front.png", back:"/merch/hoodie_black_back.png" } },
  "hoodie-white":{ id:"hoodie-white",label:"Hoodie White",   aspect:0.8, area:{ x:0.22, y:0.28, w:0.56, h:0.48 }, sides:{ front:"/merch/hoodie_white_front.png", back:"/merch/hoodie_white_back.png" } },
  "cap-black":   { id:"cap-black",   label:"Cap Black",      aspect:1,   area:{ x:0.30, y:0.30, w:0.40, h:0.30 }, sides:{ front:"/merch/cap_black_front.png",    back:"/merch/cap_black_back.png" } },
};

function MerchDesigner() {
  const [productBaseId, setProductBaseId] = useState<keyof typeof PRODUCTS>("tee-black");
  const [side, setSide] = useState<Side>("front");
  const product = PRODUCTS[productBaseId];
  const garmentSrc = product.sides[side];
  const area = product.area;

  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [shape, setShape] = useState<"rect" | "circle">("rect");

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  function uid() { return Math.random().toString(36).slice(2); }
  async function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image(); img.crossOrigin = "anonymous";
      img.onload = () => resolve(img); img.onerror = reject; img.src = encodeURI(src);
    });
  }
  function layerSrc(l: Layer) { return l.srcEdited || l.srcProcessed || l.src; }

  function addLayerFromSrc(src: string, label?: string) {
    const rect = containerRef.current?.getBoundingClientRect();
    const cx = rect ? rect.width * (area.x + area.w / 2) : 300;
    const cy = rect ? rect.height * (area.y + area.h / 2) : 300;
    const id = uid();
    setLayers((p) => [...p, { id, src, label, x: cx, y: cy, scale: 0.6, rotation: 0 }]);
    setSelectedId(id);
  }
  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    addLayerFromSrc(URL.createObjectURL(f), f.name); e.currentTarget.value = "";
  }
  async function removeBgAI(layerId: string) {
    setLayers((prev) => prev.map((l) => (l.id === layerId ? { ...l, removing: true } : l)));
    try {
      const mod = await import("@imgly/background-removal");
      const fn = (mod as any).removeBackground as (src: string | HTMLImageElement, opts?: any) => Promise<Blob>;
      const layer = layers.find((l) => l.id === layerId); if (!layer) return;
      const blob = await fn(layerSrc(layer), {
        publicPath: "https://cdn.jsdelivr.net/npm/@imgly/background-removal@2.3.3/dist/",
      });
      const url = URL.createObjectURL(blob);
      setLayers((prev) => prev.map((l) => (l.id === layerId ? { ...l, srcEdited: url, srcProcessed: undefined } : l)));
    } catch (e) {
      console.error("[designer] removeBg error", e);
      alert("Background removal failed.");
    } finally {
      setLayers((prev) => prev.map((l) => (l.id === layerId ? { ...l, removing: false } : l)));
    }
  }

  async function exportPNG() {
    setExporting(true);
    try {
      const baseH = 1600;
      const baseW = Math.round(baseH * (product.aspect ?? 1));
      const garment = await loadImage(garmentSrc);
      const c = document.createElement("canvas"); c.width = baseW; c.height = baseH;
      const ctx = c.getContext("2d")!;

      ctx.drawImage(garment, 0, 0, baseW, baseH);

      const exportArea = { x: area.x * baseW, y: area.y * baseH, w: area.w * baseW, h: area.h * baseH };
      ctx.save();
      if (shape === "circle") {
        ctx.beginPath();
        const r = Math.min(exportArea.w, exportArea.h) / 2;
        ctx.arc(exportArea.x + exportArea.w / 2, exportArea.y + exportArea.h / 2, r, 0, Math.PI * 2);
        ctx.clip();
      } else {
        ctx.beginPath(); ctx.rect(exportArea.x, exportArea.y, exportArea.w, exportArea.h); ctx.clip();
      }

      const previewRect = containerRef.current!.getBoundingClientRect();
      const scaleX = baseW / previewRect.width, scaleY = baseH / previewRect.height;

      for (const l of layers) {
        const img = await loadImage(layerSrc(l));
        const px = l.x * scaleX, py = l.y * scaleY;
        const targetH = exportArea.h * l.scale;
        const targetW = (img.width / img.height) * targetH;
        ctx.save(); ctx.translate(px, py); ctx.rotate((l.rotation * Math.PI) / 180);
        ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
        ctx.restore();
      }

      ctx.restore();
      const url = c.toDataURL("image/png");
      const a = document.createElement("a"); a.href = url;
      a.download = `${product.label.replace(/\s+/g, "-").toLowerCase()}-${side}.png`;
      a.click();
    } finally { setExporting(false); }
  }

  function onPointerDown(e: React.PointerEvent, id: string) {
    const l = layers.find((x) => x.id === id); if (!l) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setSelectedId(id);
    dragRef.current = { id, startX: e.clientX, startY: e.clientY, origX: l.x, origY: l.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current; if (!d) return;
    const dx = e.clientX - d.startX, dy = e.clientY - d.startY;
    setLayers(prev => prev.map(l => l.id === d.id ? { ...l, x: d.origX + dx, y: d.origY + dy } : l));
  }
  function onPointerUp(e: React.PointerEvent) {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId); dragRef.current = null;
  }

  const selected = layers.find((l) => l.id === selectedId) || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
      {/* Left: preview */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="text-sm">{product.label}</div>

          {/* side toggle */}
          <div className="ml-2 inline-flex rounded-lg overflow-hidden border border-gray-800">
            <button className={`px-3 py-1 text-sm ${side === "front" ? "bg-yellow-500 text-black" : "bg-gray-900 text-gray-300"}`} onClick={() => setSide("front")}>Front</button>
            <button className={`px-3 py-1 text-sm ${side === "back" ? "bg-yellow-500 text-black" : "bg-gray-900 text-gray-300"}`} onClick={() => setSide("back")}>Back</button>
          </div>

          {/* mask */}
          <div className="ml-4 flex items-center gap-2">
            <Button size="sm" variant={shape === "rect" ? "default" : "outline"} onClick={() => setShape("rect")}>
              <Square className="w-4 h-4 mr-2" /> Rect
            </Button>
            <Button size="sm" variant={shape === "circle" ? "default" : "outline"} onClick={() => setShape("circle")}>
              <CircleIcon className="w-4 h-4 mr-2" /> Circle
            </Button>
          </div>

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
          style={{ aspectRatio: String(product.aspect) }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {/* garment */}
          <img src={garmentSrc} alt={`${product.label} (${side})`} className="absolute inset-0 w-full h-full object-contain" />

          {/* print area */}
          <div
            className="absolute border border-dashed border-white/30 pointer-events-none rounded-md"
            style={{
              left: `${area.x * 100}%`, top: `${area.y * 100}%`,
              width: `${area.w * 100}%`, height: `${area.h * 100}%`,
              borderRadius: shape === "circle" ? "9999px" : "0.5rem",
            }}
          />

          {/* layers */}
          {layers.map((l) => (
            <img
              key={l.id}
              src={layerSrc(l)}
              alt={l.label || "layer"}
              className={`absolute cursor-grab ${selectedId === l.id ? "ring-2 ring-yellow-400" : ""}`}
              style={{
                left: l.x, top: l.y, transformOrigin: "center",
                transform: `translate(-50%,-50%) rotate(${l.rotation}deg) scale(${l.scale})`,
                maxWidth: `${area.w * 100}%`, maxHeight: `${area.h * 100}%`,
              }}
              onPointerDown={(e) => onPointerDown(e, l.id)}
              draggable={false}
            />
          ))}
        </div>
      </div>

      {/* Right controls */}
      <div className="space-y-6">
        {/* Product picker */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="font-semibold mb-3">Product</div>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {Object.values(PRODUCTS).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProductBaseId(p.id)}
                  className={`text-left p-2 rounded-lg border ${productBaseId === p.id ? "border-yellow-500 bg-yellow-500/10" : "border-gray-800 hover:border-gray-700"}`}
                  title={p.label}
                >
                  <div className="aspect-square rounded-md overflow-hidden bg-gray-800 mb-2 flex">
                    <img src={p.sides.front} alt={p.label} className="m-auto w-full h-full object-contain" />
                  </div>
                  <div className="text-xs">{p.label}</div>
                </button>
              ))}
            </div>

            <div className="mt-3">
              <div className="text-xs text-gray-400 mb-1">Side</div>
              <div className="inline-flex rounded-lg overflow-hidden border border-gray-800">
                <button className={`px-3 py-1 text-sm ${side === "front" ? "bg-yellow-500 text-black" : "bg-gray-900 text-gray-300"}`} onClick={() => setSide("front")}>Front</button>
                <button className={`px-3 py-1 text-sm ${side === "back" ? "bg-yellow-500 text-black" : "bg-gray-900 text-gray-300"}`} onClick={() => setSide("back")}>Back</button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layers */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 font-semibold">
              <Layers className="w-4 h-4" /> Layers
            </div>
            {layers.length === 0 ? (
              <div className="text-sm text-gray-400">Upload an image to begin.</div>
            ) : (
              <div className="space-y-2">
                {[...layers].reverse().map((l) => (
                  <div
                    key={l.id}
                    className={`flex items-center justify-between p-2 rounded-md border ${selectedId === l.id ? "border-yellow-500 bg-yellow-500/10" : "border-gray-800"}`}
                    onClick={() => setSelectedId(l.id)}
                  >
                    <div className="flex items-center gap-2">
                      <img src={layerSrc(l)} className="w-8 h-8 rounded object-cover" alt="" />
                      <div className="text-xs">{l.label || "Layer"}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white" title="Bring to front" onClick={(e) => {
                        e.stopPropagation();
                        setLayers((p) => {
                          const idx = p.findIndex((x) => x.id === l.id);
                          if (idx < 0) return p;
                          const copy = [...p]; const [it] = copy.splice(idx, 1); copy.push(it);
                          return copy;
                        });
                      }}>
                        <Layers className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white" title="Duplicate" onClick={(e) => {
                        e.stopPropagation();
                        const clone: Layer = { ...l, id: Math.random().toString(36).slice(2), x: l.x + 24, y: l.y + 24 };
                        setLayers((p) => [...p, clone]); setSelectedId(clone.id);
                      }}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white" title="AI remove background" onClick={(e) => { e.stopPropagation(); removeBgAI(l.id); }}>
                        {l.removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white" title="Delete" onClick={(e) => {
                        e.stopPropagation(); setLayers((p) => p.filter((x) => x.id !== l.id)); if (selectedId === l.id) setSelectedId(null);
                      }}>
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
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => selected && removeBgAI(selected.id)}
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
