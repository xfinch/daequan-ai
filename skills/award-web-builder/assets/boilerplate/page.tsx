import { Hero } from "@/components/hero";
import { Navigation } from "@/components/navigation";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="relative">
      <Navigation />
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
