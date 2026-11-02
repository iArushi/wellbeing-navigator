import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SkeletonText } from "@/components/ui/SkeletonText";

type InsightCardProps = {
  label: string;
  tone?: "paper" | "mist" | "sage";
  loading?: boolean;
  loadingLabel?: string;
  children?: ReactNode;
};

const toneClass = {
  paper: "border-line",
  mist: "border-plum/45 bg-plum-mist/40 py-4 pr-4",
  sage: "border-sage/50",
} as const;

export function InsightCard({
  label,
  tone = "paper",
  loading = false,
  loadingLabel = "Loading",
  children,
}: InsightCardProps) {
  return (
    <section className={`border-l-2 pl-5 ${toneClass[tone]}`.trim()}>
      <Eyebrow tone={tone === "sage" ? "sage" : tone === "mist" ? "plum" : "ink"}>
        {label}
      </Eyebrow>
      <div
        className={`mt-2 leading-relaxed ${
          tone === "paper"
            ? "font-serif text-lg text-ink"
            : "text-body text-ink-soft"
        }`}
        aria-live="polite"
        aria-busy={loading}
      >
        {loading ? <SkeletonText lines={3} label={loadingLabel} /> : children}
      </div>
    </section>
  );
}
