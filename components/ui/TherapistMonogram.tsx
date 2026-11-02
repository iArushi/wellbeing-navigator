type TherapistMonogramProps = {
  name: string;
  className?: string;
};

export function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function TherapistMonogram({
  name,
  className = "",
}: TherapistMonogramProps) {
  return (
    <span
      aria-hidden
      className={`inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-plum-mist font-serif text-section text-plum-deep ${className}`.trim()}
    >
      {initialsFromName(name)}
    </span>
  );
}
