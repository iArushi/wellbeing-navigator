import type { ConversationAnswer } from "@/lib/conversation/types";
import { buildMatchingPreferences } from "./engine";
import type { MatchingPreferences } from "./types";

const MATCHING_PREFERENCES_KEY = "yourdost.navigator.matchingPreferences";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function resetMatchingPreferences() {
  if (!canUseStorage()) {
    return;
  }

  sessionStorage.removeItem(MATCHING_PREFERENCES_KEY);
}

export function readMatchingAnswers(): ConversationAnswer[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = sessionStorage.getItem(MATCHING_PREFERENCES_KEY);

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

export function writeMatchingAnswers(answers: ConversationAnswer[]) {
  if (!canUseStorage()) {
    return;
  }

  sessionStorage.setItem(MATCHING_PREFERENCES_KEY, JSON.stringify(answers));
}

export function readMatchingPreferences(): MatchingPreferences | null {
  return buildMatchingPreferences(readMatchingAnswers());
}
