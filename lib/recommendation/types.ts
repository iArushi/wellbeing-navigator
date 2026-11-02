export const DURATION_ANSWERS = [
  "A few days",
  "A few weeks",
  "A few months",
  "A long time",
] as const;

export const IMPACT_ANSWERS = [
  "Not much",
  "Somewhat",
  "Quite a bit",
  "Significantly",
] as const;

export const SUPPORT_ANSWERS = [
  "Practical strategies",
  "Someone to talk to",
  "Understanding what I'm experiencing",
  "I'm not sure",
] as const;

export const COUNSELLOR_ANSWERS = ["Yes", "Maybe", "Not right now"] as const;

export type DurationAnswer = (typeof DURATION_ANSWERS)[number];
export type ImpactAnswer = (typeof IMPACT_ANSWERS)[number];
export type SupportAnswer = (typeof SUPPORT_ANSWERS)[number];
export type CounsellorAnswer = (typeof COUNSELLOR_ANSWERS)[number];

export type CheckInAnswers = {
  duration: DurationAnswer;
  impact: ImpactAnswer;
  support: SupportAnswer;
  counsellor: CounsellorAnswer;
};

export type CheckInPayload = {
  initialConcern: string;
  answers: CheckInAnswers;
};

export type RecommendationId =
  | "self-help"
  | "self-check"
  | "counselling"
  | "programme";

export type CatalogueItem = {
  id: RecommendationId;
  category: string;
  title: string;
  description: string;
  detail: string;
  isIllustrative: true;
};

export type RecommendationResult = {
  primary: CatalogueItem;
  alternatives: CatalogueItem[];
  explanation: string;
  offerOptionalHumanSupport: boolean;
};
