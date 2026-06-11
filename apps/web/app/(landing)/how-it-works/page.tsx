import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";
import HowItWorks from "../_components/HowItWorks";
import CTA from "../_components/CTA";

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <HowItWorks />
      <CTA 
        title="Simple enough? Let's get started."
        subtitle="Try CSVNest for free — no credit card required."
        buttonText="Start for Free"
      />
      <Footer />
    </>
  );
}
