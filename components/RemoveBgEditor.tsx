"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Eraser, Undo2, Image as ImageIcon, Check, Shapes, Sparkles } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Templates (update URLs if you use different filenames)              */
/* ------------------------------------------------------------------ */
type TemplateId = "skateboard" | "surfboard" | "snowboard" | "body";

const TEMPLATES: Record<
  TemplateId,
  { id: TemplateId; label: string; url: string }
> = {
  skateboard: { id: "skateboard", label: "Skateboard", url: "/templates/skateboard.png" },
  surfboard:  { id: "surfboard",  label: "Surfboard",  url: "/templates/surfboard.png"  },
  snowboard:  { id: "snowboard",  label: "Snowboard",  url: "/templates/snowboard.png"  },
  body:       { id: "body",       label: "Upper Body", url: "/templates/body.png"       },
};

/* ------------------------------------------------------------------ */

export function RemoveBgEditor({
  imageUrl,
  onApply,     // returns a dataURL (PNG with edits)
  onCancel,
}: {
  imageUrl: string;
  onApply: (dataUrl: string) => void;
  onCancel?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLImageElement | null>(null);
  const sourceRef = useRef<HTMLImageElement | null>(null);

  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState<"erase" | "restore">("erase");
  const [brush, setBrush] = useState(26);
  const [template, setTemplate] = useState<TemplateId | null>("skateboard");
  const [overlayOpacity, setOverlayOpacity] = useState(60);
  const [workingUrl, setWorkingUrl] = useState<string>("");

  // fit settings
  const SIZE = 768; // editor square size so brushes feel consistent

  /* ---------------------------- load images ---------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setReady(false);

      // load editing image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        sourceRef.current = img;

        // initialize the working canvas with the source image
        const c = canvasRef.current!;
        c.width = SIZE;
        c.height = SIZE;
        const ctx = c.getContext("2d")!;
        ctx.clearRect(0, 0, SIZE, SIZE);

        const { x, y, w, h } = fitRect(img.width, img.height, SIZE, SIZE);
        ctx.drawImage(img, x, y, w, h);

        setWorkingUrl(c.toDataURL("image/png"));
        if (!cancelled) setReady(true);
      };
      img.src = encodeURI(imageUrl);

      // load overlay (template)
      if (template) {
        const o = new Image();
        o.crossOrigin = "anonymous";
        o.onload = () => {
          overlayRef.current = o;
          // we just keep it in memory; drawn during render pass
        };
        o.src = encodeURI(TEMPLATES[template].url);
      } else {
        overlayRef.current = null;
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, template]);

  // redraw each time workingUrl changes (after brush strokes)
  useEffect(() => {
    if (!ready || !canvasRef.current || !workingUrl) return;
    const cnv = canvasRef.current;
    const ctx = cnv.getContext("2d")!;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.drawImage(img, 0, 0, SIZE, SIZE);

      // draw overlay on top (just as a guide)
      if (template && overlayRef.current) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, overlayOpacity / 100));
        const o = overlayRef.current;
        const { x, y, w, h } = fitRect(o.width, o.height, SIZE, SIZE);
        ctx.drawImage(o, x, y, w, h);
        ctx.restore();
      }
    };
    img.src = workingUrl;
  }, [workingUrl, ready, template, overlayOpacity]);

  /* ------------------------------ helpers ------------------------------ */

  function fitRect(srcW: number, srcH: number, dstW: number, dstH: number) {
    const scale = Math.min(dstW / srcW, dstH / srcH);
    const w = srcW * scale;
    const h = srcH * scale;
    const x = (dstW - w) / 2;
    const y = (dstH - h) / 2;
    return { x, y, w, h, scale };
  }

  function drawAt(x: number, y: number) {
    const cnv = canvasRef.current!;
    const ctx = cnv.getContext("2d")!;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, brush / 2, 0, Math.PI * 2);
    ctx.closePath();
    if (mode === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();
    } else {
      // restore from original source image
      if (!sourceRef.current) return;
      const src = sourceRef.current;
      const { x: dx, y: dy, w, h } = fitRect(src.width, src.height, SIZE, SIZE);
      ctx.clip(); // restore only inside the circular brush
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(src, dx, dy, w, h);
    }
    ctx.restore();

    setWorkingUrl(cnv.toDataURL("image/png"));
  }

  function onPointer(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    drawAt(e.clientX - rect.left, e.clientY - rect.top);
  }

  /* -------------------------- template masker -------------------------- */

  async function applyTemplateMask(keepInside: boolean) {
    if (!ready || !canvasRef.current || !sourceRef.current) return;
    const c = canvasRef.current;
    const ctx = c.getContext("2d")!;

    // render the current working image into an offscreen
    const off = document.createElement("canvas");
    off.width = SIZE;
    off.height = SIZE;
    const octx = off.getContext("2d")!;
    const wImg = new Image();
    wImg.crossOrigin = "anonymous";
    await new Promise<void>((resolve) => {
      wImg.onload = () => {
        octx.clearRect(0, 0, SIZE, SIZE);
        octx.drawImage(wImg, 0, 0, SIZE, SIZE);
        resolve();
      };
      wImg.src = workingUrl;
    });

    // load & draw template scaled to fit the same way we display it
    if (!template) return;
    const tImg = new Image();
    tImg.crossOrigin = "anonymous";
    await new Promise<void>((resolve) => {
      tImg.onload = () => resolve();
      tImg.src = TEMPLATES[template].url;
    });

    const mask = document.createElement("canvas");
    mask.width = SIZE;
    mask.height = SIZE;
    const mctx = mask.getContext("2d")!;
    const fit = fitRect(tImg.width, tImg.height, SIZE, SIZE);
    mctx.clearRect(0, 0, SIZE, SIZE);
    mctx.drawImage(tImg, fit.x, fit.y, fit.w, fit.h);

    // read alphas & apply
    const maskData = mctx.getImageData(0, 0, SIZE, SIZE);
    const imgData = octx.getImageData(0, 0, SIZE, SIZE);
    const keepIf = (a: number) => (keepInside ? a > 16 : !(a > 16));

    for (let i = 0; i < imgData.data.length; i += 4) {
      const a = maskData.data[i + 3]; // template alpha
      if (keepIf(a)) continue;
      imgData.data[i + 3] = 0; // erase
    }
    octx.putImageData(imgData, 0, 0);

    // push back to main canvas / state
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.drawImage(off, 0, 0);
    setWorkingUrl(c.toDataURL("image/png"));
  }

  /* -------------------------------- render ----------------------------- */

  return (
    <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
      {/* LEFT: canvas */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Button
              size="sm"
              variant={mode === "erase" ? "default" : "outline"}
              onClick={() => setMode("erase")}
              className="gap-2"
            >
              <Eraser className="w-4 h-4" /> Erase
            </Button>
            <Button
              size="sm"
              variant={mode === "restore" ? "default" : "outline"}
              onClick={() => setMode("restore")}
              className="gap-2"
            >
              <Undo2 className="w-4 h-4" /> Restore
            </Button>

            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs opacity-75">Brush</span>
              <input
                type="range"
                min={6}
                max={100}
                step={1}
                value={brush}
                onChange={(e) => setBrush(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="relative">
            {!ready && (
              <div className="absolute inset-0 grid place-content-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
            <canvas
              ref={canvasRef}
              width={SIZE}
              height={SIZE}
              className="w-full max-w-[768px] border border-gray-800 rounded-md bg-black/40 touch-none"
              onPointerDown={(e) => {
                setDragging(true);
                onPointer(e);
              }}
              onPointerMove={(e) => dragging && onPointer(e)}
              onPointerUp={() => setDragging(false)}
              onPointerLeave={() => setDragging(false)}
            />
          </div>
        </CardContent>
      </Card>

      {/* RIGHT: templates + controls */}
      <div className="space-y-4">
        {/* Template picker */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3 font-semibold">
              <Shapes className="w-4 h-4" /> Templates
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(TEMPLATES).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`p-2 rounded-lg border ${
                    template === t.id
                      ? "border-yellow-500 bg-yellow-500/10"
                      : "border-gray-800 hover:border-gray-700"
                  }`}
                  title={t.label}
                >
                  <div className="aspect-square bg-gray-800 rounded-md overflow-hidden mb-2 grid place-content-center">
                    <img
                      src={t.url}
                      alt={t.label}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-xs">{t.label}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-4">
              <span className="text-xs opacity-75">Overlay</span>
              <Slider
                defaultValue={[overlayOpacity]}
                value={[overlayOpacity]}
                onValueChange={(v) => setOverlayOpacity(v[0] ?? 60)}
                max={100}
                step={1}
                className="w-48"
              />
              <span className="text-xs opacity-75">{overlayOpacity}%</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => applyTemplateMask(true)}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Keep inside template
              </Button>
              <Button
                variant="outline"
                onClick={() => applyTemplateMask(false)}
              >
                Remove inside template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            className="gap-2"
            onClick={() => onApply(workingUrl)}
          >
            <Check className="w-4 h-4" />
            Apply
          </Button>
          <Button variant="outline" onClick={() => onCancel?.()}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
