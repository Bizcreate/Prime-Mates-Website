"use client";

import * as React from "react";

export type SliderProps = {
  /** shadcn-style: current value in a single-element array */
  value?: number[];
  /** shadcn-style: default value in a single-element array */
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
};

export function Slider({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  className,
  disabled,
  ...rest
}: SliderProps) {
  const isControlled = Array.isArray(value);
  const [internal, setInternal] = React.useState<number>(
    (defaultValue?.[0] ?? value?.[0] ?? min) as number,
  );

  const current = isControlled ? (value as number[])[0] : internal;

  React.useEffect(() => {
    if (isControlled && typeof value?.[0] === "number") {
      setInternal(value[0] as number);
    }
  }, [isControlled, value]);

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={current}
      onChange={(e) => {
        const v = Number(e.target.value);
        if (!isControlled) setInternal(v);
        onValueChange?.([v]);
      }}
      disabled={disabled}
      className={[
        "w-full h-2 appearance-none rounded-lg",
        "bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed",
        className || "",
      ].join(" ")}
      {...rest}
    />
  );
}

export default Slider;
