import type { ConversationRole } from "@/lib/conversation/types";

type ChatBubbleProps = {
  role: ConversationRole;
  children: string;
};

export function ChatBubble({ role, children }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <p
        className={`animate-message-in max-w-[min(85%,28rem)] px-4 py-3 leading-relaxed ${
          isUser
            ? "rounded-[1.4rem] rounded-br-md bg-plum text-sm text-white sm:text-[0.95rem]"
            : "rounded-[1.4rem] rounded-bl-md bg-surface text-body text-ink shadow-(--shadow-quiet)"
        }`}
      >
        {children}
      </p>
    </div>
  );
}
