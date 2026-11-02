import { buildFeedbackDemonstration } from "@/lib/matching/feedbackDemo";

export function FeedbackDemoPanel() {
  const demo = buildFeedbackDemonstration();

  return (
    <section className="mt-10 max-w-2xl border-t border-line/80 pt-8">
      <p className="text-eyebrow font-medium tracking-[0.16em] text-ink-faint uppercase">
        Demonstration only
      </p>
      <h2 className="mt-3 font-serif text-section text-ink">
        How session feedback could review matching later
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        {demo.disclosure}
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-caption text-ink-faint">Synthetic records</dt>
          <dd className="mt-1 font-medium text-ink">{demo.totalRecords}</dd>
        </div>
        <div>
          <dt className="text-caption text-ink-faint">Felt understood</dt>
          <dd className="mt-1 font-medium text-ink">
            {demo.feltUnderstoodShare}%
          </dd>
        </div>
        <div>
          <dt className="text-caption text-ink-faint">Would continue</dt>
          <dd className="mt-1 font-medium text-ink">
            {demo.willingToContinueShare}%
          </dd>
        </div>
        <div>
          <dt className="text-caption text-ink-faint">Approach fit</dt>
          <dd className="mt-1 font-medium text-ink">
            {demo.approachFit.good} good · {demo.approachFit.mixed} mixed ·{" "}
            {demo.approachFit.poor} poor
          </dd>
        </div>
      </dl>
    </section>
  );
}
