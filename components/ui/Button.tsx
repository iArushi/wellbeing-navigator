import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "chip";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  selected?: boolean;
  children: ReactNode;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "inline-flex min-h-(--touch-min) items-center justify-center rounded-full bg-plum px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-plum-deep disabled:cursor-not-allowed disabled:bg-lavender-mid disabled:text-white/80",
  secondary:
    "inline-flex min-h-(--touch-min) items-center justify-center rounded-full border border-line bg-surface px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-plum-mist disabled:cursor-not-allowed disabled:text-ink-faint",
  ghost:
    "inline-flex min-h-(--touch-min) items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-plum-mist hover:text-ink",
  chip: "inline-flex min-h-(--touch-min) items-center justify-center rounded-full border px-4 py-2 text-sm transition-colors duration-[120ms]",
};

export function buttonClassName(
  variant: ButtonVariant = "primary",
  selected = false,
) {
  const selectedChip = selected
    ? "border-plum bg-plum-mist text-plum-deep"
    : "border-line bg-surface text-ink-soft hover:border-lavender-mid hover:bg-plum-mist";

  return `${variantClass[variant]} ${variant === "chip" ? selectedChip : ""}`.trim();
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      selected = false,
      className = "",
      type = "button",
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={variant === "chip" ? selected : undefined}
        className={`${buttonClassName(variant, selected)} ${className}`.trim()}
        {...props}
      >
        {children}
      </button>
    );
  },
);
