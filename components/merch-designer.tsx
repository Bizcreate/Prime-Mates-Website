"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Download, ImagePlus, Layers, Trash2, Upload, Wand2 } from "lucide-react"

type NFTData = {
  tokenId: string
  name: string
  image: string
  tokenAddress?: string
  chainId?: number
}

type Layer = {
  id: string
  src: string
  label?: string
  x: number // px in preview container
  y: number
  scale: number // 1.0 baseline
  rotation: number // deg
  removeBg?: { enabled: boolean; color: string; tol: number } // simple chroma key
}

type ProductId =
  | "tee-black-front" | "tee-black-back"
  | "tee-white-front" | "tee-white-back"
  | "hoodie-black-front" | "hoodie-black-back"
  | "hoodie-white-front" | "hoodie-white-back"
  | "cap-black-front" | "cap-black-back"

type Product = {
  id: ProductId
  label: string
  src: string               // mockup image in /public/merch
  aspect: number            // width / height
  // Relative print area (0..1) inside the mockup where we place art
  area: { x: number; y: number; w: number; h: number }
}

// Rough print areas; adjust if you want tighter placements
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
}

function uid() {
  return Math.random().toString(36).slice(2)
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// very small chroma-key to clear pixels near a color
async function colorKey(src: string, keyHex: string, tol: number): Promise<string> {
  const img = await loadImage(src)
  const c = document.createElement("canvas")
  c.width = img.width
  c.height = img.height
  const ctx = c.getContext("2d")!
  ctx.drawImage(img, 0, 0)
  const data = ctx.getImageData(0, 0, c.width, c.height)
  const [kr, kg, kb] = hexToRgb(keyHex)
  const t2 = tol * tol
  for (let i = 0; i < data.data.length; i += 4) {
    const r = data.data[i], g = data.data[i + 1], b = data.data[i + 2]
    const dr = r - kr, dg = g - kg, db = b - kb
    const dist2 = dr * dr + dg * dg + db * db
    if (dist2 <= t2) data.data[i + 3] = 0
  }
  ctx.putImageData(data, 0, 0)
  return c.toDataURL("image/png")
}
function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace("#", "")
  const n = parseInt(v.length === 3 ? v.split("").map((d) => d + d).join("") : v, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export default function MerchDesigner({ userNFTs }: { userNFTs: NFTData[] }) {
  const [productId, setProductId] = useState<ProductId>("tee-black-front")
  const product = PRODUCTS[productId]
  const [layers, setLayers] = useState<Layer[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [down, setDown] = useState<{ id: string; x: number; y: number } | null>(null)
  const [exporting, setExporting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // add image layer
  function addLayerFromSrc(src: string, label?: string) {
    const rect = containerRef.current?.getBoundingClientRect()
    const cx = rect ? rect.width * (product.area.x + product.area.w / 2) : 300
    const cy = rect ? rect.height * (product.area.y + product.area.h / 2) : 300
    const id = uid()
    const l: Layer = { id, src, label, x: cx, y: cy, scale: 0.6, rotation: 0, removeBg: { enabled: false, color: "#ffffff", tol: 60 } }
    setLayers((p) => [...p, l])
    setSelectedId(id)
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const src = URL.createObjectURL(f)
    addLayerFromSrc(src, f.name)
    e.currentTarget.value = ""
  }

  async function exportPNG() {
    setExporting(true)
    try {
      // Render on a 1600px tall canvas to get a nice clean export
      const baseH = 1600
      const baseW = Math.round(baseH * product.aspect)

      const garment = await loadImage(product.src)
      const c = document.createElement("canvas")
      c.width = baseW
      c.height = baseH
      const ctx = c.getContext("2d")!

      // draw garment
      ctx.drawImage(garment, 0, 0, baseW, baseH)

      // compute print area in px
      const area = {
        x: product.area.x * baseW,
        y: product.area.y * baseH,
        w: product.area.w * baseW,
        h: product.area.h * baseH,
      }

      // we drew the preview at whatever CSS size — map preview coords -> export coords
      const previewRect = containerRef.current!.getBoundingClientRect()
      const scaleX = baseW / previewRect.width
      const scaleY = baseH / previewRect.height

      // clip to print area
      ctx.save()
      ctx.beginPath()
      ctx.rect(area.x, area.y, area.w, area.h)
      ctx.clip()

      // draw each layer
      for (const l of layers) {
        // prepare source (with optional color key)
        const src = l.removeBg?.enabled ? await colorKey(l.src, l.removeBg.color, l.removeBg.tol) : l.src
        const img = await loadImage(src)
        const px = l.x * scaleX
        const py = l.y * scaleY
        const targetH = area.h * l.scale
        const targetW = (img.width / img.height) * targetH

        ctx.save()
        ctx.translate(px, py)
        ctx.rotate((l.rotation * Math.PI) / 180)
        ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH)
        ctx.restore()
      }

      ctx.restore()

      const url = c.toDataURL("image/png")
      const a = document.createElement("a")
      a.href = url
      a.download = `${product.label.replace(/\s+/g, "-").toLowerCase()}.png`
      a.click()
    } finally {
      setExporting(false)
    }
  }

  const selected = layers.find((l) => l.id === selectedId) || null

  // pointer drag for selected layer
  function onPointerDown(e: React.PointerEvent, id: string) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId)
    setSelectedId(id)
    setDown({ id, x: e.clientX, y: e.clientY })
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!down) return
    const dx = e.clientX - down.x
    const dy = e.clientY - down.y
    setLayers((prev) =>
      prev.map((l) =>
        l.id === down.id ? { ...l, x: l.x + dx, y: l.y + dy } : l,
      ),
    )
    setDown({ id: down.id, x: e.clientX, y: e.clientY })
  }
  function onPointerUp(e: React.PointerEvent) {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId)
    setDown(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
      {/* Left: preview */}
      <div>
        <h3 className="text-xl font-bold mb-4">Merch Preview</h3>
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
            className="absolute border border-dashed border-white/30 pointer-events-none"
            style={{
              left: `${product.area.x * 100}%`,
              top: `${product.area.y * 100}%`,
              width: `${product.area.w * 100}%`,
              height: `${product.area.h * 100}%`,
            }}
          />

          {/* layers */}
          {layers.map((l) => (
            <img
              key={l.id}
              src={l.src}
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

        <div className="flex flex-wrap gap-3 mt-4">
          <label className="inline-flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
            <span className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 cursor-pointer">Upload image</span>
          </label>

          <Button variant="outline" className="border-gray-700" onClick={exportPNG} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />
            {exporting ? "Exporting..." : "Export PNG"}
          </Button>
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

        {/* Add NFTs */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Your NFTs</div>
              <Badge variant="secondary" className="bg-gray-800">{userNFTs.length}</Badge>
            </div>
            {userNFTs.length === 0 ? (
              <div className="text-sm text-gray-400">Connect wallet on the “My Collection” tab to load NFTs.</div>
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
                      <img src={l.src} className="w-8 h-8 rounded object-cover" alt="" />
                      <div className="text-xs">{l.label || "Layer"}</div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        setLayers((p) => p.filter((x) => x.id !== l.id))
                        if (selectedId === l.id) setSelectedId(null)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
                <Slider
                  value={[selected.scale]}
                  min={0.2}
                  max={2.5}
                  step={0.02}
                  onValueChange={([v]) => setLayers((p) => p.map((l) => (l.id === selected.id ? { ...l, scale: v } : l)))}
                />
              </div>
              <div>
                <div className="text-xs mb-1">Rotation</div>
                <Slider
                  value={[selected.rotation]}
                  min={-180}
                  max={180}
                  step={1}
                  onValueChange={([v]) => setLayers((p) => p.map((l) => (l.id === selected.id ? { ...l, rotation: v } : l)))}
                />
              </div>

              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                <div className="font-medium">Background removal</div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!selected.removeBg?.enabled}
                    onChange={(e) =>
                      setLayers((p) =>
                        p.map((l) =>
                          l.id === selected.id ? { ...l, removeBg: { ...(l.removeBg || { color: "#ffffff", tol: 60 }), enabled: e.target.checked } } : l,
                        ),
                      )
                    }
                  />
                  Enable
                </label>
                <label className="flex items-center gap-2 text-sm">
                  Color
                  <input
                    type="color"
                    value={selected.removeBg?.color || "#ffffff"}
                    onChange={(e) =>
                      setLayers((p) =>
                        p.map((l) => (l.id === selected.id ? { ...l, removeBg: { ...(l.removeBg || { enabled: true, tol: 60 }), color: e.target.value } } : l)),
                      )
                    }
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  Tol
                  <Input
                    type="number"
                    className="w-20 bg-gray-800 border-gray-700"
                    min={1}
                    max={255}
                    value={selected.removeBg?.tol ?? 60}
                    onChange={(e) =>
                      setLayers((p) =>
                        p.map((l) => (l.id === selected.id ? { ...l, removeBg: { ...(l.removeBg || { enabled: true, color: "#ffffff" }), tol: Number(e.target.value) || 60 } } : l)),
                      )
                    }
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
