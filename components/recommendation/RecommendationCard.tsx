import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { CatalogueItem } from "@/lib/recommendation/types";

type RecommendationCardProps = {
  item: CatalogueItem;
  featured?: boolean;
  actionLabel: string;
  onOpen: () => void;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
};

export function RecommendationCard({
  item,
  featured = false,
  actionLabel,
  onOpen,
  secondaryAction,
}: RecommendationCardProps) {
  if (!featured) {
    return (
      <article className="flex flex-col gap-4 border-t border-line/80 py-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="min-w-0">
          <Eyebrow tone="ink">{item.category}</Eyebrow>
          <h3 className="mt-2 text-balance font-serif text-section text-ink">
            {item.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-body">
            {item.description}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={onOpen}
          className="w-full shrink-0 sm:w-auto"
        >
          {actionLabel}
        </Button>
      </article>
    );
  }

  return (
    <article className="hero-stage card-lift rounded-[2rem] px-6 py-8 sm:px-10 sm:py-10">
      <p className="inline-flex rounded-full bg-plum-mist px-3 py-1 text-eyebrow font-medium tracking-[0.16em] text-plum uppercase">
        {item.category}
      </p>
      <h3 className="mt-5 text-balance font-serif text-title text-ink sm:text-[2.5rem] sm:leading-[1.12]">
        {item.title}
      </h3>
      <p className="mt-4 max-w-xl text-body leading-relaxed text-ink-soft">
        {item.description}
      </p>
      <p className="mt-5 text-caption font-medium tracking-wide text-ink-faint uppercase">
        Illustrative catalogue item
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button onClick={onOpen} className="w-full sm:w-auto">
          {actionLabel}
        </Button>
        {secondaryAction ? (
          <Button
            variant="secondary"
            onClick={secondaryAction.onClick}
            className="w-full sm:w-auto"
          >
            {secondaryAction.label}
          </Button>
        ) : null}
      </div>
    </article>
  );
}
