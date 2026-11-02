import feedbackData from "./data/session_feedback.json";

export type FeedbackDemonstration = {
  synthetic: true;
  disclosure: string;
  totalRecords: number;
  feltUnderstoodShare: number;
  willingToContinueShare: number;
  approachFit: {
    good: number;
    mixed: number;
    poor: number;
  };
};

function share(count: number, total: number) {
  return total === 0 ? 0 : Math.round((count / total) * 100);
}

export function buildFeedbackDemonstration(): FeedbackDemonstration {
  const records = feedbackData.records.filter((record) => record.synthetic);
  const totalRecords = records.length;

  return {
    synthetic: true,
    disclosure:
      "These figures come from synthetic post-session records. They are a demonstration of how matching quality could be reviewed later. They do not change current matching scores, and they are not a measure of counsellor effectiveness.",
    totalRecords,
    feltUnderstoodShare: share(
      records.filter((record) => record.feltUnderstood).length,
      totalRecords,
    ),
    willingToContinueShare: share(
      records.filter((record) => record.willingToContinue).length,
      totalRecords,
    ),
    approachFit: {
      good: records.filter((record) => record.approachFit === "good").length,
      mixed: records.filter((record) => record.approachFit === "mixed").length,
      poor: records.filter((record) => record.approachFit === "poor").length,
    },
  };
}
