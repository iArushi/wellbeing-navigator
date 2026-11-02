import type { FollowUpQuestion } from "@/lib/conversation/types";
import {
  COUNSELLOR_ANSWERS,
  DURATION_ANSWERS,
  IMPACT_ANSWERS,
  SUPPORT_ANSWERS,
} from "@/lib/recommendation/types";

export const OPENING_ASSISTANT_MESSAGE =
  "Thank you for sharing that. I'd like to understand a little more so I can suggest something useful. There are no right or wrong answers.";

export const OPENING_ASSISTANT_MESSAGE_DURATION_KNOWN =
  "Thank you for sharing that. You already mentioned how long this has been going on, so I won't ask that again. I'd like to understand a little more so I can suggest something useful. There are no right or wrong answers.";

export const CLOSING_ASSISTANT_MESSAGE =
  "Thank you. That's enough for now. When you're ready, you can see a recommended next step.";

export const FOLLOW_UP_QUESTIONS: readonly FollowUpQuestion[] = [
  {
    id: "duration",
    prompt: "How long have you been feeling this way?",
    options: DURATION_ANSWERS,
  },
  {
    id: "impact",
    prompt: "How much is this affecting your daily life?",
    options: IMPACT_ANSWERS,
  },
  {
    id: "support",
    prompt: "What would feel most helpful right now?",
    options: SUPPORT_ANSWERS,
  },
  {
    id: "counsellor",
    prompt: "Would you feel comfortable speaking to a counsellor?",
    options: COUNSELLOR_ANSWERS,
  },
];
