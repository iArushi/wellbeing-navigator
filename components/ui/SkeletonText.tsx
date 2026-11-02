type SkeletonTextProps = {
  lines?: 1 | 2 | 3;
  label?: string;
};

export function SkeletonText({
  lines = 2,
  label = "Loading",
}: SkeletonTextProps) {
  return (
    <span
      className="flex flex-col gap-2"
      aria-busy="true"
      aria-label={label}
      role="status"
    >
      {Array.from({ length: lines }, (_, index) => (
        <span
          key={index}
          className={`animate-skeleton block h-3 rounded-full ${
            index === lines - 1 ? "w-2/3" : "w-full"
          }`}
        />
      ))}
    </span>
  );
}
