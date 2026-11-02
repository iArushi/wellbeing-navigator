"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ConversationHeader } from "@/components/conversation/ConversationHeader";
import { SafetyNote } from "@/components/conversation/SafetyNote";
import { InsightCard } from "@/components/recommendation/InsightCard";
import { PrototypeDialog } from "@/components/recommendation/PrototypeDialog";
import { RecommendationCard } from "@/components/recommendation/RecommendationCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SkeletonText } from "@/components/ui/SkeletonText";
import { Surface } from "@/components/ui/Surface";
import { readCheckInPayload, resetCheckIn } from "@/lib/checkInStorage";
import { resetMatchingPreferences } from "@/lib/matching/storage";
import { recommendNextStep } from "@/lib/recommendation/engine";
import {
  FALLBACK_SUMMARY,
  loadInterpretation,
} from "@/lib/recommendation/interpretation";
import type { CatalogueItem, CheckInPayload } from "@/lib/recommendation/types";

type InterpretationState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "ready";
      summary: string;
      supportNeed: string;
      personalizedMessage: string;
      themes: string[];
    }
  | { status: "fallback" };

type DialogState =
  | { type: "closed" }
  | { type: "item"; item: CatalogueItem }
  | { type: "support" };

export function RecommendationExperience() {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const [payload, setPayload] = useState<CheckInPayload | null>(null);
  const [dialog, setDialog] = useState<DialogState>({ type: "closed" });
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);
  const [interpretation, setInterpretation] = useState<InterpretationState>({
    status: "idle",
  });

  useEffect(() => {
    setPayload(readCheckInPayload());
    setIsReady(true);
  }, [pathname]);

  useEffect(() => {
    if (!payload) {
      setInterpretation({ status: "idle" });
      return;
    }

    let cancelled = false;
    setInterpretation({ status: "loading" });

    loadInterpretation(payload).then((result) => {
      if (cancelled) {
        return;
      }

      setInterpretation(
        result
          ? { status: "ready", ...result }
          : { status: "fallback" },
      );
    });

    return () => {
      cancelled = true;
    };
  }, [payload]);

  function handleRestart() {
    resetCheckIn();
    resetMatchingPreferences();
    router.push("/");
  }

  const recommendation = payload ? recommendNextStep(payload) : null;
  const isInterpretationLoading =
    interpretation.status === "loading" || interpretation.status === "idle";
  const summaryText =
    interpretation.status === "ready"
      ? interpretation.summary
      : FALLBACK_SUMMARY;
  const personalizedMessage =
    interpretation.status === "ready"
      ? interpretation.personalizedMessage
      : null;
  const supportNeed =
    interpretation.status === "ready" && interpretation.supportNeed
      ? interpretation.supportNeed
      : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <ConversationHeader />
      <SafetyNote />

      <main className="relative isolate mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-8 sm:px-8 sm:py-12">
        <div className="page-wash" aria-hidden />
        {!isReady ? (
          <SkeletonText lines={2} label="Loading your recommendation" />
        ) : !recommendation || !payload ? (
          <EmptyState
            title="We couldn't find your check-in."
            body="A recommendation needs your original note and the follow-up answers from this visit. You can start again whenever you are ready."
            actionHref="/"
            actionLabel="Restart the check-in"
          />
        ) : (
          <div className="animate-page-enter">
            <header className="max-w-3xl border-b border-line/70 pb-8">
              <Eyebrow tone="sage">A suggested next step</Eyebrow>
              <h1 className="mt-4 text-balance font-serif text-[2.15rem] leading-[1.1] tracking-tight text-ink sm:text-display">
                Here&apos;s a good place to start.
              </h1>
              <p className="mt-4 max-w-xl text-body leading-relaxed text-ink-soft">
                A quiet reading of what you shared, then one useful next step.
              </p>
            </header>

            <div className="mt-10 flex flex-col gap-10 lg:mt-14 lg:grid lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)] lg:items-start lg:gap-x-16 lg:gap-y-10">
              <div className="order-1 space-y-8">
                <InsightCard
                  label="What we heard"
                  loading={isInterpretationLoading}
                  loadingLabel="Reflecting on what you shared"
                >
                  {summaryText}
                </InsightCard>
                {supportNeed ? (
                  <InsightCard label="What you're looking for" tone="mist">
                    {supportNeed}
                  </InsightCard>
                ) : null}
              </div>

              <div className="order-2 lg:col-start-2 lg:row-start-1">
                <RecommendationCard
                  item={recommendation.primary}
                  featured
                  actionLabel="Open this option"
                  onOpen={() =>
                    setDialog({ type: "item", item: recommendation.primary })
                  }
                  secondaryAction={
                    recommendation.primary.id === "counselling"
                      ? {
                          label: "Find a suitable therapist",
                          onClick: () => router.push("/matching"),
                        }
                      : undefined
                  }
                />
              </div>

              <div className="order-3 lg:col-start-2 lg:row-start-2">
                {isInterpretationLoading ? (
                  <p
                    className="font-serif text-base leading-relaxed text-ink-soft italic"
                    aria-live="polite"
                  >
                    <span className="inline-block animate-pulse">
                      Preparing a short note to go with this option...
                    </span>
                  </p>
                ) : personalizedMessage ? (
                  <p className="max-w-xl font-serif text-base leading-relaxed text-ink-soft italic">
                    {personalizedMessage}
                  </p>
                ) : null}
              </div>

              <div className="order-4 lg:col-start-1 lg:row-start-2">
                <InsightCard label="Why this was suggested" tone="sage">
                  {recommendation.explanation}
                </InsightCard>
              </div>
            </div>

            <section className="mt-16 sm:mt-20">
              <Eyebrow>Also available</Eyebrow>
              <h2 className="mt-3 font-serif text-section text-ink">
                Other support you could explore
              </h2>
              <div className="mt-2 border-b border-line/80">
                {recommendation.alternatives.map((item) => (
                  <RecommendationCard
                    key={item.id}
                    item={item}
                    actionLabel="Learn more"
                    onOpen={() => setDialog({ type: "item", item })}
                  />
                ))}
              </div>
            </section>

            {recommendation.offerOptionalHumanSupport ? (
              <Surface tone="sage" className="mt-10">
                <h2 className="font-serif text-section text-ink">
                  Optional human support
                </h2>
                <p className="mt-2 text-body leading-relaxed text-ink-soft">
                  You said daily life feels significantly affected, and you
                  preferred not to explore counselling right now. That choice
                  stays yours. Human support remains available if you want it.
                </p>
                <Button
                  className="mt-5 w-full sm:w-auto"
                  onClick={() => setDialog({ type: "support" })}
                >
                  Need human support?
                </Button>
              </Surface>
            ) : null}

            <section className="mt-14 border-t border-line/80 pt-8">
              <h2 className="font-serif text-section text-ink">
                Was this recommendation helpful?
              </h2>
              {feedback ? (
                <p
                  className="mt-3 text-body leading-relaxed text-ink-soft"
                  aria-live="polite"
                >
                  Thank you. Your feedback stays on this device and has not
                  been sent anywhere.
                </p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="chip"
                    onClick={() => setFeedback("yes")}
                  >
                    Yes
                  </Button>
                  <Button variant="chip" onClick={() => setFeedback("no")}>
                    No
                  </Button>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button onClick={handleRestart} className="w-full sm:w-auto">
                  Restart the check-in
                </Button>
                {!recommendation.offerOptionalHumanSupport ? (
                  <Button
                    variant="secondary"
                    onClick={() => setDialog({ type: "support" })}
                    className="w-full sm:w-auto"
                  >
                    Need human support?
                  </Button>
                ) : null}
              </div>
            </section>
          </div>
        )}
      </main>

      {dialog.type === "item" ? (
        <PrototypeDialog
          title={dialog.item.title}
          onClose={() => setDialog({ type: "closed" })}
        >
          <p>{dialog.item.detail}</p>
          <p>
            This is an illustrative YourDOST offering used for the prototype. It
            is not a verified live service, booking link or clinical
            recommendation.
          </p>
        </PrototypeDialog>
      ) : null}

      {dialog.type === "support" ? (
        <PrototypeDialog
          title="Need human support?"
          onClose={() => setDialog({ type: "closed" })}
        >
          <p>
            If you would like to talk to someone, you can contact a qualified
            counsellor through your organisation&apos;s wellbeing support.
          </p>
          <p>
            If you feel unsafe or need urgent help, reach out to a trusted
            person or appropriate local emergency support.
          </p>
          <p>
            This prototype does not provide helpline numbers, booking, medical
            advice or a confidential clinical service.
          </p>
        </PrototypeDialog>
      ) : null}
    </div>
  );
}
