import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="">
      <Navbar></Navbar>
      <div className="h-[18rem]"></div>
      <Button>Click me</Button>
      <Footer></Footer>
    </div>
  );
}
