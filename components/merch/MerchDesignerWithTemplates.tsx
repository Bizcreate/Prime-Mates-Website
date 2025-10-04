"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { MaskCanvas } from "./MaskCanvas";
import { TemplateControls, TemplateId, TEMPLATES } from "./TemplateControls";

/** --------------------------- Types --------------------------- */
type RemoveBgConfig = {
  enabled: boolean;
  colors?: string[]; // multi-key
  color?: string;    // single key (back-compat)
  tol: number;       // 0..100
  soft: number;      // 0..100
  protectDark: boolean;
};

type Layer = {
  id: string;
  src: string;       // original
  label?: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  removing?: boolean;

  // preview caches
  srcProcessed?: string; // auto soft-keyed
  srcEdited?: string;    // manual brushed
  _procKey?: string;     // cache key
  removeBg?: RemoveBgConfig;
};

type Product = {
  label: string;
  src: string;          // garment mockup image (/public/merch/*.png)
  aspect: number;       // width / height
  area: { x: number; y: number; w: number; h: number }; // relative 0..1 print area
};

/** --------------------------- Demo garments --------------------------- */
const PRODUCT: Product = {
  label: "T-Shirt Black (Front)",
  src: "/merch/tshirt_black_front.png",
  aspect: 1,
  area: { x: 0.18, y: 0.24, w: 0.64, h: 0.5 },
};

/** --------------------------- Utils --------------------------- */
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
    switch (max) { case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break; }
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

/** --------------------- Soft-key (auto keying) --------------------- */
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

/** --------------------- Main component --------------------- */
export default function MerchDesignerWithTemplates() {
  const product = PRODUCT;
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = layers.find(l => l.id === selectedId) || null;

  // Template state
  const [template, setTemplate] = useState<TemplateId>("none");
  const [templateAlpha, setTemplateAlpha] = useState(0.4);
  const [templateKeepInside, setTemplateKeepInside] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  function addLayerFromSrc(src: string, label?: string) {
    const rect = containerRef.current?.getBoundingClientRect();
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

  // Auto soft-key preview pipeline
  useEffect(() => {
    let cancelled = false;
    async function maybeProcess(l: Layer) {
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
      } catch {/* ignore */}
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

  // Drag
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

  // Export with template mask
  async function exportPNG() {
    const baseH = 1600;
    const baseW = Math.round(baseH * product.aspect);

    const garment = await loadImage(product.src);
    const c = document.createElement("canvas");
    c.width = baseW; c.height = baseH;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(garment, 0, 0, baseW, baseH);

    const area = {
      x: product.area.x * baseW,
      y: product.area.y * baseH,
      w: product.area.w * baseW,
      h: product.area.h * baseH,
    };

    // clip to print area
    ctx.save();
    ctx.beginPath();
    ctx.rect(area.x, area.y, area.w, area.h);
    ctx.clip();

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

    // Apply template mask (optional)
    if (template !== "none") {
      // composite the current artwork region into a buffer
      const artwork = document.createElement("canvas");
      artwork.width = baseW; artwork.height = baseH;
      const aCtx = artwork.getContext("2d")!;
      aCtx.drawImage(c, 0, 0);

      // make a mask canvas the same size
      const mask = document.createElement("canvas");
      mask.width = baseW; mask.height = baseH;
      const mCtx = mask.getContext("2d")!;

      // Fill alpha=0 then draw template as opaque in place
      mCtx.clearRect(0, 0, baseW, baseH);
      const tpl = await loadImage(TEMPLATES[template].url);
      mCtx.drawImage(tpl, 0, 0, baseW, baseH);

      // If "keep inside", we keep only template region → destination-in
      // If not, we keep outside → destination-out
      aCtx.globalCompositeOperation = templateKeepInside ? "destination-in" : "destination-out";
      aCtx.drawImage(mask, 0, 0);

      // Put masked artwork back onto the main ctx (only inside print area already)
      ctx.clearRect(area.x, area.y, area.w, area.h);
      ctx.drawImage(artwork, 0, 0);
    }

    ctx.restore();

    const url = c.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${product.label.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  }

  return (
    <div className="px-4 py-8 space-y-6">
      <div className="flex items-center gap-2">
        <label className="inline-flex items-center gap-2">
          <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
          <span className="px-3 py-2 rounded bg-gray-900 border border-gray-800 cursor-pointer">Upload image</span>
        </label>
        <button
          className="px-3 py-2 rounded bg-yellow-500 text-black"
          onClick={exportPNG}
        >
          Export PNG
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
        {/* Preview */}
        <div>
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
              }}
            />

            {/* template overlay */}
            {template !== "none" && (
              <img
                src={TEMPLATES[template].url}
                alt={TEMPLATES[template].label}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={{ opacity: templateAlpha }}
              />
            )}

            {/* layers */}
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
          {/* Template controls */}
          <TemplateControls
            value={template}
            alpha={templateAlpha}
            keepInside={templateKeepInside}
            onChange={(next) => {
              if (next.value !== undefined) setTemplate(next.value);
              if (next.alpha !== undefined) setTemplateAlpha(next.alpha);
              if (next.keepInside !== undefined) setTemplateKeepInside(next.keepInside);
            }}
          />

          {/* Layers list */}
          <div className="rounded-lg border border-gray-800 p-3 bg-gray-900/60">
            <div className="font-semibold mb-2">Layers</div>
            {layers.length === 0 ? (
              <div className="text-sm opacity-70">Upload an image to begin.</div>
            ) : (
              <div className="space-y-2">
                {[...layers].reverse().map((l) => (
                  <div
                    key={l.id}
                    className={`flex items-center justify-between p-2 rounded border ${selectedId === l.id ? "border-yellow-500 bg-yellow-500/10" : "border-gray-800"}`}
                    onClick={() => setSelectedId(l.id)}
                  >
                    <div className="flex items-center gap-2">
                      <img src={layerSrc(l)} className="w-8 h-8 rounded object-cover" alt="" />
                      <div className="text-xs">{l.label || "Layer"}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-2 py-1 rounded bg-gray-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          const clone: Layer = { ...l, id: uid(), x: l.x + 24, y: l.y + 24 };
                          setLayers((p) => [...p, clone]);
                          setSelectedId(clone.id);
                        }}
                      >
                        Duplicate
                      </button>
                      <button
                        className="px-2 py-1 rounded bg-gray-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLayers((p) => p.filter((x) => x.id !== l.id));
                          if (selectedId === l.id) setSelectedId(null);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected layer controls incl. manual editor */}
          {selected && (
            <div className="rounded-lg border border-gray-800 p-3 space-y-4 bg-gray-900/60">
              <div className="font-semibold">Overlay Controls</div>

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

              {/* Soft-key toggle */}
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
                   
