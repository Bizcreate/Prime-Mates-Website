"use client";

import React from "react";

export type TemplateId = "none" | "skateboard" | "surfboard" | "snowboard" | "body";

export const TEMPLATES: Record<Exclude<TemplateId, "none">, { label: string; url: string }> = {
  skateboard: { label: "Skateboard", url: "/templates/skateboard.png" },
  surfboard:  { label: "Surfboard",  url: "/templates/surfboard.png"  },
  snowboard:  { label: "Snowboard",  url: "/templates/snowboard.png"  },
  body:       { label: "Body cut",   url: "/templates/body.png"       },
};

export function TemplateControls({
  value,
  alpha,
  keepInside,
  onChange,
}: {
  value: TemplateId;
  alpha: number;
  keepInside: boolean;
  onChange: (next: { value?: TemplateId; alpha?: number; keepInside?: boolean }) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-800 p-3 space-y-3 bg-gray-900/60">
      <div className="text-sm font-semibold">Templates</div>

      <div className="flex flex-wrap gap-2">
        <button
          className={`px-3 py-1 rounded ${value === "none" ? "bg-yellow-500 text-black" : "bg-gray-800"}`}
          onClick={() => onChange({ value: "none" })}
        >
          None
        </button>
        {Object.entries(TEMPLATES).map(([id, t]) => (
          <button
            key={id}
            className={`px-3 py-1 rounded ${value === id ? "bg-yellow-500 text-black" : "bg-gray-800"}`}
            onClick={() => onChange({ value: id as any })}
          >
            {t.label}
          </button>
        ))}
      </div>

      {value !== "none" && (
        <>
          <div className="flex items-center gap-3">
            <span className="text-xs opacity-70">Overlay</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={alpha}
              onChange={(e) => onChange({ alpha: parseFloat(e.target.value) })}
              className="w-40"
            />
            <span className="text-xs opacity-70">{Math.round(alpha * 100)}%</span>
          </div>
          <label className="inline-flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={keepInside}
              onChange={(e) => onChange({ keepInside: e.target.checked })}
            />
            Keep artwork inside template
          </label>
        </>
      )}
    </div>
  );
}
