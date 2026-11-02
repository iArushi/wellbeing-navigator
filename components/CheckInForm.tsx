"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { TopicChips } from "@/components/TopicChips";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";
import { startCheckIn } from "@/lib/checkInStorage";
import { TOPIC_CHIPS, toggleTopic } from "@/lib/topics";

export function CheckInForm() {
  const router = useRouter();
  const [text, setText] = useState("");

  const isEmpty = text.trim().length === 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextStepNote = text.trim();
    if (!nextStepNote) {
      return;
    }

    startCheckIn(nextStepNote);
    router.push("/conversation");
  }

  return (
    <Surface tone="raised" className="animate-fade-rise">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="check-in"
            className="block font-serif text-section text-ink sm:text-3xl"
          >
            What&apos;s been on your mind lately?
          </label>
          <p
            id="check-in-hint"
            className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-base"
          >
            There&apos;s no right or wrong way to describe it.
          </p>
        </div>

        <textarea
          id="check-in"
          name="checkIn"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="I've been feeling overwhelmed because..."
          aria-describedby="check-in-hint"
          rows={8}
          className="min-h-44 w-full resize-y rounded-2xl border border-line bg-canvas px-4 py-4 text-body leading-relaxed text-ink placeholder:text-ink-faint focus:border-plum focus:outline-none focus:ring-2 focus:ring-lavender-mid"
        />

        <div>
          <p className="mb-3 text-caption text-ink-faint">You could start with</p>
          <TopicChips
            topics={TOPIC_CHIPS}
            value={text}
            onToggle={(topic) => setText((current) => toggleTopic(current, topic))}
          />
        </div>

        <div>
          <Button type="submit" disabled={isEmpty} className="w-full sm:w-auto">
            Find my next step
          </Button>
          <p className="mt-3 text-caption leading-relaxed text-ink-faint">
            A few gentle questions come next.
          </p>
        </div>
      </form>
    </Surface>
  );
}
