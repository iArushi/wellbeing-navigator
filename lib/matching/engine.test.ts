import { canEnterMatching, matchTherapists } from "./engine";
import { buildFeedbackDemonstration } from "./feedbackDemo";
import { THERAPIST_PROFILES, getTherapistProfile } from "./profiles";
import { SESSION_MODE_ANSWERS, type MatchingPreferences } from "./types";

const counsellingPayload = {
  initialConcern:
    "I have been feeling overwhelmed at work and I cannot switch off after hours.",
  answers: {
    duration: "A few months" as const,
    impact: "Significantly" as const,
    support: "Someone to talk to" as const,
    counsellor: "Yes" as const,
  },
};

const selfHelpPayload = {
  initialConcern: "Work has felt busy for a few weeks.",
  answers: {
    duration: "A few weeks" as const,
    impact: "Somewhat" as const,
    support: "Practical strategies" as const,
    counsellor: "Not right now" as const,
  },
};

const videoEnglishEvenings: MatchingPreferences = {
  language: "English",
  sessionMode: "Video",
  counsellingStyle: "Structured and goal-focused",
  availability: "Weekday evenings",
};

if ((SESSION_MODE_ANSWERS as readonly string[]).includes("In-person")) {
  throw new Error("In-person must not be a session mode in this prototype.");
}

if (THERAPIST_PROFILES.length !== 12) {
  throw new Error(
    `Expected 12 fictional counsellor profiles, received ${THERAPIST_PROFILES.length}.`,
  );
}

const feedbackDemo = buildFeedbackDemonstration();

if (feedbackDemo.totalRecords < 30 || !feedbackDemo.synthetic) {
  throw new Error("Synthetic feedback demonstration is missing or too small.");
}

if (!canEnterMatching(counsellingPayload)) {
  throw new Error("Counselling recommendations should be able to enter matching.");
}

if (canEnterMatching(selfHelpPayload)) {
  throw new Error("Non-counselling recommendations must not enter matching.");
}

const englishVideoMatches = matchTherapists(
  counsellingPayload,
  videoEnglishEvenings,
);
const meher = getTherapistProfile("meher-qureshi");
const allEnglishVideo = englishVideoMatches.featured.concat(
  englishVideoMatches.others,
);

if (allEnglishVideo.some((match) => match.profile.id === meher.id)) {
  throw new Error(
    "Meher Qureshi should fail the English/video eligibility filter despite a long listed-experience band.",
  );
}

if (englishVideoMatches.featured.length !== 3) {
  throw new Error(
    `Expected three featured matches, received ${englishVideoMatches.featured.length}.`,
  );
}

if (allEnglishVideo.length < 4) {
  throw new Error("Eligible catalogues should leave some profiles to explore.");
}

if (englishVideoMatches.concern.reliable !== true) {
  throw new Error("Work-stress keywords should be treated as a reliable concern signal.");
}

for (const match of allEnglishVideo) {
  if (!match.profile.languages.includes("English")) {
    throw new Error(`${match.profile.id} passed without the required language.`);
  }

  if (!match.profile.sessionModes.includes("Video")) {
    throw new Error(`${match.profile.id} passed without the required session mode.`);
  }

  if (!match.profile.availability.includes("Weekday evenings")) {
    throw new Error(`${match.profile.id} passed without overlapping availability.`);
  }

  if (!match.explanation.includes("illustrative prototype assumption")) {
    throw new Error(`${match.profile.id} is missing the illustrative experience disclosure.`);
  }

  if (!match.explanation.includes("not a measure of clinical quality")) {
    throw new Error(`${match.profile.id} treats listed years as quality.`);
  }
}

const weekendMatches = matchTherapists(counsellingPayload, {
  language: "English",
  sessionMode: "Video",
  counsellingStyle: "Listening and reflective",
  availability: "Weekends",
});
const meera = weekendMatches.featured
  .concat(weekendMatches.others)
  .find((match) => match.profile.id === "farah-khan");

if (!meera) {
  throw new Error(
    "Farah Khan should stay eligible on language, mode and time even without a work-stress specialty overlap.",
  );
}

if (meera.score.concernFit !== 0) {
  throw new Error("Missing concern overlap should score 0, not exclude the profile.");
}

if (!meera.explanation.includes("No keyword overlap was found")) {
  throw new Error("Missing concern overlap should be explained transparently.");
}

const vagueMatches = matchTherapists(
  {
    ...counsellingPayload,
    initialConcern: "Things have felt a bit off lately.",
  },
  videoEnglishEvenings,
);

if (vagueMatches.concern.reliable) {
  throw new Error("A note without keywords should be marked as an unreliable concern signal.");
}

for (const match of vagueMatches.featured.concat(vagueMatches.others)) {
  if (match.score.concernFit !== 0.5) {
    throw new Error("Unreliable concern tags should use a neutral 0.5 concern-fit score.");
  }

  if (!match.explanation.includes("No specific concern tags were detected")) {
    throw new Error("Unreliable concern tags should be disclosed in the explanation.");
  }
}

const noMatches = matchTherapists(counsellingPayload, {
  language: "Hindi",
  sessionMode: "Video",
  counsellingStyle: "Structured and goal-focused",
  availability: "Weekday mornings",
});

if (noMatches.featured.length !== 0 || noMatches.others.length !== 0) {
  throw new Error("Hard filters must be able to return zero matches without inventing profiles.");
}

const twoMatches = matchTherapists(counsellingPayload, {
  language: "Hindi",
  sessionMode: "Chat",
  counsellingStyle: "Exploratory",
  availability: "Weekday evenings",
});
const twoMatchCount = twoMatches.featured.length + twoMatches.others.length;

if (twoMatchCount !== 2) {
  throw new Error(
    `Expected exactly two Hindi evening chat matches, received ${twoMatchCount}.`,
  );
}

if (twoMatches.featured.length !== 2 || twoMatches.others.length !== 0) {
  throw new Error("Fewer than three matches must not be padded into an explore-others list.");
}

const scores = englishVideoMatches.featured.map((match) => match.score.total);
if (scores[0] < scores[1] || scores[1] < scores[2]) {
  throw new Error("Featured matches must be ranked by descending weighted score.");
}

const cbtMatches = matchTherapists(counsellingPayload, {
  ...videoEnglishEvenings,
  counsellingStyle: "CBT-informed",
});
const structuredMatch = cbtMatches.featured
  .concat(cbtMatches.others)
  .find((match) => match.profile.id === "priya-nair");

if (!structuredMatch) {
  throw new Error("Priya Nair should remain eligible for English evening video.");
}

if (structuredMatch.score.styleFit !== 1) {
  throw new Error("Exact style overlap should score 1.");
}

const relatedStyle = allEnglishVideo.find(
  (match) => match.profile.id === "noah-bennet",
);

if (!relatedStyle) {
  throw new Error("Noah Bennett should stay eligible for English evening video.");
}

if (relatedStyle.score.styleFit !== 0.5) {
  throw new Error("Related styles should score 0.5, not an exact match.");
}

const expectedPriya =
  0.4 * structuredMatch.score.concernFit +
  0.25 * structuredMatch.score.trackRecord +
  0.2 * structuredMatch.score.styleFit +
  0.15 * structuredMatch.score.availabilityFit;

if (Math.abs(structuredMatch.score.total - expectedPriya) > 1e-10) {
  throw new Error("Weighted total does not use the Task 2 weights.");
}

const themedMatches = matchTherapists(
  counsellingPayload,
  videoEnglishEvenings,
  ["work-stress"],
);

if (themedMatches.concern.source !== "interpretation") {
  throw new Error("Valid interpretation themes should be preferred over keywords.");
}

if (
  themedMatches.concern.tags.join(",") !== "work-stress" ||
  themedMatches.concern.tags.includes("sleep")
) {
  throw new Error("Interpretation themes should not be mixed with keyword fallback.");
}

const afterFeedback = matchTherapists(
  counsellingPayload,
  videoEnglishEvenings,
);

if (
  afterFeedback.featured[0]?.score.total !==
  englishVideoMatches.featured[0]?.score.total
) {
  throw new Error("Synthetic feedback must not change matching scores.");
}

console.log("All matching engine tests passed.");
