import type { Metadata } from "next";
import { RecommendationExperience } from "@/components/recommendation/RecommendationExperience";

export const metadata: Metadata = {
  title: "Your next step | YourDOST Wellbeing Navigator",
  description:
    "A suggested next step based on your check-in answers. This is a product navigation aid, not a clinical assessment.",
};

export default function RecommendationPage() {
  return <RecommendationExperience />;
}
