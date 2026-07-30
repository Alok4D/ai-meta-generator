import Testimonials from "../_components/Testimonial";
import CTA from "../_components/CTA";

export default function TestimonialsPage() {
  return (
    <>
      <Testimonials />
      <CTA 
        title="Join the community"
        subtitle="Start generating better metadata today — for free."
        buttonText="Get Started Free"
      />
    </>
  );
}
