import { Navigation } from "@/components/navigation";
import { Hero } from "@/components/hero";
import { ProblemSolution } from "@/components/problem-solution";
import { Differentiators } from "@/components/differentiators";
import { Services } from "@/components/services";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="relative">
      <Navigation />
      <Hero />
      <ProblemSolution />
      <Differentiators />
      <Services />
      <CTA />
      <Footer />
    </main>
  );
}
