import type { CheckInPayload } from "./types";

export const FALLBACK_SUMMARY =
  "This suggestion is based on the answers you just gave. It is here to help you navigate support options, not to diagnose you or assess clinical risk.";

export type InterpretationResult = {
  summary: string;
  supportNeed: string;
  personalizedMessage: string;
  themes: string[];
};

const inFlight = new Map<string, Promise<InterpretationResult | null>>();
const resolved = new Map<string, InterpretationResult | null>();

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function interpretationCacheKey(payload: CheckInPayload) {
  return [
    payload.initialConcern.trim(),
    payload.answers.duration,
    payload.answers.impact,
    payload.answers.support,
    payload.answers.counsellor,
  ].join("\u0001");
}

function parseInterpretation(value: unknown): InterpretationResult | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const { summary, supportNeed, personalizedMessage, themes } = value as Record<
    string,
    unknown
  >;

  if (!isNonEmptyString(summary) || !isNonEmptyString(personalizedMessage)) {
    return null;
  }

  return {
    summary: summary.trim(),
    supportNeed: isNonEmptyString(supportNeed) ? supportNeed.trim() : "",
    personalizedMessage: personalizedMessage.trim(),
    themes: Array.isArray(themes)
      ? themes.filter(
          (theme): theme is string =>
            typeof theme === "string" && theme.trim().length > 0,
        )
      : [],
  };
}

async function requestInterpretation(
  payload: CheckInPayload,
): Promise<InterpretationResult | null> {
  try {
    const response = await fetch("/api/interpretation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        concern: payload.initialConcern,
        answers: payload.answers,
      }),
    });

    if (!response.ok) {
      return null;
    }

    return parseInterpretation(await response.json());
  } catch {
    return null;
  }
}

export function loadInterpretation(payload: CheckInPayload) {
  const key = interpretationCacheKey(payload);
  const cached = resolved.get(key);

  if (cached !== undefined) {
    return Promise.resolve(cached);
  }

  const pending = inFlight.get(key);

  if (pending) {
    return pending;
  }

  const request = requestInterpretation(payload)
    .then((result) => {
      if (result) {
        resolved.set(key, result);
      }

      return result;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request);
  return request;
}
