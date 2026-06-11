
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import HowItWorks from "./_components/HowItWorks";
import Testimonials from "./_components/Testimonial";
import CTA from "./_components/CTA";
import Hero from "./_components/Intro";
import Stats from "./_components/Stats";
import Features from "./_components/Features";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <Features limit={6} />
      <HowItWorks variant="landing" />
      <Testimonials/>
      <CTA/>
      <Footer/>
    </>
  );
}
