"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Check, Eraser, Undo2, Redo2 } from "lucide-react";

type Mode = "erase" | "restore";

type Props = {
  open: boolean;
  src: string;                  // image to edit (use processed if remove-bg is on)
  initialMask?: string | null;  // optional existing mask (grayscale, R channel used)
  onClose: () => void;
  onApply: (maskDataURL: string, appliedDataURL: string) => void;
};

export default function ManualMaskEditor({ open, src, initialMask, onClose, onApply }: Props) {
  const holderRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef<HTMLCanvasElement>(null);

  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<Mode>("erase");
  const [brush, setBrush] = useState(56);
  const [hardness, setHardness] = useState(0.75);
  const [down, setDown] = useState(false);
  const [last, setLast] = useState<{x:number;y:number}|null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [redo, setRedo] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => setImg(i);
    i.src = src;
  }, [open, src]);

  useEffect(() => {
    if (!open || !img || !holderRef.current) return;
    const holder = holderRef.current;
    const maxW = Math.min(holder.clientWidth, 1200);
    const maxH = Math.min(holder.clientHeight, 700);
    const scale = Math.min(maxW / img.width, maxH / img.height);
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));

    for (const c of [baseRef.current!, maskRef.current!, viewRef.current!]) {
      c.width = w; c.height = h;
      c.style.width = `${w}px`; c.style.height = `${h}px`;
    }

    const bctx = baseRef.current!.getContext("2d")!;
    bctx.clearRect(0,0,w,h);
    bctx.drawImage(img, 0, 0, w, h);

    const mctx = maskRef.current!.getContext("2d")!;
    mctx.clearRect(0,0,w,h);
    if (initialMask) {
      const mimg = new Image();
      mimg.onload = () => { mctx.drawImage(mimg, 0, 0, w, h); pushHistory(); composite(); };
      mimg.src = initialMask;
    } else {
      mctx.fillStyle = "#fff"; mctx.fillRect(0,0,w,h);
      pushHistory(); composite();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, img]);

  function pushHistory() {
    try {
      setHistory((h) => [...h, maskRef.current!.toDataURL("image/png")]);
      setRedo([]);
    } catch {}
  }
  function undo() {
    if (history.length <= 1) return;
    const prev = history[history.length - 2];
    setRedo((r) => [history[history.length - 1], ...r]);
    setHistory((h) => h.slice(0, -1));
    paintMaskFromURL(prev, composite);
  }
  function redoStep() {
    if (redo.length === 0) return;
    const next = redo[0];
    setRedo((r) => r.slice(1));
    setHistory((h) => [...h, next]);
    paintMaskFromURL(next, composite);
  }
  function paintMaskFromURL(url: string, cb?: () => void) {
    const mctx = maskRef.current!.getContext("2d")!;
    const w = maskRef.current!.width, h = maskRef.current!.height;
    const im = new Image();
    im.onload = () => { mctx.clearRect(0,0,w,h); mctx.drawImage(im,0,0,w,h); cb?.(); };
    im.src = url;
  }

  function brushDot(ctx: CanvasRenderingContext2D, x:number, y:number) {
    const r = brush/2;
    const inner = Math.max(0, r * hardness);
    const g = ctx.createRadialGradient(x,y,inner,x,y,r);
    const color = mode === "erase" ? "0,0,0" : "255,255,255";
    g.addColorStop(0, `rgba(${color},1)`); g.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }

  function stroke(a:{x:number;y:number}|null, b:{x:number;y:number}) {
    const ctx = maskRef.current!.getContext("2d")!;
    ctx.globalCompositeOperation = mode === "erase" ? "destination-out" : "source-over";
    if (!a) { brushDot(ctx, b.x, b.y); composite(); return; }
    const steps = Math.ceil(Math.hypot(b.x-a.x, b.y-a.y)/(brush/4));
    for (let i=0;i<=steps;i++) {
      const t=i/Math.max(1,steps);
      brushDot(ctx, a.x+(b.x-a.x)*t, a.y+(b.y-a.y)*t);
    }
    composite();
  }

  function composite() {
    const w = viewRef.current!.width, h = viewRef.current!.height;
    const v = viewRef.current!.getContext("2d")!;
    const b = baseRef.current!.getContext("2d")!.getImageData(0,0,w,h);
    const m = maskRef.current!.getContext("2d")!.getImageData(0,0,w,h);
    const out = v.createImageData(w,h);
    for (let i=0;i<b.data.length;i+=4) {
      out.data[i] = b.data[i];
      out.data[i+1] = b.data[i+1];
      out.data[i+2] = b.data[i+2];
      out.data[i+3] = m.data[i]; // use mask red channel as alpha
    }
    v.putImageData(out,0,0);
  }

  function toXY(e: React.PointerEvent) {
    const r = viewRef.current!.getBoundingClientRect();
    return { x: ((e.clientX-r.left)/r.width)*r.width, y: ((e.clientY-r.top)/r.height)*r.height };
  }
  function downEv(e: React.PointerEvent) { setDown(true); (e.target as HTMLElement).setPointerCapture(e.pointerId); const p=toXY(e); setLast(p); stroke(null,p); }
  function moveEv(e: React.PointerEvent) { if(!down) return; const p=toXY(e); stroke(last,p); setLast(p); }
  function upEv(e: React.PointerEvent) { if(!down) return; setDown(false); setLast(null); (e.target as HTMLElement).releasePointerCapture(e.pointerId); pushHistory(); }

  function apply() {
    try {
      const maskURL = maskRef.current!.toDataURL("image/png");
      const appliedURL = viewRef.current!.toDataURL("image/png");
      onApply(maskURL, appliedURL);
    } catch { onApply("", ""); }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-[#0b1220] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="text-white font-semibold">Manual Background Editor</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={undo} disabled={history.length<=1}><Undo2 className="w-4 h-4 mr-2" />Undo</Button>
            <Button variant="outline" onClick={redoStep} disabled={redo.length===0}><Redo2 className="w-4 h-4 mr-2" />Redo</Button>
            <Button variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10" onClick={apply}><Check className="w-4 h-4 mr-2" />Apply</Button>
            <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10" onClick={onClose}><X className="w-4 h-4 mr-2" />Close</Button>
          </div>
        </div>

        <div className="grid grid-cols-12">
          <div className="col-span-3 p-4 border-r border-white/10 text-white">
            <div className="font-semibold mb-3">Tools</div>
            <div className="flex gap-2 mb-4">
              <Button className={mode==="erase" ? "bg-yellow-500 text-black" : ""} onClick={()=>setMode("erase")}><Eraser className="w-4 h-4 mr-2" />Erase</Button>
              <Button className={mode==="restore" ? "bg-yellow-500 text-black" : ""} onClick={()=>setMode("restore")}>Restore</Button>
            </div>
            <div className="mb-4">
              <div className="text-sm mb-1 text-gray-300">Brush Size</div>
              <input type="range" min={4} max={256} value={brush} onChange={(e)=>setBrush(Number(e.target.value))} className="w-full" />
            </div>
            <div className="mb-2">
              <div className="text-sm mb-1 text-gray-300">Hardness</div>
              <input type="range" min={0} max={1} step={0.01} value={hardness} onChange={(e)=>setHardness(Number(e.target.value))} className="w-full" />
            </div>
            <p className="text-xs text-gray-400">Erase = transparent. Restore = bring back.</p>
          </div>

          <div className="col-span-9 p-4">
            <div ref={holderRef} className="w-full h-[72vh] min-h-[420px] flex items-center justify-center bg-[#0f172a] rounded-xl border border-white/10 overflow-hidden relative">
              <canvas ref={baseRef} className="absolute pointer-events-none select-none" />
              <canvas ref={maskRef} className="absolute pointer-events-none select-none" />
              <canvas
                ref={viewRef}
                className="absolute cursor-crosshair"
                onPointerDown={downEv}
                onPointerMove={moveEv}
                onPointerUp={upEv}
                onPointerLeave={upEv}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
