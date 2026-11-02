import type { HTMLAttributes, ReactNode } from "react";

type EyebrowTone = "plum" | "sage" | "ink";

type EyebrowProps = HTMLAttributes<HTMLParagraphElement> & {
  tone?: EyebrowTone;
  children: ReactNode;
};

const toneClass: Record<EyebrowTone, string> = {
  plum: "text-plum",
  sage: "text-sage",
  ink: "text-ink-faint",
};

export function Eyebrow({
  tone = "plum",
  className = "",
  children,
  ...props
}: EyebrowProps) {
  return (
    <p
      className={`text-eyebrow font-medium tracking-[0.16em] uppercase ${toneClass[tone]} ${className}`.trim()}
      {...props}
    >
      {children}
    </p>
  );
}
