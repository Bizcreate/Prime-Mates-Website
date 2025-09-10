// packages/prime-shared/components/PfpBackgroundStudio.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

// Minimal, dependency-free PFP cutout + compositor for wallpapers/banners.
// Why: runs fully client-side; works for PNGs with transparency or flat backgrounds via chroma-key.

// -----------------------------
// helpers
// -----------------------------

type RGB = { r: number; g: number; b: number };

function clamp(v: number, lo = 0, hi = 255) {
  return Math.max(lo, Math.min(hi, v));
}

function colorDist(a: RGB, b: RGB) {
  const dr = a.r - b.r,
    dg = a.g - b.g,
    db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // important for canvas export
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  targetW: number,
  targetH: number
) {
  const s = Math.min(targetW / img.naturalWidth, targetH / img.naturalHeight);
  const w = Math.round(img.naturalWidth * s);
  const h = Math.round(img.naturalHeight * s);
  const x = Math.floor((targetW - w) / 2);
  const y = Math.floor((targetH - h) / 2);
  ctx.drawImage(img, x, y, w, h);
  return { x, y, w, h };
}

function getImageDataFrom(img: HTMLImageElement, maxSide = 2048) {
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.max(1, Math.floor(img.width * scale));
  const h = Math.max(1, Math.floor(img.height * scale));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = "high";
  g.drawImage(img, 0, 0, w, h);
  const data = g.getImageData(0, 0, w, h);
  return { canvas: c, ctx: g, data };
}

function avg(colors: RGB[]): RGB {
  const n = colors.length || 1;
  const s = colors.reduce((a, c) => ({ r: a.r + c.r, g: a.g + c.g, b: a.b + c.b }), { r: 0, g: 0, b: 0 });
  return { r: s.r / n, g: s.g / n, b: s.b / n };
}

function sampleCorners(data: ImageData, patch = 16): RGB[] {
  const { width: W, height: H, data: A } = data;
  const coords = [
    [0, 0],
    [W - patch, 0],
    [0, H - patch],
    [W - patch, H - patch],
  ] as const;
  const out: RGB[] = [];
  for (const [sx, sy] of coords) {
    let r = 0,
      g = 0,
      b = 0,
      n = 0;
    for (let y = sy; y < Math.min(H, sy + patch); y++) {
      for (let x = sx; x < Math.min(W, sx + patch); x++) {
        const i = (y * W + x) * 4;
        const a = A[i + 3];
        // ignore fully transparent pixels
        if (a < 8) continue;
        r += A[i + 0];
        g += A[i + 1];
        b += A[i + 2];
        n++;
      }
    }
    out.push({ r: n ? r / n : 0, g: n ? g / n : 0, b: n ? b / n : 0 });
  }
  return out;
}

function transparencyCoverage(data: ImageData) {
  const A = data.data;
  let opaque = 0;
  for (let i = 3; i < A.length; i += 4) if (A[i] > 4) opaque++;
  return opaque / (A.length / 4);
}

function buildMask(
  data: ImageData,
  bgColors: RGB[],
  threshold = 30,
  feather = 2
): Uint8ClampedArray {
  const { width: W, height: H, data: A } = data;
  const mask = new Uint8ClampedArray(W * H);

  // raw mask by thresholding distance to nearest corner color
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const a = A[i + 3];
      if (a < 8) {
        mask[y * W + x] = 0; // already transparent
        continue;
      }
      const p: RGB = { r: A[i], g: A[i + 1], b: A[i + 2] };
      let minD = 1e9;
      for (const c of bgColors) minD = Math.min(minD, colorDist(p, c));
      mask[y * W + x] = minD < threshold ? 0 : 255;
    }
  }

  // simple feather via 3x3 box blur repeated
  const tmp = new Uint8ClampedArray(W * H);
  for (let f = 0; f < feather; f++) {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let s = 0,
          n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx,
              yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
            s += mask[yy * W + xx];
            n++;
          }
        }
        tmp[y * W + x] = s / n;
      }
    }
    mask.set(tmp);
  }
  return mask;
}

function cutoutToCanvas(src: ImageData, mask: Uint8ClampedArray) {
  const { width: W, height: H, data } = src;
  const out = new ImageData(W, H);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    out.data[i + 0] = data[i + 0];
    out.data[i + 1] = data[i + 1];
    out.data[i + 2] = data[i + 2];
    out.data[i + 3] = Math.min(data[i + 3], mask[p]);
  }
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.putImageData(out, 0, 0);
  return c;
}

function dataUrlToBlob(dataUrl: string) {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8 = new Uint8Array(n);
  while (n--) u8[n] = bstr.charCodeAt(n);
  return new Blob([u8], { type: mime });
}

// -----------------------------
// component
// -----------------------------

export type Template = "square1024" | "pfpCircle1024" | "phone1080x1920" | "twitter1500x500";

type Props = {
  imageUrl: string; // NFT image (ipfs gateway converted to http)
  name?: string;
};

const templateSize: Record<Template, { w: number; h: number }> = {
  square1024: { w: 1024, h: 1024 },
  pfpCircle1024: { w: 1024, h: 1024 },
  phone1080x1920: { w: 1080, h: 1920 },
  twitter1500x500: { w: 1500, h: 500 },
};

const gradients = [
  { id: "gold", css: "linear-gradient(135deg,#FDE68A,#F59E0B)" },
  { id: "lava", css: "linear-gradient(135deg,#FB7185,#F97316)" },
  { id: "ocean", css: "linear-gradient(135deg,#22D3EE,#3B82F6)" },
  { id: "night", css: "linear-gradient(135deg,#111827,#374151)" },
];

export default function PfpBackgroundStudio({ imageUrl, name }: Props) {
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);
  const [cutout, setCutout] = useState<HTMLCanvasElement | null>(null);
  const [useAutoBgRemoval, setUseAutoBgRemoval] = useState(true);
  const [threshold, setThreshold] = useState(36);
  const [feather, setFeather] = useState(2);

  // composition state
  const [template, setTemplate] = useState<Template>("square1024");
  const [bgColor, setBgColor] = useState("#0f172a");
  const [bgGradient, setBgGradient] = useState<string | null>(gradients[0].css);
  const [scale, setScale] = useState(1.1); // cutout scale
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [gesture, setGesture] = useState<string | null>(null);

  const outputRef = useRef<HTMLCanvasElement>(null);

  // Load NFT image
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const img = await loadImage(imageUrl);
        if (!cancelled) setLoadedImg(img);
      } catch (e) {
        console.error("Failed to load image", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  // Build cutout when loaded/controls change
  useEffect(() => {
    if (!loadedImg) return;
    (async () => {
      const { data } = getImageDataFrom(loadedImg, 1024);
      const coverage = transparencyCoverage(data); // 0..1
      let mask: Uint8ClampedArray | null = null;
      if (coverage < 0.99 && useAutoBgRemoval) {
        // try chroma-key using corner samples
        const corners = sampleCorners(data, 24);
        mask = buildMask(data, [avg(corners)], threshold, feather);
      }
      const cut = cutoutToCanvas(data, mask || new Uint8ClampedArray(data.width * data.height).fill(255));
      setCutout(cut);
    })();
  }, [loadedImg, threshold, feather, useAutoBgRemoval]);

  // Compose to output when any state changes
  useEffect(() => {
    const out = outputRef.current;
    if (!out) return;
    const size = templateSize[template];
    out.width = size.w;
    out.height = size.h;
    const g = out.getContext("2d")!;
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = "high";

    // background
    if (bgGradient) {
      // draw gradient by creating a temp element and reading computed style
      // Simpler: approximate by two-color linear gradient left->right
      const grad = g.createLinearGradient(0, 0, size.w, size.h);
      if (bgGradient.includes("#")) {
        // not robust parse; works for our presets
        const stops = bgGradient.match(/#([0-9a-fA-F]{6})/g) || [bgColor, bgColor];
        grad.addColorStop(0, stops[0]);
        grad.addColorStop(1, stops[stops.length - 1]);
      } else {
        grad.addColorStop(0, bgColor);
        grad.addColorStop(1, bgColor);
      }
      g.fillStyle = grad;
      g.fillRect(0, 0, size.w, size.h);
    } else {
      g.fillStyle = bgColor;
      g.fillRect(0, 0, size.w, size.h);
    }

    // cutout placement
    if (cutout) {
      const targetMax = Math.min(size.w, size.h) * scale;
      const s = Math.min(targetMax / cutout.width, targetMax / cutout.height);
      const w = cutout.width * s;
      const h = cutout.height * s;
      const cx = size.w / 2 + offsetX;
      const cy = size.h / 2 + offsetY;
      const x = Math.round(cx - w / 2);
      const y = Math.round(cy - h / 2);
      g.drawImage(cutout, x, y, w, h);

      if (template === "pfpCircle1024") {
        // mask to circle
        const mask = document.createElement("canvas");
        mask.width = size.w;
        mask.height = size.h;
        const mg = mask.getContext("2d")!;
        mg.drawImage(out, 0, 0);
        g.clearRect(0, 0, size.w, size.h);
        g.save();
        g.beginPath();
        g.arc(size.w / 2, size.h / 2, size.w / 2 - 4, 0, Math.PI * 2);
        g.clip();
        g.drawImage(mask, 0, 0);
        g.restore();
      }
    }

    // optional gesture overlay
    if (gesture) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        g.drawImage(img, 0, 0, size.w, size.h);
      };
      img.src = gesture;
    }
  }, [cutout, template, bgColor, bgGradient, scale, offsetX, offsetY, gesture]);

  function onDownload() {
    const out = outputRef.current;
    if (!out) return;
    const url = out.toDataURL("image/png");
    const a = document.createElement("a");
    a.download = `${(name || "prime-mate").replace(/\s+/g, "_")}_${template}.png`;
    a.href = url;
    a.click();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
      {/* controls */}
      <div className="space-y-6">
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900">
          <div className="font-semibold mb-3">Cutout</div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={useAutoBgRemoval} onChange={(e) => setUseAutoBgRemoval(e.target.checked)} />
            Auto remove flat background
          </label>
          <div className="mt-3 text-xs opacity-70">If your NFT is a PNG with transparency, uncheck this.</div>
          <div className="mt-4">
            <label className="text-sm">Threshold: {threshold}</label>
            <input type="range" min={10} max={80} value={threshold} onChange={(e) => setThreshold(parseInt(e.target.value))} className="w-full" />
          </div>
          <div className="mt-2">
            <label className="text-sm">Feather: {feather}px</label>
            <input type="range" min={0} max={5} value={feather} onChange={(e) => setFeather(parseInt(e.target.value))} className="w-full" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900 space-y-3">
          <div className="font-semibold">Template</div>
          <select value={template} onChange={(e) => setTemplate(e.target.value as Template)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2">
            <option value="square1024">Square 1024 × 1024</option>
            <option value="pfpCircle1024">PFP Circle 1024 × 1024</option>
            <option value="phone1080x1920">Phone 1080 × 1920</option>
            <option value="twitter1500x500">Twitter Banner 1500 × 500</option>
          </select>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900 space-y-3">
          <div className="font-semibold">Background</div>
          <div className="flex items-center gap-3">
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-8 w-10 rounded" />
            <button className={`px-2 py-1 rounded border ${bgGradient ? "border-yellow-500 text-yellow-400" : "border-gray-700 text-gray-300"}`} onClick={() => setBgGradient(bgGradient ? null : gradients[0].css)}>
              {bgGradient ? "Disable gradient" : "Enable gradient"}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {gradients.map((g) => (
              <button key={g.id} onClick={() => setBgGradient(g.css)} className="h-8 rounded border border-gray-700" style={{ backgroundImage: g.css }} />
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900 space-y-2">
          <div className="font-semibold">Placement</div>
          <label className="text-sm">Scale: {scale.toFixed(2)}x</label>
          <input type="range" min={0.5} max={2.5} step={0.01} value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full" />
          <label className="text-sm">Offset X: {offsetX}px</label>
          <input type="range" min={-600} max={600} step={1} value={offsetX} onChange={(e) => setOffsetX(parseInt(e.target.value))} className="w-full" />
          <label className="text-sm">Offset Y: {offsetY}px</label>
          <input type="range" min={-600} max={600} step={1} value={offsetY} onChange={(e) => setOffsetY(parseInt(e.target.value))} className="w-full" />
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900 space-y-2">
          <div className="font-semibold">Gesture Overlay</div>
          <div className="text-xs opacity-70">Paste an overlay image URL (PNG with transparency) or leave blank.</div>
          <input className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2" placeholder="/gestures/ShakaHand.png" value={gesture || ""} onChange={(e) => setGesture(e.target.value || null)} />
        </div>

        <button onClick={onDownload} className="w-full rounded-xl bg-yellow-500 text-black font-semibold py-2 hover:opacity-90">Download PNG</button>
      </div>

      {/* output */}
      <div className="p-4 rounded-xl border border-gray-800 bg-gray-900">
        <div className="text-sm opacity-70 mb-2">Preview</div>
        <div className="flex items-center justify-center">
          <canvas ref={outputRef} className="max-w-full h-auto border border-gray-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// Usage example (drop into your Art Gallery tab):
// import PfpBackgroundStudio from "@/packages/prime-shared/components/PfpBackgroundStudio";
// <PfpBackgroundStudio imageUrl={selectedNFT.image} name={selectedNFT.name} />
