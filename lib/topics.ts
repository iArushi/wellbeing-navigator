export const TOPIC_CHIPS = [
  "Work stress",
  "Feeling anxious",
  "Low motivation",
  "Sleep difficulties",
  "Relationship concerns",
  "Feeling disconnected",
] as const;

export type TopicChip = (typeof TOPIC_CHIPS)[number];

export function includesTopic(text: string, topic: string): boolean {
  return text.toLowerCase().includes(topic.toLowerCase());
}

export function appendTopic(text: string, topic: string): string {
  const trimmed = text.trim();

  if (!trimmed) {
    return topic;
  }

  if (includesTopic(trimmed, topic)) {
    return text;
  }

  const separator = /[.!?]$/.test(trimmed) ? " " : ". ";
  return `${trimmed}${separator}${topic}`;
}

export function removeTopic(text: string, topic: string): string {
  const escaped = topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `(?:^|[\\s,;:]+)${escaped}(?=$|[\\s,;.!?]+)`,
    "gi",
  );

  return text
    .replace(pattern, " ")
    .replace(/\s+([,;.!?])/g, "$1")
    .replace(/^[,\s;:.!?]+/, "")
    .replace(/[,;\s]+$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function toggleTopic(text: string, topic: string): string {
  return includesTopic(text, topic)
    ? removeTopic(text, topic)
    : appendTopic(text, topic);
}
