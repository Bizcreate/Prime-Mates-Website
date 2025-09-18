// components/bg-editor.tsx
// Draw composed at device pixels for best quality
compose(img, maskRef.current!, ctx);
out.toBlob((blob) => {
if (!blob) return;
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url; a.download = 'cutout.png'; a.click();
URL.revokeObjectURL(url);
}, 'image/png');
}


function onFile(files: FileList | null) { (async () => { if (!files || !files[0]) return; const image = await readImageFile(files[0]); setImg(image); })(); }


// Paste from clipboard
useEffect(() => {
async function onPaste(ev: ClipboardEvent) {
const items = ev.clipboardData?.items; if (!items) return;
for (const it of items) {
if (it.type.startsWith('image/')) { const file = it.getAsFile(); if (file) { const image = await readImageFile(file); setImg(image); } }
}
}
window.addEventListener('paste', onPaste as any);
return () => window.removeEventListener('paste', onPaste as any);
}, []);


return (
<div className="space-y-4">
<div className="flex flex-wrap items-center gap-2">
<input type="file" accept="image/*" onChange={(e)=>onFile(e.target.files)} />
<Button onClick={()=>setMode('erase')} className={mode==='erase'?'border-pink-500 text-pink-400':''}>Erase</Button>
<Button onClick={()=>setMode('restore')} className={mode==='restore'?'border-pink-500 text-pink-400':''}>Restore</Button>
<Range label="Brush" value={brush} onChange={setBrush} min={5} max={200} />
<Button onClick={()=>setShowOverlay(!showOverlay)}>{showOverlay?'Hide overlay':'Show overlay'}</Button>
<Button onClick={()=>histRef.current?.undo()}>Undo</Button>
<Button onClick={()=>histRef.current?.redo()}>Redo</Button>
<Button onClick={()=>resetMask(true)}>Fill keep</Button>
<Button onClick={()=>resetMask(false)}>Fill remove</Button>
<Button onClick={exportPng}>Export PNG</Button>
</div>


{!img && (
<div
onDragOver={(e)=>{e.preventDefault();}}
onDrop={(e)=>{e.preventDefault(); onFile(e.dataTransfer?.files || null);}}
className="grid h-64 place-items-center rounded-xl border border-dashed border-neutral-700 text-sm opacity-80"
>Drop or choose an image… (paste also works)</div>
)}


{img && (
<div className="relative inline-block">
<canvas ref={checkerRef} className="absolute left-0 top-0" />
<canvas
ref={previewRef}
className="relative z-10"
onPointerDown={onPointerDown}
onPointerMove={onPointerMove}
onPointerUp={onPointerUp}
/>
{showOverlay && <canvas ref={overlayRef} className="absolute left-0 top-0 z-20 pointer-events-none" />}
{/* mask canvas is hidden */}
<canvas ref={maskRef} className="hidden" />
</div>
)}
</div>
);
}
