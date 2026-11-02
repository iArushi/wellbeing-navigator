import { AppHeader } from "@/components/ui/AppHeader";

export function Header() {
  return (
    <AppHeader
      width="wide"
      trailing={
        <p className="inline-flex min-h-(--touch-min) max-w-[13rem] items-center gap-2 rounded-full bg-sage-soft px-3.5 text-caption leading-snug text-sage sm:max-w-none">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-sage"
          />
          Your wellbeing journey is private.
        </p>
      }
    />
  );
}
