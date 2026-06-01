import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Problem, SixPlanes } from "@/components/problem";
import { UseCases } from "@/components/use-cases";
import { Architecture } from "@/components/architecture";
import { Performance } from "@/components/performance";
import { Comparison } from "@/components/comparison";
import { Pricing } from "@/components/pricing";
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
        <Reveal><UseCases /></Reveal>
        <Reveal><Architecture /></Reveal>
        <Reveal><Performance /></Reveal>
        <Reveal><Comparison /></Reveal>
        <Reveal><Pricing /></Reveal>
        <Footer />
      </main>
    </>
  );
}
