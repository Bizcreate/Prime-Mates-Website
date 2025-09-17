"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ImagePlus,
  Download,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Scissors,
  RotateCcw,
} from "lucide-react";

/** Minimal NFT shape we accept from the page */
type NFTLike = { tokenId?: string | number; name?: string; image?: string };

/** Draggable/transformable layer */
type Layer = {
  id: string;
  name: string;
  src: string;
  x: number; // px offsets in preview
  y: number;
  scale: number; // relative to baseline
  rotation: number; // deg
  removing?: boolean;
};

function uid() {
  return Math.random().toString(36).slice(2);
}

const PRODUCTS = {
  tee_black: {
    label: "T-Shirt • Black",
    sides: {
      front: "/merch/tee_black_front.png",
      back: "/merch/tee_black_back.png",
    },
    print: { w: 4500, h: 5400 },
    previewAspect: "aspect-[9/11]",
  },
  tee_white: {
    label: "T-Shirt • White",
    sides: {
      front: "/merch/tee_white_front.png",
      back: "/merch/tee_white_back.png",
    },
    print: { w: 4500, h: 5400 },
    previewAspect: "aspect-[9/11]",
  },
  hoodie_black: {
    label: "Hoodie • Black",
    sides: {
      front: "/merch/hoodie_black_front.png",
      back: "/merch/hoodie_black_back.png",
    },
    print: { w: 4500, h: 5400 },
    previewAspect: "aspect-[9/11]",
  },
  hoodie_white: {
    label: "Hoodie • White",
    sides: {
      front: "/merch/hoodie_white_front.png",
      back: "/merch/hoodie_white_back.png",
    },
    print: { w: 4500, h: 5400 },
    previewAspect: "aspect-[9/11]",
  },
  cap_black: {
    label: "Cap • Black",
    sides: {
      front: "/merch/cap_black_front.png",
      back: "/merch/cap_black_back.png",
    },
    print: { w: 3000, h: 1500 },
    previewAspect: "aspect-[3/2]",
  },
} as const;

type ProductId = keyof typeof PRODUCTS;
type Side = "front" | "back";

export default function MerchDesigner({ userNFTs = [] }: { userNFTs?: NFTLike[] }) {
  // product selection
  const [product, setProduct] = useState<ProductId>("tee_black");
  const [side, setSide] = useState<Side>("front");

  // composition state
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [artComposite, setArtComposite] = useState<string>("");

  // drag state
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; ox: number; oy: number } | null>(null);

  // canvas for export
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const spec = PRODUCTS[product];
  const mockupSrc = spec.sides[side];

  /* --------------------------------- helpers -------------------------------- */

  function addImageLayer(src: string, name = "Image") {
    const id = uid();
    setLayers((prev) => [...prev, { id, name, src, x: 0, y: 0, scale: 1, rotation: 0 }]);
    setSelectedId(id);
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    addImageLayer(URL.createObjectURL(file), file.name);
    e.target.value = "";
  }

  function duplicate(id: string) {
    setLayers((prev) => {
      const l = prev.find((x) => x.id === id);
      if (!l) return prev;
      const copy: Layer = { ...l, id: uid(), name: `${l.name} (copy)`, x: l.x + 20, y: l.y + 20 };
      return [...prev, copy];
    });
  }

  function remove(id: string) {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function moveZ(id: string, dir: "up" | "down") {
    setLayers((prev) => {
      const i = prev.findIndex((l) => l.id === id);
      if (i === -1) return prev;
      const j = dir === "up" ? i + 1 : i - 1;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function removeBg(id: string) {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, removing: true } : l)));
    try {
      // @ts-ignore optional dependency
      const mod = await import("@imgly/background-removal").catch(() => null);
      if (!mod?.removeBackground) {
        alert("Background removal lib missing. Install: pnpm add @imgly/background-removal");
        return;
      }
      const target = layers.find((l) => l.id === id);
      if (!target) return;
      const blob: Blob = await mod.removeBackground(target.src);
      const url = URL.createObjectURL(blob);
      setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, src: url } : l)));
    } catch (e) {
      console.error(e);
      alert("Background removal failed.");
    } finally {
      setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, removing: false } : l)));
    }
  }

  function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
    const r = Math.max(w / img.width, h / img.height);
    const nw = img.width * r;
    const nh = img.height * r;
    ctx.drawImage(img, (w - nw) / 2, (h - nh) / 2, nw, nh);
  }

  /* ------------------------------ interactions ----------------------------- */

  function startDrag(e: React.MouseEvent<HTMLDivElement>) {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;

    // top-most first
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i];
      const hit = Math.abs(cx - l.x) < rect.width * 0.2 && Math.abs(cy - l.y) < rect.height * 0.2;
      if (hit) {
        setSelectedId(l.id);
        dragRef.current = { id: l.id, startX: e.clientX, startY: e.clientY, ox: l.x, oy: l.y };
        break;
      }
    }
  }

  function onDrag(e: React.MouseEvent<HTMLDivElement>) {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    setLayers((prev) => prev.map((l) => (l.id === d.id ? { ...l, x: d.ox + dx, y: d.oy + dy } : l)));
  }

  function endDrag() {
    dragRef.current = null;
  }

  /* --------------------------------- export -------------------------------- */

  // Export the mockup (product + layers) at preview scale
  async function exportMockup() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    // set an OK size for previews
    const W = 1200;
    const H = Math.round(W * (spec.print.h / spec.print.w));
    canvas.width = W;
    canvas.height = H;

    try {
      const mock = await loadImage(mockupSrc);
      drawCover(ctx, mock, W, H);

      for (const l of layers) {
        const img = await loadImage(l.src);
        const base = Math.min(W, H) * 0.65; // relative size on product
        const drawH = base * l.scale;
        const drawW = (img.width / img.height) * drawH;
        const cx = W / 2 + (l.x / 300) * W;
        const cy = H / 2 + (l.y / 300) * H;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((l.rotation * Math.PI) / 180);
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }

      if (title.trim()) {
        ctx.font = `700 ${Math.round(H * 0.05)}px Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.lineWidth = 4;
        ctx.strokeText(title, W / 2, H - 24);
        ctx.fillText(title, W / 2, H - 24);
      }

      setArtComposite(canvas.toDataURL("image/png"));
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `${PRODUCTS[product].label.replace(/\s+/g, "_").toLowerCase()}_${side}.png`;
      a.click();
    } catch (e) {
      console.error("exportMockup failed", e);
      alert("Export failed.");
    }
  }

  // Export a high-res print file (art only, transparent background)
  async function exportPrintFile() {
    const { w, h } = spec.print;
    const canvas = canvasRef.current || document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);

    try {
      for (const l of layers) {
        const img = await loadImage(l.src);
        const base = Math.min(w, h) * 0.65; // print area
        const drawH = base * l.scale;
        const drawW = (img.width / img.height) * drawH;
        const cx = w / 2 + (l.x / 300) * w;
        const cy = h / 2 + (l.y / 300) * h;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((l.rotation * Math.PI) / 180);
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }

      if (title.trim()) {
        ctx.font = `700 ${Math.round(h * 0.07)}px Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = "#000";
        ctx.fillText(title, w / 2, h - Math.round(h * 0.05));
      }

      setArtComposite(canvas.toDataURL("image/png"));
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `print_${product}_${side}_${w}x${h}.png`;
      a.click();
    } catch (e) {
      console.error("exportPrintFile failed", e);
      alert("Export failed.");
    }
  }

  /* --------------------------------- render -------------------------------- */

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Controls */}
      <div className="space-y-6">
        {/* Product picker */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-amber-400">1) Choose Product</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.keys(PRODUCTS).map((id) => {
              const pid = id as ProductId;
              const active = product === pid;
              return (
                <Card
                  key={id}
                  className={`cursor-pointer border transition ${active ? "border-yellow-500 bg-yellow-500/10" : "border-gray-800 bg-gray-900 hover:border-yellow-500"}`}
                  onClick={() => setProduct(pid)}
                >
                  <CardContent className="p-4">
                    <div className={`${PRODUCTS[pid].previewAspect} rounded-lg overflow-hidden bg-gray-800 mb-3`}>
                      <img
                        src={PRODUCTS[pid].sides.front}
                        alt={PRODUCTS[pid].label}
                        className="w-full h-full object-contain"
                        onError={(e) => ((e.target as HTMLImageElement).src = "/prime-mates-nft.jpg")}
                      />
                    </div>
                    <div className={`text-sm font-semibold ${active ? "text-yellow-400" : ""}`}>{PRODUCTS[pid].label}</div>
                    <div className="text-xs text-gray-400">{PRODUCTS[pid].print.w}×{PRODUCTS[pid].print.h} print area</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              variant={side === "front" ? "default" : "outline"}
              onClick={() => setSide("front")}
              className={side === "front" ? "bg-yellow-500 text-black" : "border-gray-700 text-gray-200"}
            >
              Front
            </Button>
            <Button
              variant={side === "back" ? "default" : "outline"}
              onClick={() => setSide("back")}
              className={side === "back" ? "bg-yellow-500 text-black" : "border-gray-700 text-gray-200"}
            >
              Back
            </Button>
          </div>
        </div>

        {/* Add art */}
        <div>
          <h3 className="text-xl font-bold mb-2 text-purple-400">2) Add Art</h3>
          <div className="flex items-center gap-3 mb-3">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 cursor-pointer">
              <ImagePlus className="w-4 h-4" />
              <span>Upload image</span>
              <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
            </label>
            <span className="text-sm text-gray-400">or click any NFT below</span>
          </div>

          {userNFTs?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-56 overflow-y-auto">
              {userNFTs.map((nft, i) => (
                <Card
                  key={`${nft.tokenId ?? i}-${nft.name ?? "nft"}`}
                  className="cursor-pointer bg-gray-900 border-gray-800 hover:border-purple-500"
                  onClick={() => addImageLayer(nft.image || "/prime-mates-nft.jpg", nft.name || `NFT #${nft.tokenId}`)}
                >
                  <CardContent className="p-3">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-800">
                      <img
                        src={nft.image || "/prime-mates-nft.jpg"}
                        alt={nft.name || "NFT"}
                        className="w-full h-full object-cover"
                        onError={(e) => ((e.target as HTMLImageElement).src = "/prime-mates-nft.jpg")}
                      />
                    </div>
                    <div className="text-xs mt-1 truncate">{nft.name || `#${nft.tokenId}`}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">Connect a wallet with NFTs to add from your collection, or upload PNGs.</div>
          )}
        </div>

        {/* Layers */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Layers</h3>
            <span className="text-xs text-gray-400">{layers.length} item(s)</span>
          </div>

          {layers.length === 0 ? (
            <div className="text-sm text-gray-400">No layers yet.</div>
          ) : (
            layers.map((l) => {
              const selected = l.id === selectedId;
              return (
                <div
                  key={l.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border ${selected ? "border-purple-500 bg-purple-500/10" : "border-gray-800 bg-gray-900"}`}
                  onClick={() => setSelectedId(l.id)}
                >
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-800">
                    <img src={l.src} alt={l.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium truncate">{l.name}</div>
                    <div className="text-xs text-gray-400">
                      x:{Math.round(l.x)} y:{Math.round(l.y)} • s:{l.scale.toFixed(2)} • r:{Math.round(l.rotation)}°
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="text-gray-300" onClick={() => moveZ(l.id, "down")} title="Send backward">
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-gray-300" onClick={() => moveZ(l.id, "up")} title="Bring forward">
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-gray-300" onClick={() => duplicate(l.id)} title="Duplicate">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-purple-300" onClick={() => removeBg(l.id)} disabled={l.removing} title="Remove background">
                      <Scissors className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-red-300" onClick={() => remove(l.id)} title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}

          {selectedId && (
            <div className="pt-2 border-t border-gray-800 space-y-3">
              <div>
                <label className="block text-xs mb-1 text-gray-300">Scale</label>
                <input
                  type="range"
                  min={0.4}
                  max={2}
                  step={0.02}
                  value={layers.find((l) => l.id === selectedId)?.scale ?? 1}
                  onChange={(e) =>
                    setLayers((prev) => prev.map((l) => (l.id === selectedId ? { ...l, scale: parseFloat(e.target.value) } : l)))
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-300">Rotation</label>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={layers.find((l) => l.id === selectedId)?.rotation ?? 0}
                  onChange={(e) =>
                    setLayers((prev) => prev.map((l) => (l.id === selectedId ? { ...l, rotation: parseFloat(e.target.value) } : l)))
                  }
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-200"
                  onClick={() => setLayers((prev) => prev.map((l) => (l.id === selectedId ? { ...l, x: 0, y: 0 } : l)))}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Position
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-200"
                  onClick={() => setLayers((prev) => prev.map((l) => (l.id === selectedId ? { ...l, scale: 1, rotation: 0 } : l)))}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Transform
                </Button>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-gray-800">
            <label className="block text-sm mb-1 text-gray-300">Title (optional)</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-gray-800 border-gray-700" />
          </div>
        </div>
      </div>

      {/* Right: Preview & Export */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-4 text-amber-400">Preview</h3>

          <div
            ref={previewRef}
            className={`relative ${spec.previewAspect} rounded-xl overflow-hidden border border-gray-800 bg-gray-900`}
            onMouseDown={startDrag}
            onMouseMove={onDrag}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
          >
            {/* Mockup base */}
            <img
              src={mockupSrc}
              alt={`${spec.label} ${side}`}
              className="absolute inset-0 w-full h-full object-contain select-none"
              onError={(e) => ((e.target as HTMLImageElement).src = "/prime-mates-nft.jpg")}
            />

            {/* Layers */}
            {layers.map((l) => (
              <img
                key={l.id}
                src={l.src}
                alt={l.name}
                className={`absolute left-1/2 top-1/2 select-none ${
                  selectedId === l.id ? "ring-2 ring-purple-500 rounded-lg" : ""
                }`}
                style={{
                  transform: `translate(-50%, -50%) translate(${l.x}px, ${l.y}px) rotate(${l.rotation}deg) scale(${l.scale})`,
                  width: "60%",
                  pointerEvents: "none",
                }}
                draggable={false}
              />
            ))}

            {/* Title */}
            {title.trim() && (
              <div className="absolute bottom-6 left-0 right-0 text-center text-white font-bold text-xl drop-shadow">
                {title}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Button onClick={exportMockup} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              Download Mockup
            </Button>
            <Button onClick={exportPrintFile} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              Download Print PNG
            </Button>
          </div>

          {/* hidden canvas for print export (kept for performance) */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}
