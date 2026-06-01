import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Problem, SixPlanes } from "@/components/problem";
import { CacheSemantics } from "@/components/cache-semantics";
import { Comparison } from "@/components/comparison";
import { Architecture } from "@/components/architecture";
import { MetricsChart } from "@/components/metrics-chart";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <Reveal><Problem /></Reveal>
        <Reveal><SixPlanes /></Reveal>
        <Reveal><CacheSemantics /></Reveal>
        <Reveal><Architecture /></Reveal>
        <Reveal><MetricsChart /></Reveal>
        <Reveal><Comparison /></Reveal>
        <Footer />
      </main>
    </>
  );
}
