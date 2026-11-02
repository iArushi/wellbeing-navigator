import { Button } from "@/components/ui/Button";
import type { FollowUpQuestion } from "@/lib/conversation/types";

type QuestionOptionsProps = {
  question: FollowUpQuestion;
  onSelect: (value: string) => void;
};

export function QuestionOptions({ question, onSelect }: QuestionOptionsProps) {
  return (
    <div
      role="group"
      aria-label={question.prompt}
      className="animate-message-in flex flex-wrap gap-2"
    >
      {question.options.map((option) => (
        <Button
          key={option}
          variant="chip"
          onClick={() => onSelect(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
