import { getCatalogueItem } from "./catalogue";
import type {
  CatalogueItem,
  CheckInPayload,
  CounsellorAnswer,
  RecommendationId,
  RecommendationResult,
} from "./types";

function getAlternatives(
  primaryId: RecommendationId,
  counsellor: CounsellorAnswer,
): CatalogueItem[] {
  const hideCounselling = counsellor === "Not right now";

  return (
    [
      getCatalogueItem("self-help"),
      getCatalogueItem("self-check"),
      getCatalogueItem("programme"),
      getCatalogueItem("counselling"),
    ] as const
  )
    .filter((item) => {
      if (item.id === primaryId) {
        return false;
      }

      if (hideCounselling && item.id === "counselling") {
        return false;
      }

      return true;
    })
    .slice(0, 2);
}

export function recommendNextStep(
  payload: CheckInPayload,
): RecommendationResult {
  const { answers } = payload;
  const offerOptionalHumanSupport =
    answers.impact === "Significantly" && answers.counsellor === "Not right now";

  let primaryId: RecommendationId;
  let explanation: string;

  if (
    (answers.impact === "Significantly" || answers.impact === "Quite a bit") &&
    (answers.counsellor === "Yes" || answers.counsellor === "Maybe")
  ) {
    primaryId = "counselling";
    explanation = `You said this is affecting your daily life ${answers.impact.toLowerCase()}, and you are open to speaking with a counsellor. Exploring a conversation with a qualified professional is a useful next step. This is a product suggestion, not a diagnosis or clinical assessment.`;
  } else if (
    answers.support === "Someone to talk to" &&
    (answers.counsellor === "Yes" || answers.counsellor === "Maybe")
  ) {
    primaryId = "counselling";
    explanation =
      "You said it would help to talk to someone, and you are open to counselling. Exploring a conversation with a counsellor is a reasonable place to start. This is a product suggestion, not a diagnosis or clinical assessment.";
  } else if (answers.support === "Understanding what I'm experiencing") {
    primaryId = "self-check";
    explanation =
      "You wanted to understand what you are experiencing. A wellbeing self-check can help you reflect on that without labelling what you are going through.";
  } else if (answers.support === "I'm not sure") {
    primaryId = "self-check";
    explanation =
      "You were not sure what would feel most helpful. A wellbeing self-check is a gentle way to take stock before choosing a next step.";
  } else if (
    answers.support === "Practical strategies" &&
    (answers.duration === "A few months" || answers.duration === "A long time")
  ) {
    primaryId = "programme";
    explanation = `You asked for practical strategies, and you mentioned this has lasted ${answers.duration.toLowerCase()}. A guided wellbeing programme can help you build helpful habits over time.`;
  } else if (
    answers.support === "Practical strategies" &&
    (answers.duration === "A few days" || answers.duration === "A few weeks")
  ) {
    primaryId = "self-help";
    explanation = `You asked for practical strategies, and this has been more recent (${answers.duration.toLowerCase()}). A short stress-management exercise is a simple place to start.`;
  } else {
    primaryId = "self-check";
    explanation =
      "Based on what you shared, a wellbeing self-check is a low-pressure way to decide what kind of support might be useful next.";
  }

  if (offerOptionalHumanSupport) {
    explanation +=
      " You also said daily life feels significantly affected. Counselling is optional here — you can explore human support if and when that feels right.";
  }

  return {
    primary: getCatalogueItem(primaryId),
    alternatives: getAlternatives(primaryId, answers.counsellor),
    explanation,
    offerOptionalHumanSupport,
  };
}
