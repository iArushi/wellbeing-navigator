"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ConversationHeader } from "@/components/conversation/ConversationHeader";
import { ConversationRoom } from "@/components/conversation/ConversationRoom";
import { SafetyNote } from "@/components/conversation/SafetyNote";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonText } from "@/components/ui/SkeletonText";
import { Surface } from "@/components/ui/Surface";
import {
  readAnswers,
  readInitialConcern,
  saveCheckInPayload,
  writeAnswers,
} from "@/lib/checkInStorage";
import {
  appendAnswer,
  scriptedConversationGuide,
} from "@/lib/conversation/engine";
import { buildCheckInPayload } from "@/lib/recommendation/answers";
import type { ConversationAnswer } from "@/lib/conversation/types";

export function ConversationExperience() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [initialConcern, setInitialConcern] = useState<string | null>(null);
  const [answers, setAnswers] = useState<ConversationAnswer[]>([]);

  useEffect(() => {
    setInitialConcern(readInitialConcern());
    setAnswers(readAnswers());
    setIsReady(true);
  }, []);

  const snapshot = initialConcern
    ? scriptedConversationGuide.buildSnapshot(initialConcern, answers)
    : null;

  function handleSeeRecommendation() {
    writeAnswers(answers);

    if (initialConcern) {
      const payload = buildCheckInPayload(initialConcern, answers);
      if (payload) {
        saveCheckInPayload(payload);
      }
    }

    router.push("/recommendation");
  }

  function handleSelect(value: string) {
    if (!snapshot?.currentQuestion) {
      return;
    }

    const nextAnswers = appendAnswer(answers, snapshot.currentQuestion, value);
    setAnswers(nextAnswers);
    writeAnswers(nextAnswers);
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <ConversationHeader />
      <SafetyNote />

      <main className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-5 pt-6 sm:px-8">
        {!isReady ? (
          <SkeletonText lines={2} label="Loading your check-in" />
        ) : !snapshot ? (
          <EmptyState
            title="We couldn't find your check-in."
            body="Start from the beginning and tell us what's been on your mind. Nothing has been saved from this visit."
            actionHref="/"
            actionLabel="Return to check-in"
          />
        ) : (
          <ConversationRoom
            heading="A few gentle questions"
            currentStep={snapshot.currentStep}
            totalSteps={snapshot.totalSteps}
            label={snapshot.stageLabel}
            messages={snapshot.messages}
            currentQuestion={snapshot.currentQuestion}
            onSelect={handleSelect}
            footer={
              <Surface className="mb-8 animate-fade-rise">
                <Button
                  onClick={handleSeeRecommendation}
                  className="w-full sm:w-auto"
                >
                  See my recommended next step
                </Button>
              </Surface>
            }
          />
        )}
      </main>
    </div>
  );
}
