import { mentionsDuration } from "../conversation/coverage";
import type { ConversationAnswer } from "../conversation/types";
import {
  COUNSELLOR_ANSWERS,
  DURATION_ANSWERS,
  IMPACT_ANSWERS,
  SUPPORT_ANSWERS,
  type CheckInAnswers,
  type CheckInPayload,
  type CounsellorAnswer,
  type DurationAnswer,
  type ImpactAnswer,
  type SupportAnswer,
} from "./types";

export function inferDurationFromConcern(text: string): DurationAnswer | null {
  const normalized = text.toLowerCase();

  if (/\b(?:year|years|a long time|for a while)\b/.test(normalized)) {
    return "A long time";
  }

  if (/\b(?:month|months)\b/.test(normalized)) {
    return "A few months";
  }

  if (/\b(?:week|weeks)\b/.test(normalized)) {
    return "A few weeks";
  }

  if (/\b(?:day|days)\b/.test(normalized)) {
    return "A few days";
  }

  return mentionsDuration(text) ? "A few weeks" : null;
}

function includesValue<T extends string>(
  values: readonly T[],
  value: unknown,
): value is T {
  return typeof value === "string" && values.includes(value as T);
}

export function getAnswerValue(
  answers: ConversationAnswer[],
  questionId: string,
): string | undefined {
  return answers.find((answer) => answer.questionId === questionId)?.value;
}

export function buildCheckInPayload(
  initialConcern: string,
  answers: ConversationAnswer[],
): CheckInPayload | null {
  const concern = initialConcern.trim();

  if (!concern) {
    return null;
  }

  const durationValue = getAnswerValue(answers, "duration");
  const duration = includesValue(DURATION_ANSWERS, durationValue)
    ? durationValue
    : inferDurationFromConcern(concern);

  const impact = getAnswerValue(answers, "impact");
  const support = getAnswerValue(answers, "support");
  const counsellor = getAnswerValue(answers, "counsellor");

  if (
    !duration ||
    !includesValue(IMPACT_ANSWERS, impact) ||
    !includesValue(SUPPORT_ANSWERS, support) ||
    !includesValue(COUNSELLOR_ANSWERS, counsellor)
  ) {
    return null;
  }

  return {
    initialConcern: concern,
    answers: {
      duration,
      impact,
      support,
      counsellor,
    },
  };
}

export function isCheckInPayload(value: unknown): value is CheckInPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Partial<CheckInPayload>;
  const answers = payload.answers as Partial<CheckInAnswers> | undefined;

  return (
    typeof payload.initialConcern === "string" &&
    payload.initialConcern.trim().length > 0 &&
    includesValue(DURATION_ANSWERS, answers?.duration) &&
    includesValue(IMPACT_ANSWERS, answers?.impact) &&
    includesValue(SUPPORT_ANSWERS, answers?.support) &&
    includesValue(COUNSELLOR_ANSWERS, answers?.counsellor)
  );
}

export function createCheckInPayload(
  initialConcern: string,
  answers: {
    duration: DurationAnswer;
    impact: ImpactAnswer;
    support: SupportAnswer;
    counsellor: CounsellorAnswer;
  },
): CheckInPayload {
  return {
    initialConcern,
    answers,
  };
}
