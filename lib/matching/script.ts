import type {
  ChatMessage,
  ConversationAnswer,
  ConversationSnapshot,
  FollowUpQuestion,
} from "@/lib/conversation/types";
import {
  AVAILABILITY_ANSWERS,
  COUNSELLING_STYLE_ANSWERS,
  LANGUAGE_ANSWERS,
  SESSION_MODE_ANSWERS,
} from "./types";

export const MATCHING_OPENING_MESSAGE =
  "A few preferences will help narrow illustrative therapist profiles. There are no right or wrong answers, and this is not a clinical assessment.";

export const MATCHING_CLOSING_MESSAGE =
  "Thank you. Here are a few fictional profiles that may be a useful place to start.";

export const MATCHING_QUESTIONS: readonly FollowUpQuestion[] = [
  {
    id: "language",
    prompt: "Which language would you prefer for sessions?",
    options: LANGUAGE_ANSWERS,
  },
  {
    id: "sessionMode",
    prompt: "How would you prefer to meet?",
    options: SESSION_MODE_ANSWERS,
  },
  {
    id: "counsellingStyle",
    prompt: "What counselling style would feel most comfortable?",
    options: COUNSELLING_STYLE_ANSWERS,
  },
  {
    id: "availability",
    prompt: "When are you usually available?",
    options: AVAILABILITY_ANSWERS,
  },
];

export function createMatchingSnapshot(
  answers: ConversationAnswer[],
): ConversationSnapshot {
  const relevantAnswers = answers.filter((answer) =>
    MATCHING_QUESTIONS.some((question) => question.id === answer.questionId),
  );
  const messages: ChatMessage[] = [
    {
      id: "assistant-matching-opening",
      role: "assistant",
      content: MATCHING_OPENING_MESSAGE,
    },
  ];

  let nextQuestion: FollowUpQuestion | null = null;

  for (const question of MATCHING_QUESTIONS) {
    const answer = relevantAnswers.find(
      (item) => item.questionId === question.id,
    );

    messages.push({
      id: `assistant-${question.id}`,
      role: "assistant",
      content: question.prompt,
    });

    if (!answer || !question.options.includes(answer.value)) {
      nextQuestion = question;
      break;
    }

    messages.push({
      id: `user-${question.id}`,
      role: "user",
      content: answer.value,
    });
  }

  if (!nextQuestion) {
    messages.push({
      id: "assistant-matching-closing",
      role: "assistant",
      content: MATCHING_CLOSING_MESSAGE,
    });
  }

  const totalSteps = MATCHING_QUESTIONS.length;
  const isComplete = nextQuestion === null;
  const currentStep = isComplete
    ? totalSteps
    : relevantAnswers.length + 1;

  return {
    messages,
    currentQuestion: nextQuestion,
    answers: relevantAnswers,
    isComplete,
    stageLabel: isComplete
      ? "Preferences complete"
      : `Preference ${currentStep} of ${totalSteps}`,
    currentStep,
    totalSteps,
  };
}
