"use client";

import { ReactNode, useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

type PrototypeDialogProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
};

export function PrototypeDialog({
  title,
  subtitle,
  onClose,
  children,
}: PrototypeDialogProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="animate-scrim fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-fade-rise max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-(--radius-card) border border-line bg-surface-raised p-6 shadow-(--shadow-overlay) sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <Eyebrow tone="sage">Prototype demonstration</Eyebrow>
        <h2
          id={titleId}
          className="mt-3 text-balance font-serif text-title text-ink"
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-caption leading-relaxed text-ink-faint">
            {subtitle}
          </p>
        ) : null}
        <div className="mt-4 space-y-4 text-body leading-relaxed text-ink-soft">
          {children}
        </div>
        <Button
          ref={closeRef}
          variant="secondary"
          onClick={onClose}
          className="mt-6 w-full sm:w-auto"
        >
          Close
        </Button>
      </div>
    </div>
  );
}
