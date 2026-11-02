import { Button } from "@/components/ui/Button";
import { includesTopic, type TopicChip } from "@/lib/topics";

type TopicChipsProps = {
  topics: readonly TopicChip[];
  value: string;
  onToggle: (topic: TopicChip) => void;
};

export function TopicChips({ topics, value, onToggle }: TopicChipsProps) {
  return (
    <div
      role="group"
      aria-label="Quick topics to add to your check-in"
      className="flex flex-wrap gap-2"
    >
      {topics.map((topic) => {
        const selected = includesTopic(value, topic);

        return (
          <Button
            key={topic}
            variant="chip"
            selected={selected}
            onClick={() => onToggle(topic)}
          >
            {topic}
          </Button>
        );
      })}
    </div>
  );
}
