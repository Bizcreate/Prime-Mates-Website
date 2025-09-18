// app/editor/page.tsx
'use client';
import { BgEditor } from '@/components/bg-editor';


export default function EditorPage() {
return (
<div className="mx-auto max-w-5xl p-4">
<h1 className="mb-4 text-2xl font-bold">Background Removal Editor</h1>
<BgEditor />
</div>
);
}
```