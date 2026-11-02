import { type ReactNode } from "react";
import { ChatBubble } from "@/components/conversation/ChatBubble";
import { ConversationProgress } from "@/components/conversation/ConversationProgress";
import { QuestionOptions } from "@/components/conversation/QuestionOptions";
import type {
  ChatMessage,
  FollowUpQuestion,
} from "@/lib/conversation/types";

type ConversationRoomProps = {
  heading: string;
  currentStep: number;
  totalSteps: number;
  label: string;
  messages: ChatMessage[];
  currentQuestion: FollowUpQuestion | null;
  onSelect: (value: string) => void;
  footer?: ReactNode;
};

export function ConversationRoom({
  heading,
  currentStep,
  totalSteps,
  label,
  messages,
  currentQuestion,
  onSelect,
  footer,
}: ConversationRoomProps) {
  const visibleMessages = currentQuestion
    ? messages.filter(
        (message) => message.id !== `assistant-${currentQuestion.id}`,
      )
    : messages;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ConversationProgress
        heading={heading}
        currentStep={currentStep}
        totalSteps={totalSteps}
        label={label}
      />

      <div
        className="flex min-h-0 flex-1 flex-col-reverse overflow-hidden"
        aria-live="polite"
      >
        <div className="space-y-3 pb-4">
          {visibleMessages.map((message) => (
            <ChatBubble key={message.id} role={message.role}>
              {message.content}
            </ChatBubble>
          ))}
        </div>
      </div>

      {currentQuestion ? (
        <div className="shrink-0 border-t border-line/70 bg-canvas/92 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="mb-3 font-serif text-lg leading-snug text-ink">
            {currentQuestion.prompt}
          </p>
          <QuestionOptions
            question={currentQuestion}
            onSelect={onSelect}
          />
        </div>
      ) : (
        <div className="shrink-0 pb-8">{footer}</div>
      )}
    </div>
  );
}
