"use client";

import React, { useEffect, useRef, useState } from "react";

export function MaskCanvas({
  url,
  origUrl,
  size = 512,
  brush = 24,
  mode = "erase",
  className = "",
  onChange,
}: {
  url: string;
  origUrl: string;
  size?: number;
  brush?: number;
  mode?: "erase" | "restore";
  className?: string;
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
    cnv.width = size;
    cnv.height = size;
    ctx.clearRect(0, 0, cnv.width, cnv.height);

    const scale = Math.min(cnv.width / img.width, cnv.height / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (cnv.width - w) / 2;
    const y = (cnv.height - h) / 2;
    ctx.drawImage(img, x, y, w, h);
  }, [ready, size, url]);

  function drawAt(x: number, y: number) {
    if (!ref.current || !imgRef.current || !origRef.current) return;
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
    drawAt(e.clientX - rect.left, e.clientY - rect.top);
  }

  return (
    <canvas
      ref={ref}
      className={`w-full max-w-[512px] rounded-md border border-gray-800 bg-black/40 ${className}`}
      onPointerDown={(e) => {
        setDrag(true);
        handlePointer(e);
      }}
      onPointerMove={(e) => {
        if (drag) handlePointer(e);
      }}
      onPointerUp={() => setDrag(false)}
      onPointerLeave={() => setDrag(false)}
    />
  );
}
