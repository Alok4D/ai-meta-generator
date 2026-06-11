import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";
import Features from "../_components/Features";
import CTA from "../_components/CTA";

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <Features />
      <CTA 
        title="Ready to supercharge your metadata?"
        subtitle="Start generating AI-powered metadata for free today."
        buttonText="Get Started Free"
      />
      <Footer />
    </>
  );
}
