import { buildCheckInPayload } from "./answers";
import { recommendNextStep } from "./engine";
import type { CheckInAnswers, RecommendationId } from "./types";

const scenarios: {
  name: string;
  answers: CheckInAnswers;
  expected: RecommendationId;
}[] = [
  {
    name: "Test A",
    answers: {
      duration: "A few months",
      impact: "Significantly",
      support: "Practical strategies",
      counsellor: "Yes",
    },
    expected: "counselling",
  },
  {
    name: "Test B",
    answers: {
      duration: "A few months",
      impact: "Significantly",
      support: "Practical strategies",
      counsellor: "Not right now",
    },
    expected: "programme",
  },
  {
    name: "Test C",
    answers: {
      duration: "A few days",
      impact: "Somewhat",
      support: "Practical strategies",
      counsellor: "Not right now",
    },
    expected: "self-help",
  },
  {
    name: "Test D",
    answers: {
      duration: "A few weeks",
      impact: "Somewhat",
      support: "Understanding what I'm experiencing",
      counsellor: "Maybe",
    },
    expected: "self-check",
  },
  {
    name: "Test E",
    answers: {
      duration: "A few weeks",
      impact: "Quite a bit",
      support: "Someone to talk to",
      counsellor: "Yes",
    },
    expected: "counselling",
  },
  {
    name: "Test F",
    answers: {
      duration: "A few months",
      impact: "Significantly",
      support: "I'm not sure",
      counsellor: "Maybe",
    },
    expected: "counselling",
  },
  {
    name: "Test G",
    answers: {
      duration: "A few months",
      impact: "Quite a bit",
      support: "Understanding what I'm experiencing",
      counsellor: "Yes",
    },
    expected: "counselling",
  },
  {
    name: "Test H",
    answers: {
      duration: "A few months",
      impact: "Quite a bit",
      support: "Understanding what I'm experiencing",
      counsellor: "Maybe",
    },
    expected: "counselling",
  },
];

for (const scenario of scenarios) {
  const result = recommendNextStep({
    initialConcern: "I have been feeling overwhelmed at work.",
    answers: scenario.answers,
  });

  if (result.primary.id !== scenario.expected) {
    throw new Error(
      `${scenario.name} failed: expected ${scenario.expected}, received ${result.primary.id}`,
    );
  }

  if (result.alternatives.length !== 2) {
    throw new Error(`${scenario.name} did not return two alternatives`);
  }

  if (result.alternatives.some((item) => item.id === result.primary.id)) {
    throw new Error(`${scenario.name} repeated the primary recommendation`);
  }
}

const captured = buildCheckInPayload("Work stress", [
  { questionId: "duration", value: "A few months" },
  { questionId: "impact", value: "Significantly" },
  { questionId: "support", value: "Practical strategies" },
  { questionId: "counsellor", value: "Not right now" },
]);

if (!captured) {
  throw new Error("Fourth answer was not captured into the check-in payload.");
}

if (captured.answers.counsellor !== "Not right now") {
  throw new Error(
    `Counsellor answer was stored incorrectly: ${captured.answers.counsellor}`,
  );
}

const yesResult = recommendNextStep({
  initialConcern: captured.initialConcern,
  answers: { ...captured.answers, counsellor: "Yes" },
});
const noResult = recommendNextStep({
  initialConcern: captured.initialConcern,
  answers: captured.answers,
});

if (yesResult.primary.id === noResult.primary.id) {
  throw new Error(
    "Changing the counsellor answer did not change the recommendation.",
  );
}

console.log("All recommendation tests passed.");
