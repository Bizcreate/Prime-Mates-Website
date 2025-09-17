"use client";

import * as React from "react";
import type { GalleryItem } from "@/packages/prime-shared/gallery/types";
import { Card, CardContent } from "@/components/ui/card";

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  if (!items?.length) {
    return <div className="opacity-70 text-sm">No items yet.</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((it) => (
        <Card key={it.id} className="bg-black border-gray-800 overflow-hidden">
          <div className="aspect-square bg-gray-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.url}
              alt={it.title || "Gallery item"}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="p-3">
            <div className="text-sm font-medium truncate">{it.title || "Untitled"}</div>
            {it.tags?.length ? (
              <div className="mt-1 text-[10px] opacity-70 truncate">{it.tags.join(", ")}</div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
