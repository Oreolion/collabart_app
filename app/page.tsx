import About from "@/components/About";
import AIFeaturesSection from "@/components/AIFeaturesSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import ForthSection from "@/components/ForthSection";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Navbar from "@/components/Navbar";
import PricingSection from "@/components/PricingSection";
import Testimonials from "@/components/Testimonials";
import ThirdSection from "@/components/ThirdSection";

export default function Home() {
  return (
    <div className="ambient-bg noise-overlay">
      <Navbar />
      <Hero />
      <About />
      <HowItWorks />
      <ThirdSection />
      <AIFeaturesSection />
      <Testimonials />
      <PricingSection />
      <FAQSection />
      <ForthSection />
      <Footer />
    </div>
  );
}
