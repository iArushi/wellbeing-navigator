import { Button } from "@/components/ui/Button";
import { TherapistMonogram } from "@/components/ui/TherapistMonogram";
import type {
  MatchingPreferences,
  TherapistMatch,
} from "@/lib/matching/types";

type TherapistCardProps = {
  match: TherapistMatch;
  preferences: MatchingPreferences;
  onOpen: () => void;
};

function whyThisMayFit(explanation: string) {
  const sentences = explanation
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return sentences.slice(0, 2).join(" ");
}

function profileDescriptor(title: string) {
  return title.replace(/^Illustrative\s+/i, "");
}

export function TherapistCard({
  match,
  preferences,
  onOpen,
}: TherapistCardProps) {
  const { profile, explanation } = match;
  const languageTag =
    preferences.language === "No preference"
      ? profile.languages[0]
      : preferences.language;
  const tags = [languageTag, preferences.sessionMode].filter(
    (tag): tag is NonNullable<typeof tag> => Boolean(tag),
  );

  return (
    <article className="flex h-full flex-col rounded-[2rem] border border-line/80 bg-surface-raised p-6 shadow-(--shadow-quiet)">
      <div className="flex items-start gap-4">
        <TherapistMonogram name={profile.name} />
        <div className="min-w-0">
          <h3 className="text-balance font-serif text-section text-ink">
            {profile.name}
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            {profileDescriptor(profile.title)}
          </p>
        </div>
      </div>

      <ul
        className="mt-4 flex flex-wrap gap-1.5"
        aria-label={`${profile.name} matching details`}
      >
        {tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full bg-canvas px-2.5 py-1 text-caption text-ink-soft"
          >
            {tag}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-caption text-ink-faint">
        {profile.yearsExperience} years listed experience, illustrative
      </p>

      <p className="mt-3 line-clamp-4 flex-1 text-sm leading-relaxed text-ink-soft">
        {whyThisMayFit(explanation)}
      </p>

      <Button onClick={onOpen} className="mt-6 w-full">
        Explore profile
      </Button>
    </article>
  );
}
