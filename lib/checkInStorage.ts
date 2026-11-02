import {
  buildCheckInPayload,
  isCheckInPayload,
} from "@/lib/recommendation/answers";
import type { CheckInPayload } from "@/lib/recommendation/types";
import type { ConversationAnswer } from "@/lib/conversation/types";

const CONCERN_KEY = "yourdost.navigator.initialConcern";
const ANSWERS_KEY = "yourdost.navigator.answers";
const CHECKIN_KEY = "yourdost.navigator.checkIn";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function resetCheckIn() {
  if (!canUseStorage()) {
    return;
  }

  sessionStorage.removeItem(CONCERN_KEY);
  sessionStorage.removeItem(ANSWERS_KEY);
  sessionStorage.removeItem(CHECKIN_KEY);
}

export function startCheckIn(concern: string) {
  if (!canUseStorage()) {
    return;
  }

  resetCheckIn();
  sessionStorage.setItem(CONCERN_KEY, concern);
}

export function readInitialConcern(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  const value = sessionStorage.getItem(CONCERN_KEY)?.trim() ?? "";
  return value.length > 0 ? value : null;
}

export function readAnswers(): ConversationAnswer[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = sessionStorage.getItem(ANSWERS_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is ConversationAnswer =>
        typeof item === "object" &&
        item !== null &&
        typeof item.questionId === "string" &&
        typeof item.value === "string",
    );
  } catch {
    return [];
  }
}

export function writeAnswers(answers: ConversationAnswer[]) {
  if (!canUseStorage()) {
    return;
  }

  sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
}

export function saveCheckInPayload(payload: CheckInPayload) {
  if (!canUseStorage()) {
    return;
  }

  sessionStorage.setItem(CONCERN_KEY, payload.initialConcern);
  sessionStorage.setItem(
    ANSWERS_KEY,
    JSON.stringify(
      Object.entries(payload.answers).map(([questionId, value]) => ({
        questionId,
        value,
      })),
    ),
  );
  sessionStorage.setItem(CHECKIN_KEY, JSON.stringify(payload));
}

export function readCheckInPayload(): CheckInPayload | null {
  if (!canUseStorage()) {
    return null;
  }

  const concern = readInitialConcern();
  const latestFromAnswers = concern
    ? buildCheckInPayload(concern, readAnswers())
    : null;

  if (latestFromAnswers) {
    return latestFromAnswers;
  }

  const raw = sessionStorage.getItem(CHECKIN_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isCheckInPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
