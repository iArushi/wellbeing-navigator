import availabilityData from "./data/availability.json";
import counsellorData from "./data/counsellors.json";
import taxonomyData from "./data/concern_taxonomy.json";
import {
  AVAILABILITY_ANSWERS,
  CLIENT_GROUPS,
  CONCERN_TAGS,
  COUNSELLING_STYLE_ANSWERS,
  LANGUAGE_ANSWERS,
  SESSION_MODE_ANSWERS,
  type AvailabilitySlot,
  type AvailabilityWindow,
  type ClientGroup,
  type ConcernTag,
  type CounsellingStyleAnswer,
  type SessionModeAnswer,
  type SpokenLanguage,
  type TherapistProfile,
} from "./types";

type TaxonomyTheme = {
  id: string;
  label: string;
  keywords: string[];
};

function includesValue<T extends string>(
  values: readonly T[],
  value: unknown,
): value is T {
  return typeof value === "string" && values.includes(value as T);
}

function asList<T extends string>(
  values: unknown,
  allowed: readonly T[],
): T[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.filter((value): value is T => includesValue(allowed, value));
}

export const CONCERN_TAXONOMY: readonly TaxonomyTheme[] =
  taxonomyData.themes.filter((theme) =>
    includesValue(CONCERN_TAGS, theme.id),
  );

export function themeLabel(tag: ConcernTag) {
  return CONCERN_TAXONOMY.find((theme) => theme.id === tag)?.label ?? tag;
}

export const AVAILABILITY_SLOTS: readonly AvailabilitySlot[] =
  availabilityData.slots.flatMap((slot) => {
    const sessionModes = asList(slot.sessionModes, SESSION_MODE_ANSWERS);

    if (sessionModes.length === 0) {
      return [];
    }

    return [
      {
        counsellorId: slot.counsellorId,
        weekday: slot.weekday as AvailabilitySlot["weekday"],
        window: slot.window as AvailabilitySlot["window"],
        start: slot.start,
        end: slot.end,
        sessionModes,
      },
    ];
  });

function mapCounsellor(entry: (typeof counsellorData.counsellors)[number]): TherapistProfile | null {
  const languages = asList(
    entry.languages,
    LANGUAGE_ANSWERS.filter((item) => item !== "No preference"),
  ) as SpokenLanguage[];
  const sessionModes = asList(entry.sessionModes, SESSION_MODE_ANSWERS);
  const styles = asList(entry.approaches, COUNSELLING_STYLE_ANSWERS);
  const availability = asList(
    entry.availabilityWindows,
    AVAILABILITY_ANSWERS.filter((item) => item !== "Flexible"),
  ) as AvailabilityWindow[];
  const specialties = asList(entry.specialisations, CONCERN_TAGS);
  const clientGroups = asList(entry.clientGroups, CLIENT_GROUPS);

  if (
    !languages.length ||
    !sessionModes.length ||
    !styles.length ||
    !availability.length ||
    !specialties.length
  ) {
    return null;
  }

  return {
    id: entry.id,
    name: entry.name,
    title: entry.title,
    summary: entry.summary,
    detail: entry.detail,
    languages,
    sessionModes,
    styles,
    availability,
    specialties,
    clientGroups: clientGroups as ClientGroup[],
    professionalScope: entry.professionalScope,
    referralBoundaries: entry.referralBoundaries,
    yearsExperience: entry.yearsExperience,
    relevantYears: entry.relevantYears,
    isIllustrative: true,
  };
}

export const THERAPIST_PROFILES: readonly TherapistProfile[] =
  counsellorData.counsellors.flatMap((entry) => {
    const profile = mapCounsellor(entry);
    return profile ? [profile] : [];
  });

export function getTherapistProfile(id: string): TherapistProfile {
  const profile = THERAPIST_PROFILES.find((entry) => entry.id === id);

  if (!profile) {
    throw new Error(`Unknown therapist profile: ${id}`);
  }

  return profile;
}

export function slotsForProfile(
  profileId: string,
  sessionMode?: SessionModeAnswer,
): AvailabilitySlot[] {
  return AVAILABILITY_SLOTS.filter((slot) => {
    if (slot.counsellorId !== profileId) {
      return false;
    }

    return sessionMode ? slot.sessionModes.includes(sessionMode) : true;
  });
}
