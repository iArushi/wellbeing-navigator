import type { Metadata } from "next";
import { MatchingExperience } from "@/components/matching/MatchingExperience";

export const metadata: Metadata = {
  title: "Therapist matching | YourDOST Wellbeing Navigator",
  description:
    "Illustrative therapist matching based on your counselling recommendation and preferences. This is a product navigation aid, not a clinical assessment.",
};

export default function MatchingPage() {
  return <MatchingExperience />;
}
