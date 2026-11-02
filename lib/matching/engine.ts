import type { ConversationAnswer } from "@/lib/conversation/types";
import { recommendNextStep } from "@/lib/recommendation/engine";
import type { CheckInPayload } from "@/lib/recommendation/types";
import { deriveConcernTags } from "./concerns";
import { slotsForProfile, themeLabel, THERAPIST_PROFILES } from "./dataset";
import {
  AVAILABILITY_ANSWERS,
  COUNSELLING_STYLE_ANSWERS,
  LANGUAGE_ANSWERS,
  SESSION_MODE_ANSWERS,
  type AvailabilityAnswer,
  type CounsellingStyleAnswer,
  type LanguageAnswer,
  type MatchScoreBreakdown,
  type MatchingPreferences,
  type MatchingResult,
  type TherapistMatch,
  type TherapistProfile,
} from "./types";

const WEIGHTS = {
  concernFit: 0.4,
  trackRecord: 0.25,
  styleFit: 0.2,
  availabilityFit: 0.15,
} as const;

const STYLE_FAMILIES: readonly (readonly CounsellingStyleAnswer[])[] = [
  ["Structured and goal-focused", "CBT-informed"],
  ["Listening and reflective", "Exploratory"],
];

function includesValue<T extends string>(
  values: readonly T[],
  value: unknown,
): value is T {
  return typeof value === "string" && values.includes(value as T);
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function getAnswerValue(
  answers: ConversationAnswer[],
  questionId: string,
): string | undefined {
  return answers.find((answer) => answer.questionId === questionId)?.value;
}

export function canEnterMatching(payload: CheckInPayload): boolean {
  return recommendNextStep(payload).primary.id === "counselling";
}

export function buildMatchingPreferences(
  answers: ConversationAnswer[],
): MatchingPreferences | null {
  const language = getAnswerValue(answers, "language");
  const sessionMode = getAnswerValue(answers, "sessionMode");
  const counsellingStyle = getAnswerValue(answers, "counsellingStyle");
  const availability = getAnswerValue(answers, "availability");

  if (
    !includesValue(LANGUAGE_ANSWERS, language) ||
    !includesValue(SESSION_MODE_ANSWERS, sessionMode) ||
    !includesValue(COUNSELLING_STYLE_ANSWERS, counsellingStyle) ||
    !includesValue(AVAILABILITY_ANSWERS, availability)
  ) {
    return null;
  }

  return {
    language,
    sessionMode,
    counsellingStyle,
    availability,
  };
}

function isEligible(
  profile: TherapistProfile,
  preferences: MatchingPreferences,
): boolean {
  if (
    preferences.language !== "No preference" &&
    !profile.languages.includes(preferences.language)
  ) {
    return false;
  }

  if (!profile.sessionModes.includes(preferences.sessionMode)) {
    return false;
  }

  if (
    preferences.availability !== "Flexible" &&
    !profile.availability.includes(preferences.availability)
  ) {
    return false;
  }

  return true;
}

function scoreConcernFit(
  profile: TherapistProfile,
  concern: ReturnType<typeof deriveConcernTags>,
) {
  if (!concern.reliable) {
    return 0.5;
  }

  const overlap = concern.tags.filter((tag) =>
    profile.specialties.includes(tag),
  ).length;

  return clamp01(overlap / concern.tags.length);
}

function scoreTrackRecord(profile: TherapistProfile) {
  return clamp01(
    0.7 * (profile.yearsExperience / 15) + 0.3 * (profile.relevantYears / 10),
  );
}

function stylesAreRelated(
  left: CounsellingStyleAnswer,
  right: CounsellingStyleAnswer,
) {
  return STYLE_FAMILIES.some(
    (family) => family.includes(left) && family.includes(right),
  );
}

function scoreStyleFit(
  profile: TherapistProfile,
  preferred: CounsellingStyleAnswer,
) {
  if (profile.styles.includes(preferred)) {
    return 1;
  }

  if (profile.styles.some((style) => stylesAreRelated(style, preferred))) {
    return 0.5;
  }

  return 0;
}

function scoreAvailabilityFit(
  profile: TherapistProfile,
  preferred: AvailabilityAnswer,
) {
  if (preferred === "Flexible") {
    return clamp01(profile.availability.length / 3);
  }

  return profile.availability.includes(preferred) ? 1 : 0;
}

function scoreProfile(
  profile: TherapistProfile,
  preferences: MatchingPreferences,
  concern: ReturnType<typeof deriveConcernTags>,
): MatchScoreBreakdown {
  const concernFit = scoreConcernFit(profile, concern);
  const trackRecord = scoreTrackRecord(profile);
  const styleFit = scoreStyleFit(profile, preferences.counsellingStyle);
  const availabilityFit = scoreAvailabilityFit(
    profile,
    preferences.availability,
  );

  return {
    concernFit,
    trackRecord,
    styleFit,
    availabilityFit,
    total:
      WEIGHTS.concernFit * concernFit +
      WEIGHTS.trackRecord * trackRecord +
      WEIGHTS.styleFit * styleFit +
      WEIGHTS.availabilityFit * availabilityFit,
  };
}

function describeLanguage(language: LanguageAnswer) {
  return language === "No preference"
    ? "your language preference was kept open"
    : `they list ${language} among their session languages`;
}

function describeAvailability(availability: AvailabilityAnswer) {
  return availability === "Flexible"
    ? "their listed windows can stay flexible"
    : `${availability.toLowerCase()} appears in their illustrative availability`;
}

function buildExplanation(
  profile: TherapistProfile,
  preferences: MatchingPreferences,
  concern: ReturnType<typeof deriveConcernTags>,
  score: MatchScoreBreakdown,
): string {
  const specialtyOverlap = concern.tags.filter((tag) =>
    profile.specialties.includes(tag),
  );
  const concernLabel = specialtyOverlap.map(themeLabel).join(", ");

  const parts: string[] = [];

  if (!concern.reliable) {
    parts.push(
      "No specific concern tags were detected from the check-in note, so concern overlap was not used to include, exclude, or prefer this profile.",
    );
  } else if (specialtyOverlap.length > 0) {
    parts.push(
      `This fictional profile lists ${concernLabel} among their illustrative specialties, which overlaps with themes from the check-in note.`,
    );
  } else {
    parts.push(
      "No keyword overlap was found with their listed specialties, so concern fit did not raise this profile.",
    );
  }

  parts.push(
    `They offer ${preferences.sessionMode.toLowerCase()} sessions, and ${describeLanguage(preferences.language)}.`,
  );

  if (score.styleFit === 1) {
    parts.push(
      `Their listed style includes ${preferences.counsellingStyle.toLowerCase()}, matching the preference you chose.`,
    );
  } else if (score.styleFit === 0.5) {
    parts.push(
      `Their listed style is related to ${preferences.counsellingStyle.toLowerCase()}, so it may still feel familiar.`,
    );
  }

  parts.push(
    `${describeAvailability(preferences.availability).replace(/^./, (letter) => letter.toUpperCase())}.`,
  );

  const openings = slotsForProfile(profile.id, preferences.sessionMode)
    .slice(0, 2)
    .map(
      (slot) =>
        `${slot.weekday} ${slot.start}–${slot.end} on ${slot.sessionModes[0].toLowerCase()}`,
    );

  if (openings.length > 0) {
    parts.push(`Illustrative openings include ${openings.join(" and ")}.`);
  }
  parts.push(
    `Listed experience on this fictional profile is ${profile.yearsExperience} years. The 25% experience weight is an illustrative prototype assumption, not a measure of clinical quality or outcomes.`,
  );
  parts.push(
    "Matching scores are illustrative and not validated. This is a product match from fictional profiles, not a clinical assessment or a substitute for professional judgement.",
  );

  return parts.join(" ");
}

function compareMatches(left: TherapistMatch, right: TherapistMatch) {
  if (right.score.total !== left.score.total) {
    return right.score.total - left.score.total;
  }

  return left.profile.id.localeCompare(right.profile.id);
}

export function matchTherapists(
  payload: CheckInPayload,
  preferences: MatchingPreferences,
  themes?: readonly string[],
): MatchingResult {
  const concern = deriveConcernTags(payload.initialConcern, themes);
  const ranked = THERAPIST_PROFILES.filter((profile) =>
    isEligible(profile, preferences),
  )
    .map((profile) => {
      const score = scoreProfile(profile, preferences, concern);

      return {
        profile,
        score,
        explanation: buildExplanation(profile, preferences, concern, score),
      };
    })
    .sort(compareMatches);

  return {
    featured: ranked.slice(0, 3),
    others: ranked.slice(3),
    concern,
  };
}

export const MATCHING_WEIGHTS = WEIGHTS;
