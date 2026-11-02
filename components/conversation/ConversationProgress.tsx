type ConversationProgressProps = {
  currentStep: number;
  totalSteps: number;
  label: string;
  heading: string;
};

export function ConversationProgress({
  currentStep,
  totalSteps,
  label,
  heading,
}: ConversationProgressProps) {
  return (
    <div aria-label={label} className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-caption font-medium tracking-[0.12em] text-ink-faint uppercase">
          {heading}
        </p>
        <p className="sr-only">{label}</p>
        <p className="text-caption text-ink-faint">
          {currentStep} of {totalSteps}
        </p>
      </div>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={currentStep}
        aria-valuetext={label}
        className="flex gap-1.5"
      >
        {Array.from({ length: totalSteps }, (_, index) => {
          const reached = index < currentStep;

          return (
            <span
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                reached ? "bg-plum" : "bg-plum-mist"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
