import { Eyebrow } from "@/components/ui/Eyebrow";

export function Hero() {
  return (
    <section className="animate-fade-rise max-w-xl">
      <Eyebrow tone="sage">A private check-in</Eyebrow>
      <h1 className="mt-4 font-serif text-4xl leading-[1.12] tracking-tight text-ink text-balance sm:text-5xl lg:text-display">
        A little check-in can go a long way.
      </h1>
      <p className="mt-5 text-body text-pretty text-ink-soft sm:text-lg">
        You don&apos;t have to figure everything out right now. Tell us
        what&apos;s been going on, and we&apos;ll help you explore a useful
        next step.
      </p>
    </section>
  );
}
