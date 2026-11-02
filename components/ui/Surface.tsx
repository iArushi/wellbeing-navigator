import type { HTMLAttributes, ReactNode } from "react";

type SurfaceTone = "quiet" | "raised" | "tinted" | "sage";

type SurfaceProps = HTMLAttributes<HTMLElement> & {
  tone?: SurfaceTone;
  as?: "section" | "article" | "div";
  children: ReactNode;
};

const toneClass: Record<SurfaceTone, string> = {
  quiet: "border-line bg-surface shadow-(--shadow-quiet)",
  raised:
    "border-plum/20 bg-surface-raised shadow-(--shadow-raised)",
  tinted: "border-transparent bg-plum-mist/80",
  sage: "border-sage/20 bg-sage-soft",
};

export function Surface({
  tone = "quiet",
  as: Component = "section",
  className = "",
  children,
  ...props
}: SurfaceProps) {
  return (
    <Component
      className={`rounded-(--radius-card) border p-6 sm:p-8 ${toneClass[tone]} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}
