export const LANGUAGE_ANSWERS = [
  "English",
  "Hindi",
  "Tamil",
  "Kannada",
  "No preference",
] as const;

export const SESSION_MODE_ANSWERS = [
  "Video",
  "Audio",
  "Chat",
] as const;

export const COUNSELLING_STYLE_ANSWERS = [
  "Structured and goal-focused",
  "Listening and reflective",
  "CBT-informed",
  "Exploratory",
] as const;

export const AVAILABILITY_ANSWERS = [
  "Weekday mornings",
  "Weekday evenings",
  "Weekends",
  "Flexible",
] as const;

export const CONCERN_TAGS = [
  "academic-stress",
  "work-stress",
  "anxiety",
  "relationships",
  "low-motivation",
  "sleep",
  "adjustment",
  "social-disconnection",
  "work-life-balance",
] as const;

export const CLIENT_GROUPS = [
  "college-students",
  "young-adults",
  "working-professionals",
] as const;

export type LanguageAnswer = (typeof LANGUAGE_ANSWERS)[number];
export type SessionModeAnswer = (typeof SESSION_MODE_ANSWERS)[number];
export type CounsellingStyleAnswer = (typeof COUNSELLING_STYLE_ANSWERS)[number];
export type AvailabilityAnswer = (typeof AVAILABILITY_ANSWERS)[number];
export type ConcernTag = (typeof CONCERN_TAGS)[number];
export type ClientGroup = (typeof CLIENT_GROUPS)[number];
export type SpokenLanguage = Exclude<LanguageAnswer, "No preference">;
export type AvailabilityWindow = Exclude<AvailabilityAnswer, "Flexible">;

export type MatchingPreferences = {
  language: LanguageAnswer;
  sessionMode: SessionModeAnswer;
  counsellingStyle: CounsellingStyleAnswer;
  availability: AvailabilityAnswer;
};

export type TherapistProfile = {
  id: string;
  name: string;
  title: string;
  summary: string;
  detail: string;
  languages: readonly SpokenLanguage[];
  sessionModes: readonly SessionModeAnswer[];
  styles: readonly CounsellingStyleAnswer[];
  availability: readonly AvailabilityWindow[];
  specialties: readonly ConcernTag[];
  clientGroups: readonly ClientGroup[];
  professionalScope: string;
  referralBoundaries: string;
  yearsExperience: number;
  relevantYears: number;
  isIllustrative: true;
};

export type AvailabilitySlot = {
  counsellorId: string;
  weekday: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  window: "morning" | "afternoon" | "evening";
  start: string;
  end: string;
  sessionModes: readonly SessionModeAnswer[];
};

export type MatchScoreBreakdown = {
  concernFit: number;
  trackRecord: number;
  styleFit: number;
  availabilityFit: number;
  total: number;
};

export type TherapistMatch = {
  profile: TherapistProfile;
  score: MatchScoreBreakdown;
  explanation: string;
};

export type ConcernSignal = {
  tags: ConcernTag[];
  reliable: boolean;
  source: "interpretation" | "keywords" | "none";
};

export type MatchingResult = {
  featured: TherapistMatch[];
  others: TherapistMatch[];
  concern: ConcernSignal;
};
