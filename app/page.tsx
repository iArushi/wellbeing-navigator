import { CheckInForm } from "@/components/CheckInForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="relative isolate mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-5 py-8 sm:px-8 sm:py-12 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,32rem)] lg:items-center lg:gap-16 lg:py-16">
        <div className="page-wash" aria-hidden />
        <Hero />
        <CheckInForm />
      </main>
      <Footer />
    </div>
  );
}
