"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ConversationHeader } from "@/components/conversation/ConversationHeader";
import { ConversationRoom } from "@/components/conversation/ConversationRoom";
import { SafetyNote } from "@/components/conversation/SafetyNote";
import { FeedbackDemoPanel } from "@/components/matching/FeedbackDemoPanel";
import { PreferencePills } from "@/components/matching/PreferencePills";
import { TherapistCard } from "@/components/matching/TherapistCard";
import { PrototypeDialog } from "@/components/recommendation/PrototypeDialog";
import { Button, buttonClassName } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonText } from "@/components/ui/SkeletonText";
import { Surface } from "@/components/ui/Surface";
import { TherapistMonogram } from "@/components/ui/TherapistMonogram";
import { readCheckInPayload } from "@/lib/checkInStorage";
import { appendAnswer } from "@/lib/conversation/engine";
import {
  buildMatchingPreferences,
  canEnterMatching,
  matchTherapists,
} from "@/lib/matching/engine";
import { createMatchingSnapshot } from "@/lib/matching/script";
import { loadInterpretation } from "@/lib/recommendation/interpretation";
import {
  readMatchingAnswers,
  resetMatchingPreferences,
  writeMatchingAnswers,
} from "@/lib/matching/storage";
import type { TherapistMatch } from "@/lib/matching/types";
import type { ConversationAnswer } from "@/lib/conversation/types";
import type { CheckInPayload } from "@/lib/recommendation/types";

type DialogState =
  | { type: "closed" }
  | { type: "profile"; match: TherapistMatch };

export function MatchingExperience() {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const [payload, setPayload] = useState<CheckInPayload | null>(null);
  const [answers, setAnswers] = useState<ConversationAnswer[]>([]);
  const [dialog, setDialog] = useState<DialogState>({ type: "closed" });
  const [themes, setThemes] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    setPayload(readCheckInPayload());
    setAnswers(readMatchingAnswers());
    setIsReady(true);
  }, [pathname]);

  useEffect(() => {
    if (!payload) {
      setThemes(undefined);
      return;
    }

    let cancelled = false;

    loadInterpretation(payload).then((result) => {
      if (cancelled) {
        return;
      }

      setThemes(result?.themes);
    });

    return () => {
      cancelled = true;
    };
  }, [payload]);

  const allowed = payload ? canEnterMatching(payload) : false;
  const snapshot = createMatchingSnapshot(answers);
  const preferences = buildMatchingPreferences(snapshot.answers);
  const matches =
    payload && allowed && preferences
      ? matchTherapists(payload, preferences, themes)
      : null;

  function handleSelect(value: string) {
    if (!snapshot.currentQuestion) {
      return;
    }

    const nextAnswers = appendAnswer(answers, snapshot.currentQuestion, value);
    setAnswers(nextAnswers);
    writeMatchingAnswers(nextAnswers);
  }

  function handleModifyPreferences() {
    resetMatchingPreferences();
    setAnswers([]);
    setDialog({ type: "closed" });
  }

  const isPreferenceThread = Boolean(
    payload && allowed && (!snapshot.isComplete || !matches),
  );
  const showingResults = Boolean(payload && allowed && matches);
  const visibleMatches = matches
    ? matches.featured.concat(matches.others)
    : [];
  const eligibleCount = visibleMatches.length;

  return (
    <div
      className={`flex flex-col ${
        isPreferenceThread ? "h-dvh overflow-hidden" : "min-h-dvh"
      }`}
    >
      <ConversationHeader
        backHref="/recommendation"
        width={showingResults ? "wide" : "reading"}
      />
      <SafetyNote />

      <main
        className={`relative isolate mx-auto flex min-h-0 w-full flex-1 flex-col px-5 pt-6 sm:px-8 ${
          showingResults ? "max-w-5xl pb-12" : "max-w-2xl"
        }`}
      >
        {!isReady ? (
          <SkeletonText lines={2} label="Loading therapist matching" />
        ) : !payload || !allowed ? (
          <EmptyState
            title="Therapist matching is available after counselling is suggested."
            body="This second stage stays behind the existing recommendation rules. Return to your next step, or start a new check-in if this visit has not been saved."
            actionHref="/recommendation"
            actionLabel="Return to recommendations"
          />
        ) : !snapshot.isComplete || !matches || !preferences ? (
          <ConversationRoom
            heading="A few preferences"
            currentStep={snapshot.currentStep}
            totalSteps={snapshot.totalSteps}
            label={snapshot.stageLabel}
            messages={snapshot.messages}
            currentQuestion={snapshot.currentQuestion}
            onSelect={handleSelect}
          />
        ) : (
          <div className="animate-page-enter">
            <div className="page-wash" aria-hidden />
            <header className="max-w-2xl">
              <h1 className="text-balance font-serif text-[2.15rem] leading-[1.1] tracking-tight text-ink sm:text-display">
                Your counsellor matches
              </h1>
              <p className="mt-2 text-body text-ink-soft">
                Based on your preferences
                <span className="text-ink-faint">
                  {" "}
                  · {eligibleCount}{" "}
                  {eligibleCount === 1 ? "profile" : "profiles"}
                </span>
              </p>
              <p className="mt-3 text-caption leading-relaxed text-ink-faint">
                Fictional profiles for this prototype, not actual YourDOST
                therapists.
              </p>
              {matches.concern.reliable ? null : (
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  No concern overlap was detected from the check-in note, so it
                  did not include, exclude, or prefer any profile.
                </p>
              )}
            </header>

            <div className="mt-6">
              <PreferencePills
                preferences={preferences}
                onModify={handleModifyPreferences}
              />
            </div>

            {eligibleCount === 0 ? (
              <Surface className="mt-8 max-w-xl">
                <h2 className="font-serif text-section text-ink">
                  No profiles met those preferences.
                </h2>
                <p className="mt-3 text-body leading-relaxed text-ink-soft">
                  Language, session mode and availability are applied as hard
                  filters first. Filters were not relaxed, and no extra
                  profiles were added.
                </p>
                <Button
                  variant="secondary"
                  className="mt-6 w-full sm:w-auto"
                  onClick={handleModifyPreferences}
                >
                  Edit preferences
                </Button>
              </Surface>
            ) : (
              <section className="mt-8">
                {eligibleCount < 3 ? (
                  <p className="mb-5 text-sm leading-relaxed text-ink-soft">
                    Only {eligibleCount}{" "}
                    {eligibleCount === 1 ? "profile" : "profiles"} passed those
                    filters. The list was not padded to three.
                  </p>
                ) : null}
                <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleMatches.map((match) => (
                    <TherapistCard
                      key={match.profile.id}
                      match={match}
                      preferences={preferences}
                      onOpen={() => setDialog({ type: "profile", match })}
                    />
                  ))}
                </div>
              </section>
            )}

            <div className="mt-10">
              <Link
                href="/recommendation"
                className={`${buttonClassName("secondary")} w-full sm:w-auto`}
              >
                Return to recommendations
              </Link>
            </div>

            <details className="mt-12 max-w-2xl text-caption leading-relaxed text-ink-faint">
              <summary className="cursor-pointer text-sm text-ink-soft">
                How matching works
              </summary>
              <p className="mt-3">
                Eligible profiles are filtered by language, session mode and
                availability, then ranked with illustrative weights: 40%
                concern overlap, 25% listed experience, 20% counselling style
                and 15% availability. Listed experience is a prototype
                assumption, not a measure of clinical quality or outcomes.
                Matching scores are unvalidated and are not a clinical
                suitability decision. Synthetic session feedback is shown
                below as a future review demo only and does not change this
                ranking.
              </p>
            </details>

            <FeedbackDemoPanel />
          </div>
        )}
      </main>

      {dialog.type === "profile" ? (
        <PrototypeDialog
          title={dialog.match.profile.name}
          subtitle={dialog.match.profile.title}
          onClose={() => setDialog({ type: "closed" })}
        >
          <div className="flex items-center gap-3">
            <TherapistMonogram name={dialog.match.profile.name} />
            <p className="text-caption leading-relaxed text-ink-faint">
              Fictional illustrative profile
            </p>
          </div>
          <ul
            className="flex flex-wrap gap-1.5"
            aria-label="Session details"
          >
            {[
              ...dialog.match.profile.sessionModes,
              ...dialog.match.profile.languages,
              ...dialog.match.profile.availability,
            ].map((pill) => (
              <li
                key={pill}
                className="rounded-full bg-canvas px-2.5 py-1 text-caption text-ink-soft"
              >
                {pill}
              </li>
            ))}
          </ul>
          <p>{dialog.match.profile.summary}</p>
          <p>{dialog.match.profile.detail}</p>
          {dialog.match.profile.clientGroups.length > 0 ? (
            <p>
              Client groups listed:{" "}
              {dialog.match.profile.clientGroups
                .map((group) => group.replaceAll("-", " "))
                .join(", ")}
              .
            </p>
          ) : null}
          <p>{dialog.match.profile.professionalScope}</p>
          <p>{dialog.match.profile.referralBoundaries}</p>
          <p>
            Listed experience: {dialog.match.profile.yearsExperience} years
            (illustrative). This is profile information, not a validated
            measure of quality or outcomes.
          </p>
          <p>{dialog.match.explanation}</p>
          <p>
            This is a fictional illustrative profile used for the prototype. It
            is not an actual YourDOST therapist, booking link or clinical
            recommendation.
          </p>
        </PrototypeDialog>
      ) : null}
    </div>
  );
}
