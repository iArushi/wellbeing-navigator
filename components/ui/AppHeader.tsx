import type { ReactNode } from "react";
import { BrandMark } from "@/components/ui/BrandMark";

type AppHeaderProps = {
  trailing?: ReactNode;
  width?: "wide" | "reading";
};

export function AppHeader({ trailing, width = "reading" }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-surface/80 backdrop-blur-md">
      <div
        className={`mx-auto flex min-h-16 items-center justify-between gap-3 px-5 py-3 sm:px-8 ${
          width === "wide" ? "max-w-6xl" : "max-w-3xl"
        }`}
      >
        <BrandMark />
        {trailing}
      </div>
    </header>
  );
}
