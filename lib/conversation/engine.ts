import { isQuestionCoveredByInitialConcern } from "@/lib/conversation/coverage";
import {
  CLOSING_ASSISTANT_MESSAGE,
  FOLLOW_UP_QUESTIONS,
  OPENING_ASSISTANT_MESSAGE,
  OPENING_ASSISTANT_MESSAGE_DURATION_KNOWN,
} from "@/lib/conversation/script";
import type {
  ChatMessage,
  ConversationAnswer,
  ConversationGuide,
  ConversationSnapshot,
  FollowUpQuestion,
} from "@/lib/conversation/types";

export function getActiveQuestions(
  initialConcern: string,
): FollowUpQuestion[] {
  return FOLLOW_UP_QUESTIONS.filter(
    (question) =>
      !isQuestionCoveredByInitialConcern(question.id, initialConcern),
  );
}

export function createConversationSnapshot(
  initialConcern: string,
  answers: ConversationAnswer[],
): ConversationSnapshot {
  const questions = getActiveQuestions(initialConcern);
  const relevantAnswers = answers.filter((answer) =>
    questions.some((question) => question.id === answer.questionId),
  );
  const answeredIds = new Set(
    relevantAnswers.map((answer) => answer.questionId),
  );

  const openingMessage = isQuestionCoveredByInitialConcern(
    "duration",
    initialConcern,
  )
    ? OPENING_ASSISTANT_MESSAGE_DURATION_KNOWN
    : OPENING_ASSISTANT_MESSAGE;

  const messages: ChatMessage[] = [
    {
      id: "user-initial",
      role: "user",
      content: initialConcern,
    },
    {
      id: "assistant-opening",
      role: "assistant",
      content: openingMessage,
    },
  ];

  let nextQuestion: FollowUpQuestion | null = null;

  for (const question of questions) {
    const answer = relevantAnswers.find(
      (item) => item.questionId === question.id,
    );

    messages.push({
      id: `assistant-${question.id}`,
      role: "assistant",
      content: question.prompt,
    });

    if (!answer) {
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
      id: "assistant-closing",
      role: "assistant",
      content: CLOSING_ASSISTANT_MESSAGE,
    });
  }

  const totalSteps = questions.length;
  const isComplete = nextQuestion === null;
  const currentStep = isComplete
    ? totalSteps
    : answeredIds.size + (totalSteps > 0 ? 1 : 0);

  return {
    messages,
    currentQuestion: nextQuestion,
    answers: relevantAnswers,
    isComplete,
    stageLabel: isComplete
      ? "Check-in complete"
      : `Question ${currentStep} of ${totalSteps}`,
    currentStep,
    totalSteps,
  };
}

export function appendAnswer(
  answers: ConversationAnswer[],
  question: FollowUpQuestion,
  value: string,
): ConversationAnswer[] {
  if (answers.some((answer) => answer.questionId === question.id)) {
    return answers;
  }

  return [...answers, { questionId: question.id, value }];
}

export const scriptedConversationGuide: ConversationGuide = {
  buildSnapshot: createConversationSnapshot,
};
