import About from "@/components/About";
import Footer from "@/components/Footer";
import ForthSection from "@/components/ForthSection";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import ThirdSection from "@/components/ThirdSection";

export default function Home() {
  return (
    <div className="">
      <Navbar></Navbar>
      <Hero></Hero>
      <About></About>
      <ThirdSection></ThirdSection>
      <ForthSection></ForthSection>
      <Footer></Footer>
    </div>
  );
}
