"use client";

import { cn } from "@/lib/utils";

export function DotBackgroundDemo({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-gray-100 overflow-hidden">
      <div
        className={cn(
          "absolute inset-0",
          "bg-size-[20px_20px]",
          "bg-[radial-gradient(#404040_1px,transparent_1px)]",
        )}
      />
      <div className="pointer-events-none absolute inset-0 mask-[radial-gradient(ellipse_at_center,transparent_20%,black)] :bg-black"></div>

      {/* whatever you pass as children */}
      <div className="relative z-20">{children}</div>
    </div>
  );
}
