import { Button } from "@/components/ui/Button";
import type { MatchingPreferences } from "@/lib/matching/types";

type PreferencePillsProps = {
  preferences: MatchingPreferences;
  onModify: () => void;
};

export function PreferencePills({
  preferences,
  onModify,
}: PreferencePillsProps) {
  const pills = [
    preferences.language,
    preferences.sessionMode,
    preferences.counsellingStyle,
    preferences.availability,
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ul
        className="flex min-w-0 flex-wrap items-center gap-1.5"
        aria-label="Your matching preferences"
      >
        {pills.map((pill) => (
          <li
            key={pill}
            className="rounded-full bg-canvas px-3 py-1 text-caption text-ink-soft"
          >
            {pill}
          </li>
        ))}
      </ul>
      <Button variant="secondary" onClick={onModify} className="shrink-0">
        Edit preferences
      </Button>
    </div>
  );
}
