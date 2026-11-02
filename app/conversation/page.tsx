import type { Metadata } from "next";
import { ConversationExperience } from "@/components/conversation/ConversationExperience";

export const metadata: Metadata = {
  title: "Your check-in | YourDOST Wellbeing Navigator",
  description:
    "A private follow-up conversation to help you explore a useful next step.",
};

export default function ConversationPage() {
  return <ConversationExperience />;
}
