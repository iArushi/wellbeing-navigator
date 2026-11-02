import { NextResponse } from "next/server";
import OpenAI, { APIError } from "openai";
import { CONCERN_TAGS, type ConcernTag } from "@/lib/matching/types";

export const runtime = "nodejs";

const MODEL = "openrouter/free";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const MAX_CONCERN_LENGTH = 4000;
const MAX_ANSWER_LENGTH = 500;

type NavigationAnswers = {
  duration: string;
  impact: string;
  support: string;
  counsellor: string;
};

type Interpretation = {
  summary: string;
  supportNeed: string;
  personalizedMessage: string;
  themes: ConcernTag[];
};

const ANSWER_KEYS = ["duration", "impact", "support", "counsellor"] as const;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

function parseAnswers(value: unknown): NavigationAnswers | null {
  if (Array.isArray(value)) {
    const collected: Partial<NavigationAnswers> = {};

    for (const item of value) {
      if (
        typeof item !== "object" ||
        item === null ||
        !isNonEmptyString((item as { questionId?: unknown }).questionId, 100) ||
        !isNonEmptyString((item as { value?: unknown }).value, MAX_ANSWER_LENGTH)
      ) {
        return null;
      }

      const questionId = (item as { questionId: string }).questionId.trim();
      const answerValue = (item as { value: string }).value.trim();

      if ((ANSWER_KEYS as readonly string[]).includes(questionId)) {
        collected[questionId as keyof NavigationAnswers] = answerValue;
      }
    }

    if (ANSWER_KEYS.every((key) => isNonEmptyString(collected[key], MAX_ANSWER_LENGTH))) {
      return collected as NavigationAnswers;
    }

    return null;
  }

  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const answers: Partial<NavigationAnswers> = {};

  for (const key of ANSWER_KEYS) {
    if (!isNonEmptyString(record[key], MAX_ANSWER_LENGTH)) {
      return null;
    }

    answers[key] = record[key].trim();
  }

  return answers as NavigationAnswers;
}

function parseRequest(body: unknown): { concern: string; answers: NavigationAnswers } | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const { concern, answers } = body as { concern?: unknown; answers?: unknown };

  if (!isNonEmptyString(concern, MAX_CONCERN_LENGTH)) {
    return null;
  }

  const parsedAnswers = parseAnswers(answers);

  if (!parsedAnswers) {
    return null;
  }

  return {
    concern: concern.trim(),
    answers: parsedAnswers,
  };
}

function parseInterpretation(value: unknown): Interpretation | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const { summary, supportNeed, personalizedMessage, themes } = value as Record<string, unknown>;

  if (
    !isNonEmptyString(summary, 1000) ||
    !isNonEmptyString(supportNeed, 1000) ||
    !isNonEmptyString(personalizedMessage, 1000)
  ) {
    return null;
  }

  const parsedThemes = Array.isArray(themes)
    ? [...new Set(
        themes.filter(
          (theme): theme is ConcernTag =>
            typeof theme === "string" &&
            (CONCERN_TAGS as readonly string[]).includes(theme),
        ),
      )]
    : [];

  return {
    summary: summary.trim(),
    supportNeed: supportNeed.trim(),
    personalizedMessage: personalizedMessage.trim(),
    themes: parsedThemes,
  };
}

function parseInterpretationText(text: string | null | undefined): Interpretation | null {
  if (!text) {
    return null;
  }

  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

  try {
    return parseInterpretation(JSON.parse(trimmed) as unknown);
  } catch {
    return null;
  }
}

function buildSystemPrompt() {
  return `You are writing a brief, warm reflection for an employee wellbeing navigation tool.

The product already has a separate deterministic engine that chooses the support category. You must not choose, rank, or recommend a service.

Use only the information provided. Do not invent details, motives, diagnoses, or history that the employee did not state.

Return only a single JSON object. Do not include markdown, commentary, or extra keys.
The JSON must contain these keys:
- summary: a short, empathetic reflection of what the employee expressed.
- supportNeed: a concise description of the kind of support they seem to be looking for, based only on their stated preference.
- personalizedMessage: a short, warm explanation that can accompany a recommendation already chosen by the product. Do not name or select a service.
- themes: an array of zero or more theme ids clearly present in the employee's own words. Allowed ids only: academic-stress, work-stress, anxiety, relationships, low-motivation, sleep, adjustment, social-disconnection, work-life-balance. Multiple themes are allowed. Return [] if none are clearly present.

Rules:
- Do not diagnose conditions.
- Do not assess clinical risk or safety.
- Do not prescribe treatment.
- Do not independently select a service or next step.
- Do not invent themes that the employee did not state.
- Do not make assumptions beyond the information provided.`;
}

function buildUserPrompt(concern: string, answers: NavigationAnswers) {
  return `Employee concern:
${concern}

Navigation answers:
- How long they have been feeling this way: ${answers.duration}
- How much this is affecting daily life: ${answers.impact}
- What would feel most helpful right now: ${answers.support}
- Comfort speaking with a counsellor: ${answers.counsellor}`;
}

function isAuthError(error: APIError) {
  return error.status === 401 || error.status === 403;
}

function sanitizeProviderMessage(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  const withoutKey = apiKey ? value.split(apiKey).join("[redacted]") : value;
  const sanitized = withoutKey
    .replace(/https?:\/\/\S+/gi, "[url]")
    .replace(/\b(?:api[_-]?key|key|token|bearer)\s*[:=]\s*\S+/gi, "[redacted]")
    .replace(/\bsk-[a-zA-Z0-9_-]+/g, "[redacted]")
    .replace(/\bsk-or-v1-[a-zA-Z0-9_-]+/g, "[redacted]");

  return sanitized.trim().slice(0, 240) || null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readNestedMessage(value: unknown, depth = 0): string | null {
  if (depth > 3) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return readNestedMessage(JSON.parse(trimmed), depth + 1) ?? trimmed;
      } catch {
        return trimmed;
      }
    }

    return trimmed;
  }

  const record = asRecord(value);

  if (!record) {
    return null;
  }

  for (const key of ["message", "detail", "details", "msg", "error"]) {
    const nested = readNestedMessage(record[key], depth + 1);

    if (nested) {
      return nested;
    }
  }

  return null;
}

function readOpenRouterRequestId(error: APIError): string | null {
  if (typeof error.requestID === "string" && error.requestID.trim()) {
    return error.requestID.trim();
  }

  const headerNames = ["x-request-id", "x-openrouter-request-id"];

  for (const name of headerNames) {
    const value = error.headers?.get(name)?.trim();
    if (value) {
      return value;
    }
  }

  return null;
}

function readScalarCode(value: unknown): string | number | null {
  return typeof value === "string" || typeof value === "number" ? value : null;
}

function readOpenRouterDetails(error: APIError) {
  const body = asRecord(error.error);
  const metadata = asRecord(body?.metadata);
  const upstreamMessage =
    readNestedMessage(metadata?.raw) ??
    readNestedMessage(body?.message) ??
    readNestedMessage(error.message);

  return {
    status: error.status ?? null,
    type:
      (typeof metadata?.error_type === "string" && metadata.error_type) ||
      error.type ||
      error.name,
    code: readScalarCode(body?.code) ?? readScalarCode(error.code),
    provider: typeof metadata?.provider_name === "string" ? metadata.provider_name : null,
    providerCode: readScalarCode(metadata?.provider_code),
    message: sanitizeProviderMessage(upstreamMessage),
    requestId: readOpenRouterRequestId(error),
    model: MODEL,
  };
}

function logSafeApiError(error: unknown) {
  if (!(error instanceof APIError)) {
    console.error("[interpretation-diagnostic]", {
      status: null,
      type: error instanceof Error ? error.name : typeof error,
      code: null,
      provider: null,
      providerCode: null,
      message: sanitizeProviderMessage(error instanceof Error ? error.message : null),
      requestId: null,
      model: MODEL,
    });
    return;
  }

  console.error("[interpretation-diagnostic]", readOpenRouterDetails(error));
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const parsed = parseRequest(body);

  if (!parsed) {
    return jsonError(
      "Send a concern and answers for duration, impact, support, and counsellor.",
      400,
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return jsonError("The interpretation service is not configured.", 500);
  }

  try {
    const client = new OpenAI({
      apiKey,
      baseURL: OPENROUTER_BASE_URL,
      maxRetries: 0,
    });
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.4,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserPrompt(parsed.concern, parsed.answers) },
      ],
      response_format: { type: "json_object" },
    });

    const interpretation = parseInterpretationText(completion.choices[0]?.message?.content);

    if (!interpretation) {
      return jsonError("The interpretation service returned an unexpected response.", 502);
    }

    return NextResponse.json(interpretation);
  } catch (error) {
    logSafeApiError(error);

    if (error instanceof APIError && isAuthError(error)) {
      return jsonError("The interpretation service is not configured.", 500);
    }

    return jsonError("The interpretation service is temporarily unavailable.", 502);
  }
}
