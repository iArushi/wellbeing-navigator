import Link from "next/link";
import { AppHeader } from "@/components/ui/AppHeader";
import { buttonClassName } from "@/components/ui/Button";

type ConversationHeaderProps = {
  backHref?: "/recommendation" | "/";
  width?: "wide" | "reading";
};

export function ConversationHeader({
  backHref = "/",
  width = "reading",
}: ConversationHeaderProps) {
  return (
    <AppHeader
      width={width}
      trailing={
        <Link href={backHref} className={buttonClassName("secondary")}>
          Back
        </Link>
      }
    />
  );
}
