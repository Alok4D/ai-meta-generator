import Intro from "./_components/Intro";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import Benefits from "./_components/Benefits";
import HowItWorks from "./_components/HowItWorks";
import Testimonials from "./_components/Testimonial";
import Pricing from "./_components/Pricing";
import Comparison from "./_components/Comparison";
import FAQ from "./_components/FAQ";
import CTA from "./_components/CTA";

export default function page() {
  return (
    <>
      <Navbar />
      <Intro />
      <Benefits/>
      <HowItWorks/>
      <Testimonials/>
      <Pricing/>
      <Comparison/>
      <FAQ/>
      <CTA/>  
      <Footer/>
    </>
  );
}
