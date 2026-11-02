import Link from "next/link";
import { buttonClassName } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

type EmptyStateProps = {
  title: string;
  body: string;
  actionHref: string;
  actionLabel: string;
};

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <Surface className="max-w-xl">
      <h1 className="font-serif text-title text-ink text-balance">{title}</h1>
      <p className="mt-3 text-body leading-relaxed text-ink-soft">{body}</p>
      <Link href={actionHref} className={`${buttonClassName("primary")} mt-6`}>
        {actionLabel}
      </Link>
    </Surface>
  );
}
