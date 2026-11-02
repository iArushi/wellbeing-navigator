import type { CatalogueItem, RecommendationId } from "./types";

export const CATALOGUE: readonly CatalogueItem[] = [
  {
    id: "self-help",
    category: "Self-help resource",
    title: "Try a short stress-management exercise",
    description: "Explore a practical exercise to help manage everyday stress.",
    detail:
      "This category would usually offer a short, practical exercise, such as a breathing or grounding activity you can try in a few minutes. In this prototype, no live exercise library is connected.",
    isIllustrative: true,
  },
  {
    id: "self-check",
    category: "Wellbeing self-check",
    title: "Explore a wellbeing self-check",
    description:
      "Reflect on how your current feelings may be affecting your daily life.",
    detail:
      "This category would usually offer a brief reflective check-in about how you are doing. It is not a clinical assessment, and this prototype does not score, diagnose or label what you are experiencing.",
    isIllustrative: true,
  },
  {
    id: "counselling",
    category: "Counselling",
    title: "Explore speaking with a counsellor",
    description:
      "Connect with a qualified professional to talk through what you're experiencing.",
    detail:
      "This category would usually help you explore a conversation with a qualified counsellor through your organisation's wellbeing support. Booking is not available in this prototype.",
    isIllustrative: true,
  },
  {
    id: "programme",
    category: "Wellbeing programme",
    title: "Explore a guided wellbeing programme",
    description: "Build helpful habits through a structured series of activities.",
    detail:
      "This category would usually introduce a structured series of wellbeing activities you can follow over time. The live programme is not connected in this prototype.",
    isIllustrative: true,
  },
];

export function getCatalogueItem(id: RecommendationId): CatalogueItem {
  const item = CATALOGUE.find((entry) => entry.id === id);

  if (!item) {
    throw new Error(`Unknown catalogue item: ${id}`);
  }

  return item;
}
