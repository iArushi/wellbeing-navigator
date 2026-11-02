export type ConversationRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ConversationRole;
  content: string;
};

export type FollowUpQuestion = {
  id: string;
  prompt: string;
  options: readonly string[];
};

export type ConversationAnswer = {
  questionId: string;
  value: string;
};

export type ConversationSnapshot = {
  messages: ChatMessage[];
  currentQuestion: FollowUpQuestion | null;
  answers: ConversationAnswer[];
  isComplete: boolean;
  stageLabel: string;
  currentStep: number;
  totalSteps: number;
};

export interface ConversationGuide {
  buildSnapshot(
    initialConcern: string,
    answers: ConversationAnswer[],
  ): ConversationSnapshot;
}
