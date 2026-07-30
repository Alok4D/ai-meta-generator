import HowItWorks from "./_components/HowItWorks";
import Testimonials from "./_components/Testimonial";
import CTA from "./_components/CTA";
import Hero from "./_components/Intro";
import Stats from "./_components/Stats";
import Features from "./_components/Features";
import LandingPricing from "./_components/LandingPricing";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Stats />
      <Features limit={6} />
      {/* pricing section */}
      <LandingPricing />
      <HowItWorks variant="landing" />
      <Testimonials variant="landing" />
      <CTA/>
    </>
  );
}
